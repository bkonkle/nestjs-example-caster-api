import {ExecutionContext, Optional} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {AuthModuleOptions} from '@nestjs/passport'

import {
  ALLOW_ANONYMOUS,
  AllowAnonymousMetadata,
  JwtGuard,
  getUsername,
} from '@caster/authn'
import {AbilityFactory} from '@caster/authz'

import {UsersService} from './users.service'
import {UserRequest} from './user.types'

export class UserGuard extends JwtGuard {
  constructor(
    protected readonly reflector: Reflector,
    private readonly users: UsersService,
    private readonly ability: AbilityFactory,
    @Optional() protected readonly options?: AuthModuleOptions
  ) {
    super(reflector, options)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context)
    const request = this.getRequest(context) as UserRequest

    const allowAnonymous =
      this.reflector.getAllAndOverride<AllowAnonymousMetadata>(
        ALLOW_ANONYMOUS,
        [context.getHandler(), context.getClass()]
      )

    // Should annotate the `jwt` if available
    if (!(await canActivate)) {
      return false
    }

    const username = getUsername(request)
    if (!username) {
      return allowAnonymous
    }

    const user = await this.users.getByUsername(username)
    if (!user) {
      return allowAnonymous
    }

    // Annotate the user object and the user's abilities on the request
    request.user = user
    request.ability = this.ability.createForUser(user)

    return true
  }
}
