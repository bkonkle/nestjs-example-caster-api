import {Module, Logger} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {GraphQLModule} from '@nestjs/graphql'

import {ConfigModule, HealthModule, JsonScalar} from '@caster/utils'

const env = process.env.NODE_ENV || 'production'
const isDev = env === 'development'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot({
      debug: isDev,
      typePaths: ['./**/*.graphql'],
      resolvers: {JSON: JsonScalar},
      context: ({req}) => ({req}),
    }),
    ConfigModule,
    HealthModule,
  ],
  providers: [Logger],
})
export class AppModule {}
