import {join} from 'path'
import {Module, Logger} from '@nestjs/common'
import {ScheduleModule} from '@nestjs/schedule'
import {GraphQLModule} from '@nestjs/graphql'
import {PrismaModule} from 'nestjs-prisma'

import {AuthnModule} from '@caster/authn/authn.module'
import {ConfigModule} from '@caster/utils/config/config.module'
import {HealthModule} from '@caster/utils/health/health.module'
import {UsersModule} from '@caster/users/users.module'
import {UserRules} from '@caster/users/user.rules'
import {ProfilesModule} from '@caster/users/profiles/profiles.module'
import {ProfileRules} from '@caster/users/profiles/profile.rules'
import {ShowsModule} from '@caster/shows/shows.module'
import {ShowRules} from '@caster/shows/show.rules'
import {ShowRoles} from '@caster/shows/show.roles'
import {EpisodesModule} from '@caster/shows/episodes/episodes.module'
import {EpisodeRules} from '@caster/shows/episodes/episode.rules'
import {EpisodeRoles} from '@caster/shows/episodes/episode.roles'
import {AuthzModule} from '@caster/authz/authz.module'
import {RolesModule} from '@caster/roles/roles.module'
import {EventsModule} from '@caster/events/events.module'

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
