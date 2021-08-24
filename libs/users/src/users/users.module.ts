import {Module} from '@nestjs/common'

import {PrismaModule} from '@caster/utils'

import {UsersResolver} from './users.resolver'
import {UsersService} from './users.service'

@Module({
  imports: [PrismaModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
