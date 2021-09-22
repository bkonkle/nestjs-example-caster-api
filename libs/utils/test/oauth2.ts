import axios from 'axios'

import {Config, config as defaultConfig} from '../src/config'

export interface Credentials {
  token?: string
  username?: string
  email?: string
}

const credentials: Credentials = {}
const altCredentials: Credentials = {}

export const init = (config: Config = defaultConfig) => {
  beforeAll(async () => {
    if (!credentials.token) {
      try {
        const {
          data: {access_token: accessToken},
        } = await axios.post(
          `https://${config.get('auth.domain')}/oauth/token`,
          {
            grant_type: 'password',
            username: config.get('auth.test.user.username'),
            password: config.get('auth.test.user.password'),
            client_id: config.get('auth.client.id'),
            client_secret: config.get('auth.client.secret'),
            scope: 'openid profile email',
            audience: config.get('auth.audience'),
          }
        )
        credentials.token = accessToken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err.response.data)

        throw err
      }
    }

    if (!credentials.username || !credentials.email) {
      const {
        data: {sub, email},
      } = await axios.get(`https://${config.get('auth.domain')}/userinfo`, {
        headers: {Authorization: `Bearer ${credentials.token}`},
      })
      credentials.username = sub
      credentials.email = email
    }

    if (!altCredentials.token) {
      const {
        data: {access_token: altAccessToken},
      } = await axios.post(`https://${config.get('auth.domain')}/oauth/token`, {
        grant_type: 'password',
        username: config.get('auth.test.alt.username'),
        password: config.get('auth.test.alt.password'),
        client_id: config.get('auth.client.id'),
        client_secret: config.get('auth.client.secret'),
        scope: 'openid profile email',
        audience: config.get('auth.audience'),
      })
      altCredentials.token = altAccessToken
    }

    if (!altCredentials.username || !altCredentials.email) {
      const {
        data: {sub: altSub, email: altEmail},
      } = await axios.get(`https://${config.get('auth.domain')}/userinfo`, {
        headers: {Authorization: `Bearer ${altCredentials.token}`},
      })
      altCredentials.username = altSub
      altCredentials.email = altEmail
    }
  })

  return {
    credentials,
    altCredentials,
  }
}
