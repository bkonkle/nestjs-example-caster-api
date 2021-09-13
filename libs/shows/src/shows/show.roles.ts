import {Permission, Role} from '@caster/roles'

/**
 * Permissions
 */

export const Update: Permission = {
  key: 'SHOW_UPDATE',
  name: 'Update Show',
  description: 'Update details about a particular Show',
}

export const Delete: Permission = {
  key: 'SHOW_DELETE',
  name: 'Delete Show',
  description: 'Delete a particular Show',
}

export const Manage: Permission = {
  key: 'SHOW_MANAGE',
  name: 'Manage Show',
  description: 'Manage a particular Show',
}

export const ManageEpisodes: Permission = {
  key: 'SHOW_MANAGE_EPISODES',
  name: 'Manage Show Episodes',
  description: 'Create, update, or delete an Episode for particular Show',
}

export const ManageRoles: Permission = {
  key: 'SHOW_MANAGE_ROLES',
  name: 'Manage Show Roles',
  description: 'Grant or revoke User Roles for a particular Show',
}

export const permissions = [Update, Delete, Manage, ManageEpisodes, ManageRoles]

/**
 * Roles
 */

export const Manager: Role = {
  key: 'SHOW_MANAGER',
  name: 'Show Manager',
  description:
    'Able to manage Episodes and update details for a particular Show',
  permissions: [Update, ManageEpisodes],
}

export const Admin: Role = {
  key: 'SHOW_ADMIN',
  name: 'Show Admin',
  description: 'Able to fully control a particular Show',
  permissions: [Manage, ManageEpisodes, ManageRoles],
}

export const roles = [Manager, Admin]
