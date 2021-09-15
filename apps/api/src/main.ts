import bodyParser from 'body-parser'
import chalk from 'chalk'
import morgan from 'morgan'
import {INestApplication, ValidationPipe, Logger} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'

import {AppModule} from './app.module'

export async function init(): Promise<INestApplication> {
  const {NODE_ENV} = process.env

  const app = await NestFactory.create(AppModule)

  const environment = NODE_ENV || 'production'
  const isDev = environment === 'development'
  const isTest = environment === 'test'

  if (isDev) {
    app.use(morgan('dev'))
  } else if (!isTest) {
    app.use(morgan('combined'))
  }

  app.use(bodyParser.json({limit: '50mb'}))
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({disableErrorMessages: !isDev}))

  return app
}

async function bootstrap(): Promise<void> {
  const {PORT} = process.env

  const app = await init()

  const port = PORT || '3000'

  const logger = new Logger('Caster')

  app.startAllMicroservices()

  await app.listen(Number(port), () => {
    logger.log(
      chalk.cyan(
        `Started at: ${chalk.green(`http://localhost:${chalk.yellow(port)}`)}`
      )
    )

    logger.log(
      chalk.cyan(
        `GraphQL at: ${chalk.green(
          `http://localhost:${chalk.yellow(port)}/graphql`
        )}`
      )
    )
  })
}

bootstrap()
