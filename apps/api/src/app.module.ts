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
  EpisodeRoles,
} from '@caster/shows'
import {AuthzModule} from '@caster/authz'
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
    EventsModule.forRoot(),
    AuthzModule.forRoot({
      rules: [UserRules, ProfileRules, ShowRules, EpisodeRules],
    }),
    RolesModule.forRoot({
      roles: [...ShowRoles.roles, ...EpisodeRoles.roles],
      permissions: [...ShowRoles.permissions, ...EpisodeRoles.permissions],
    }),
    UsersModule,
    ProfilesModule,
    ShowsModule,
    EpisodesModule,
  ],
  providers: [Logger],
  controllers: [AppController],
})
export class AppModule {}
