import {join} from 'path'
import {Module, Logger} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {GraphQLModule} from '@nestjs/graphql'

import {AuthnModule, ConfigModule, HealthModule} from '@caster/utils'
import {UsersModule, ProfilesModule} from '@caster/users'

const env = process.env.NODE_ENV || 'production'
const isDev = env === 'development'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot({
      debug: isDev,
      autoSchemaFile: join(process.cwd(), 'schema.graphql'),
      context: ({req}) => ({req}),
    }),
    ConfigModule,
    HealthModule,
    AuthnModule,
    UsersModule,
    ProfilesModule,
  ],
  providers: [Logger],
})
export class AppModule {}
