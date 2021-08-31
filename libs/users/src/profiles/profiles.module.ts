import {Module} from '@nestjs/common'

import {UsersModule} from '../users/users.module'
import {ProfilesResolver} from './profiles.resolver'
import {ProfilesService} from './profiles.service'

@Module({
  imports: [UsersModule],
  providers: [ProfilesResolver, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
