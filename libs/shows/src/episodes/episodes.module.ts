import {Module} from '@nestjs/common'

import {UsersModule} from '@caster/users'

import {EpisodesResolver} from './episodes.resolver'
import {EpisodesService} from './episodes.service'

@Module({
  imports: [UsersModule],
  providers: [EpisodesResolver, EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
