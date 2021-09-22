import {Request} from 'express'
import {Socket} from 'socket.io'
import {GraphQLExtensionStack} from 'graphql-extensions'

export interface JWT {
  jti: string // JWT id
  iss?: string // issuer
  aud?: string | string[] // audience
  sub?: string // subject
  iat?: number // issued at
  exp?: number // expires in
  nbf?: number // not before
}

export type JwtRequest = (Socket | Request) & {
  jwt?: JWT
}

export interface JwtContext {
  _extensionStack: GraphQLExtensionStack
  req: JwtRequest
}
