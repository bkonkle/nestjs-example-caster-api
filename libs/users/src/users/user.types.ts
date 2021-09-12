import {Profile, User} from '@prisma/client'

import {JwtRequest, JwtContext} from '@caster/authn'
import {AppAbility} from '@caster/authz'

export type UserWithProfile = User & {profile: Profile | null}

export interface UserRequest extends JwtRequest {
  user?: UserWithProfile
  ability?: AppAbility
}

export interface UserContext extends JwtContext {
  req: UserRequest
}
