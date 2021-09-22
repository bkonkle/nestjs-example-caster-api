import {Permission, Role} from '@caster/roles/roles.types'

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

export const ManageEpisodes: Permission = {
  key: 'SHOW_MANAGE_EPISODES',
  name: 'Manage Show Episodes',
  description: 'Create, update, and delete any Episodes for this Show',
}

export const ManageRoles: Permission = {
  key: 'SHOW_MANAGE_ROLES',
  name: 'Manage Show Roles',
  description: 'Grant or revoke User Roles for a particular Show',
}

/**
 * Roles
 */

export const Manager: Role = {
  key: 'SHOW_MANAGER',
  name: 'Show Manager',
  description: 'Able to update existing Shows and manage Episodes',
  permissions: [Update, ManageEpisodes],
}

export const Admin: Role = {
  key: 'SHOW_ADMIN',
  name: 'Show Admin',
  description: 'Able to fully control a particular Show',
  permissions: [...Manager.permissions, Delete, ManageRoles],
}

/**
 * Index
 */

export const ShowRoles = {
  roles: [Manager, Admin],
  permissions: [Update, Delete, ManageEpisodes, ManageRoles],
}
