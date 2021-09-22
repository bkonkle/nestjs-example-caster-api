import {InjectionToken} from '@caster/utils/injection'

/**
 * Permissions
 */

export interface Permission {
  key: string
  name: string
  description: string
}

/**
 * Roles
 */
export interface Role {
  key: string
  name: string
  description: string
  permissions: Permission[]
}

export const Roles: InjectionToken<Role[]> = 'AUTHZ_ROLES'

export const Permissions: InjectionToken<Permission[]> = 'AUTHZ_PERMISSIONS'
