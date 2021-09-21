import {Module} from '@nestjs/common'

import {EpisodesResolver} from './episodes.resolver'
import {EpisodesService} from './episodes.service'

@Module({
  providers: [EpisodesResolver, EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
