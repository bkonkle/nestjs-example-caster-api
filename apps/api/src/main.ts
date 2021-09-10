import bodyParser from 'body-parser'
import chalk from 'chalk'
import {INestApplication, ValidationPipe, Logger} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'

import {AppModule} from './app.module'

const APP_NAME = 'Caster'

export async function init(): Promise<INestApplication> {
  const {NODE_ENV} = process.env

  const app = await NestFactory.create(AppModule)

  const environment = NODE_ENV || 'production'
  const isDev = environment === 'development'

  app.use(bodyParser.json({limit: '50mb'}))
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({disableErrorMessages: !isDev}))

  return app
}

async function bootstrap(): Promise<void> {
  const {PORT} = process.env

  const app = await init()

  const port = PORT || '3000'

  app.startAllMicroservices()

  await app.listen(Number(port), () => {
    Logger.log(
      chalk.cyan(
        `${chalk.yellow(`[${APP_NAME}]`)} started at: ${chalk.green(
          `http://localhost:${chalk.yellow(port)}`
        )}`
      )
    )

    Logger.log(
      chalk.cyan(
        `${chalk.yellow('[GraphQL]')} available at: ${chalk.green(
          `http://localhost:${chalk.yellow(port)}/graphql`
        )}`
      )
    )
  })
}

bootstrap()
