import faker from 'faker'
import {RoleGrant} from '@prisma/client'

export const make = (overrides?: Partial<RoleGrant> | null): RoleGrant => {
  return {
    id: faker.datatype.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    roleKey: faker.datatype.uuid(),
    profileId: faker.datatype.uuid(),
    subjectTable: faker.random.word(),
    subjectId: faker.datatype.uuid(),
    ...overrides,
  }
}

export const RoleGrantFactory = {make}
