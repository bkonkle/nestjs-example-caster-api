import {Module} from '@nestjs/common'

import {AbilityModule} from '@caster/authz'

import {UsersModule} from '../users/users.module'
import {ProfileRules} from './profile.rules'
import {ProfilesResolver} from './profiles.resolver'
import {ProfilesService} from './profiles.service'

@Module({
  imports: [AbilityModule, UsersModule],
  providers: [ProfileRules, ProfilesResolver, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
