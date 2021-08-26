import {Module} from '@nestjs/common'

import {PrismaModule} from '@caster/utils'

import {UsersModule} from '../users/users.module'
import {ProfileAuthz} from './profile.authz'
import {ProfilesResolver} from './profiles.resolver'
import {ProfilesService} from './profiles.service'

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [ProfilesResolver, ProfileAuthz, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
