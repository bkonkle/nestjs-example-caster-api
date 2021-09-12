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
import {UserContext} from './user.types'
import {GqlExecutionContext} from '@nestjs/graphql'

export class UserGuard extends JwtGuard {
  constructor(
    protected readonly reflector: Reflector,
    private readonly users: UsersService,
    private readonly ability: AbilityFactory,
    @Optional() protected readonly options?: AuthModuleOptions
  ) {
    super(reflector, options)
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)

    return ctx.getContext<UserContext>().req
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context)

    const allowAnonymous =
      this.reflector.getAllAndOverride<AllowAnonymousMetadata>(
        ALLOW_ANONYMOUS,
        [context.getHandler(), context.getClass()]
      )

    const handleAnonymous = () => {
      if (allowAnonymous) {
        // Annotate an anonymous ability on the request
        request.ability = this.ability.createForUser()

        return true
      }

      return false
    }

    // Should annotate the `jwt` on the request if available
    const success = await canActivate

    if (!success) {
      return false
    }

    const request = this.getRequest(context)

    const username = getUsername(request)
    if (!username) {
      return handleAnonymous()
    }

    const user = await this.users.getByUsername(username)
    if (!user) {
      return handleAnonymous()
    }

    // Annotate the user object and the user's abilities on the request
    request.user = user
    request.ability = this.ability.createForUser(user)

    return true
  }
}
