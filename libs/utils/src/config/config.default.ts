import convict from 'convict'
import json from 'json5'

import {Schema} from './config.types'

convict.addParser({extension: 'json', parse: json.parse})

export const schema: convict.Schema<Schema> = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind to.',
    format: 'port',
    default: 4000,
    env: 'PORT',
    arg: 'port',
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: String,
      default: 'localhost',
      env: 'DATABASE_HOSTNAME',
    },
    username: {
      doc: 'Database username',
      format: String,
      default: 'caster',
      env: 'DATABASE_USERNAME',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'caster',
      env: 'DATABASE_PASSWORD',
      sensitive: true,
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'caster',
      env: 'DATABASE_NAME',
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 1701,
      env: 'DATABASE_PORT',
    },
    url: {
      doc: 'Database url',
      format: String,
      default: 'postgresql://caster:caster@localhost:1701/caster',
      env: 'DATABASE_URL',
      arg: 'db-url',
    },
    debug: {
      doc: 'Database debug logging',
      format: Boolean,
      default: false,
      env: 'DATABASE_DEBUG_LOGGING',
      arg: 'db-debug',
    },
    pool: {
      min: {
        doc: 'Database pool min',
        format: 'int',
        default: null,
        env: 'DATABASE_POOL_MIN',
        arg: 'db-min',
      },
      max: {
        doc: 'Database pool max',
        format: 'int',
        default: null,
        env: 'DATABASE_POOL_MAX',
        arg: 'db-max',
      },
    },
  },
  redis: {
    url: {
      doc: 'Redis url',
      format: String,
      default: 'localhost:6379',
      env: 'REDIS_URL',
      arg: 'redis-url',
    },
  },
  auth: {
    domain: {
      doc: 'OAuth2 domain',
      format: String,
      default: 'caster-dev.auth0.com',
      env: 'OAUTH2_DOMAIN',
    },
    audience: {
      doc: 'OAuth2 audience',
      format: String,
      default: 'localhost',
      env: 'OAUTH2_AUDIENCE',
    },
    client: {
      id: {
        doc: 'OAuth2 client id',
        format: String,
        default: null,
        env: 'OAUTH2_CLIENT_ID',
      },
      secret: {
        doc: 'OAuth2 client secret',
        format: String,
        default: null,
        env: 'OAUTH2_CLIENT_SECRET',
        sensitive: true,
      },
    },
  },
}

export const config = convict(schema)
