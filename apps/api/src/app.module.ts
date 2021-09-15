import {join} from 'path'
import {Module, Logger} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {GraphQLModule} from '@nestjs/graphql'
import {PrismaModule} from 'nestjs-prisma'

import {AuthnModule} from '@caster/authn'
import {ConfigModule, HealthModule} from '@caster/utils'
import {
  UsersModule,
  ProfilesModule,
  UserRules,
  ProfileRules,
} from '@caster/users'
import {
  ShowsModule,
  ShowRules,
  ShowRoles,
  EpisodesModule,
  EpisodeRules,
} from '@caster/shows'
import {AbilityModule} from '@caster/authz'
import {RolesModule} from '@caster/roles'
import {EventsModule} from '@caster/events'

import {AppController} from './app.controller'

const env = process.env.NODE_ENV || 'production'
const isDev = env === 'development'
const isTest = env === 'test'

@Module({
  imports: [
    AuthnModule,
    ConfigModule,
    HealthModule,
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
    UsersModule,
    ProfilesModule,
    ShowsModule,
    EpisodesModule,
    EventsModule,
    AbilityModule.forRoot({
      rules: [UserRules, ProfileRules, ShowRules, EpisodeRules],
    }),
    RolesModule.forRoot({
      roles: [...ShowRoles.roles],
      permissions: [...ShowRoles.permissions],
    }),
  ],
  providers: [Logger],
  controllers: [AppController],
})
export class AppModule {}
