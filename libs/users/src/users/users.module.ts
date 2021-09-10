import {Module} from '@nestjs/common'

import {AbilityModule} from '@caster/authz'

import {UserRules} from './user.rules'
import {UsersResolver} from './users.resolver'
import {UsersService} from './users.service'

@Module({
  imports: [AbilityModule],
  providers: [UserRules, UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
