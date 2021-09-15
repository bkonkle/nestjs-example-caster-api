import {NextApiRequest, NextApiResponse} from 'next'
import {createProxyMiddleware} from 'http-proxy-middleware'
import jwt from 'next-auth/jwt'
import {Request, Response} from 'express'
import cookie from 'cookie'
import {IncomingMessage} from 'http'
import Debug from 'debug'

const debug = Debug('storyverse:web:api-proxy')

export interface Auth0Token {
  sub: string
  name: string
  email: string
  picture: string
  accessToken: string
  iat: number
  exp: number
}

const proxy = createProxyMiddleware({
  target: process.env.API_URL,
  changeOrigin: true,
  pathRewrite: {'^/api': ''},
  ws: true,
  onProxyReq: (proxyReq, req) => {
    const request = req as unknown as NextApiRequest
    const {body} = request

    debug(
      `[HPM] Proxying HTTP request to ${proxyReq.protocol}://${proxyReq.host}${proxyReq.path}`
    )

    proxyReq.write(typeof body === 'string' ? body : JSON.stringify(body))
    proxyReq.end()
  },
  onProxyReqWs: (
    proxyReq,
    req: IncomingMessage & {cookies?: Record<string, string>}
  ) => {
    const end = proxyReq.end

    proxyReq.end = () => {
      // skip this, because we want to wait for the token below
    }

    debug(
      `[HPM] Proxying WebSocket request to ${proxyReq.protocol}://${proxyReq.host}${proxyReq.path}`
    )

    const run = async () => {
      req.cookies = req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : undefined

      const token = await jwt.getToken({
        req: req as unknown as NextApiRequest,
        secret: process.env.OAUTH2_JWT_SECRET || '',
      })

      if (token) {
        proxyReq.setHeader('Authorization', `Bearer ${token.accessToken}`)
      }

      end.apply(proxyReq)
    }

    run().catch((err) => {
      console.error('proxyReqWs error:', err)
    })
  },
})

export default async function (
  req: NextApiRequest & {token?: jwt.JWT},
  res: NextApiResponse
) {
  const token = await jwt.getToken({
    req: req as NextApiRequest,
    secret: process.env.OAUTH2_JWT_SECRET || '',
  })
  if (token) req.headers['Authorization'] = `Bearer ${token.accessToken}`

  return new Promise<void>((resolve, reject) => {
    proxy(
      req as unknown as Request,
      res as unknown as Response,
      (result: unknown) => {
        if (result instanceof Error) {
          return reject(result)
        }

        return resolve()
      }
    )
  })
}
