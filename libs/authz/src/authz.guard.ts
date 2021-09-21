import {
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {AuthModuleOptions} from '@nestjs/passport'

import {JwtGuard, getUsername} from '@caster/authn'
import {UsersService} from '@caster/users/users/users.service'

import {AbilityFactory} from './ability.factory'
import {
  ALLOW_ANONYMOUS,
  AllowAnonymousMetadata,
  CensorFields,
} from './authz.types'
import {censorFields, getRequest} from './authz.utils'

@Injectable()
export class AuthzGuard extends JwtGuard {
  constructor(
    protected readonly reflector: Reflector,
    @Inject(forwardRef(() => UsersService))
    private readonly users: UsersService,
    private readonly ability: AbilityFactory,
    @Optional() protected readonly options?: AuthModuleOptions
  ) {
    super(reflector, options)
  }

  getRequest(context: ExecutionContext) {
    return getRequest(context)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context)

    const allowAnonymous =
      this.reflector.getAllAndOverride<AllowAnonymousMetadata>(
        ALLOW_ANONYMOUS,
        [context.getHandler(), context.getClass()]
      )

    const handleAnonymous = async () => {
      if (allowAnonymous) {
        // Annotate an anonymous ability on the request
        request.ability = await this.ability.createForUser()
        request.censor = censorFields(request.ability) as CensorFields

        return true
      }

      throw new UnauthorizedException()
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
    request.ability = await this.ability.createForUser(user)

    // Annotate the censor function based on the ability
    request.censor = censorFields(request.ability) as CensorFields

    return true
  }
}
