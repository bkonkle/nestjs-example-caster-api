import {Module} from '@nestjs/common'

import {UsersModule} from '../users/users.module'
import {ProfileAuthz} from './profile.authz'
import {ProfilesResolver} from './profiles.resolver'
import {ProfilesService} from './profiles.service'

@Module({
  imports: [UsersModule],
  providers: [ProfilesResolver, ProfileAuthz, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
