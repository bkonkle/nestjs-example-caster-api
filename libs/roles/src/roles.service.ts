import uniqBy from 'lodash/uniqBy'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import {Inject, Injectable} from '@nestjs/common'
import {Prisma, RoleGrant} from '@prisma/client'
import {PrismaService} from 'nestjs-prisma'

import {Permission, Permissions, Role, Roles} from './roles.types'

export interface RoleSubject {
  table: Prisma.ModelName
  id: string
}

@Injectable()
export class RolesService {
  private readonly roles: Record<string, Role>
  private readonly permissions: Record<string, Permission>

  constructor(
    private readonly prisma: PrismaService,
    @Inject(Permissions) permissions: Permission[],
    @Inject(Roles) roles: Role[]
  ) {
    this.permissions = permissions.reduce(
      (memo: Record<string, Permission>, permission) => {
        if (memo[permission.key]) {
          throw new Error(
            `A Permission with key ${permission.key} has already been registered.`
          )
        }

        return {
          ...memo,
          [permission.key]: permission,
        }
      },
      {}
    )

    this.roles = roles.reduce((memo: Record<string, Role>, role) => {
      if (memo[role.key]) {
        throw new Error(
          `A Role with key ${role.key} has already been registered.`
        )
      }

      return {
        ...memo,
        [role.key]: role,
      }
    }, {})
  }

  findPermission = (key: string): Permission | undefined => {
    return this.permissions[key]
  }

  getPermission = (key: string): Permission => {
    const permission = this.findPermission(key)

    if (!permission) {
      throw new Error(`Unable to find a registered Permission with key ${key}`)
    }

    return permission
  }

  findRole = (key: string): Role | undefined => {
    return this.roles[key]
  }

  getRole = (key: string): Role => {
    const role = this.findRole(key)

    if (!role) {
      throw new Error(`Unable to find a registered Role with key ${key}`)
    }

    return role
  }

  /**
   * Return an array of Roles granted for the given Profile id, optionally in the context of a
   * specific subject item.
   */
  getRolesByProfile = async (
    profileId: string,
    subject: RoleSubject
  ): Promise<Role[]> => {
    const grants = await this.prisma.roleGrant.findMany({
      where: {
        profile: {id: profileId},
        subjectId: subject.id,
        subjectTable: subject.table,
      },
    })

    return grants.map(this.fromGrant)
  }

  /**
   * Return a map of subject ids to Roles for the given table.
   */
  getRolesForTable = async (
    profileId: string,
    subjectTable: string
  ): Promise<Record<string, Role[]>> => {
    const grants = await this.prisma.roleGrant.findMany({
      where: {profile: {id: profileId}, subjectTable},
    })

    const grouped = groupBy(grants, (grant) => grant.subjectId)

    return mapValues(grouped, (grants) => grants.map(this.fromGrant))
  }

  /**
   * Return an array of distinct Permissions granted via Roles for the given Profile id in the
   * context of a specific subject item.
   */
  getPermissionsByProfile = async (
    profileId: string,
    subject: RoleSubject
  ): Promise<Permission[]> => {
    const roles = await this.getRolesByProfile(profileId, subject)

    const permissions = roles.reduce(
      (memo, role) => memo.concat(role.permissions),
      [] as Permission[]
    )

    return uniqBy(permissions, (permission) => permission.key)
  }

  /**
   * Return a map of subject ids to Permissions for the given table.
   */
  getPermissionsForTable = async (
    profileId: string,
    subjectTable: string
  ): Promise<Record<string, Permission[]>> => {
    const roles = await this.getRolesForTable(profileId, subjectTable)

    return mapValues(roles, (roles) =>
      roles.reduce(
        (memo, role) => memo.concat(role.permissions),
        [] as Permission[]
      )
    )
  }

  /**
   * Return an array of distinct Permission keys granted via Roles for the given Profile id, in the
   * context of a specific subject item.
   */
  getPermissionKeysByProfile = async (
    profileId: string,
    subject: RoleSubject
  ): Promise<string[]> => {
    const profilePerms = await this.getPermissionsByProfile(profileId, subject)

    return profilePerms.map((permission) => permission.key)
  }

  /**
   * Check for specific Permissions and return true if they were all found for the given Profile.
   */
  hasPermissions = async (
    profileId: string,
    subject: RoleSubject,
    permissions: Permission[]
  ): Promise<boolean> => {
    const keys = await this.getPermissionKeysByProfile(profileId, subject)

    return permissions.every((permission) => keys.includes(permission.key))
  }

  /**
   * Check for specific Permissions and return true if any were found for the given Profile.
   */
  anyPermission = async (
    profileId: string,
    subject: RoleSubject,
    permissions: Permission[]
  ): Promise<boolean> => {
    const keys = await this.getPermissionKeysByProfile(profileId, subject)

    return permissions.some((permission) => keys.includes(permission.key))
  }

  /**
   * Grant the given Roles to the given Profile for the given Subject. Should only be used if the
   * grantor is fully authorized.
   */
  grantRoles = async (
    profileId: string,
    subject: RoleSubject,
    roleKeys: string[]
  ): Promise<void> => {
    await this.prisma.roleGrant.createMany({
      data: roleKeys.map(this.getRole).map((role) => ({
        roleKey: role.key,
        profileId,
        subjectTable: subject.table,
        subjectId: subject.id,
      })),
    })
  }

  /**
   * Map a RoleGrant to a Role object.
   */
  private fromGrant = (grant: RoleGrant): Role => this.getRole(grant.roleKey)
}
