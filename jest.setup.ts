import dotenv from 'dotenv'
import 'reflect-metadata'

process.env.NODE_ENV = 'test'

dotenv.config({path: 'apps/api/.env'})
