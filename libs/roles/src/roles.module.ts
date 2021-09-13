import {DynamicModule, Module} from '@nestjs/common'

import {RolesService} from './roles.service'
import {Role, Permission, Roles, Permissions} from './roles.types'

export interface ModuleOptions {
  roles: Role[]
  permissions: Permission[]
}

@Module({
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {
  static forRoot({roles, permissions}: ModuleOptions): DynamicModule {
    return {
      global: true,
      module: RolesModule,
      providers: [
        {
          provide: Permissions,
          useValue: permissions,
        },
        {
          provide: Roles,
          useValue: roles,
        },
      ],
    }
  }
}
