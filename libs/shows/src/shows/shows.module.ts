import {Module} from '@nestjs/common'

import {UsersModule} from '@caster/users'

import {ShowsResolver} from './shows.resolver'
import {ShowsService} from './shows.service'

@Module({
  imports: [UsersModule],
  providers: [ShowsResolver, ShowsService],
  exports: [ShowsService],
})
export class ShowsModule {}
