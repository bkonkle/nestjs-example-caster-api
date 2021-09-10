import {join} from 'path'
import {Module, Logger} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {GraphQLModule} from '@nestjs/graphql'
import {PrismaModule} from 'nestjs-prisma'

import {AuthnModule} from '@caster/authn'
import {ConfigModule, HealthModule} from '@caster/utils'
import {UsersModule, ProfilesModule} from '@caster/users'
import {ShowsModule} from '@caster/shows'

const env = process.env.NODE_ENV || 'production'
const isDev = env === 'development'
const isTest = env === 'test'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {log: isTest ? ['warn'] : ['info']},
        explicitConnect: true,
      },
    }),
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
    ShowsModule,
  ],
  providers: [Logger],
})
export class AppModule {}
