import {Module} from '@nestjs/common'

import {PrismaModule} from '@caster/utils'

import {ProfilesResolver} from './profiles.resolver'
import {ProfilesService} from './profiles.service'

@Module({
  imports: [PrismaModule],
  providers: [ProfilesResolver, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
