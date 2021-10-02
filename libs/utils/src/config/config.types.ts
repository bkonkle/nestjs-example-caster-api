import convict from 'convict'

import {InjectionToken} from '../injection'

export interface Schema {
  env: string
  port: number
  db: {
    host: string
    username: string
    password: string
    name: string
    port: number
    url: string
    debug: boolean
    pool: {
      min: number | null
      max: number | null
    }
  }
  redis: {
    url: string
  }
  auth: {
    url: string
    audience: string
    client: {
      id: string | null
      secret: string | null
    }
    test: {
      user: {
        username: string | null
        password: string | null
      }
      alt: {
        username: string | null
        password: string | null
      }
    }
  }
}

export type Config = convict.Config<Schema>

export const Config: InjectionToken<Config> = 'CONVICT_CONFIG'
