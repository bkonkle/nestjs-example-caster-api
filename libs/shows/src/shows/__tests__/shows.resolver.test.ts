import faker from 'faker'
import {Show} from '@prisma/client'
import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

import {AbilityFactory} from '@caster/authz/ability.factory'
import {AppAbility} from '@caster/authz/authz.types'
import {UserWithProfile} from '@caster/users/users/user.types'
import {RolesService} from '@caster/roles/roles.service'
import * as UserFactory from '@caster/users/test/factories/user.factory'
import * as ProfileFactory from '@caster/users/test/factories/profile.factory'

import * as ShowFactory from '../../../test/factories/show.factory'
import {CreateShowInput, UpdateShowInput} from '../show-mutations.model'
import {ShowCondition, ShowsOrderBy} from '../show-queries.model'
import {ShowsResolver} from '../shows.resolver'
import {Admin} from '../show.roles'
import {ShowsService} from '../shows.service'
import {UsersService} from '@caster/users/users/users.service'

describe('ShowsResolver', () => {
  let resolver: ShowsResolver

  const ability = mockDeep<AppAbility>()
  const abilityFactory = mockDeep<AbilityFactory>()
  const roles = mockDeep<RolesService>()
  const service = mockDeep<ShowsService>()
  const users = mockDeep<UsersService>()

  // Default to "true"
  ability.can.mockReturnValue(true)

  const username = 'test-username'
  const email = 'test@email.com'

  const profile = ProfileFactory.make({email})
  const user = UserFactory.make({
    username,
    profileId: profile.id,
    profile,
  }) as UserWithProfile

  const otherUser = {
    ...user,
    id: faker.datatype.uuid(),
    username: 'other-username',
  }

  const show = ShowFactory.make()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        {provide: ShowsService, useValue: service},
        {provide: RolesService, useValue: roles},
        {provide: UsersService, useValue: users},
        {provide: AbilityFactory, useValue: abilityFactory},
        ShowsResolver,
      ],
    }).compile()

    abilityFactory.createForUser.mockResolvedValue(ability)

    resolver = testModule.get(ShowsResolver)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getShow()', () => {
    it('uses the ShowsService to find the Shows by id', async () => {
      service.get.mockResolvedValueOnce(show as Show)

      const result = await resolver.getShow(show.id)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(show.id)

      expect(result).toEqual(show)
    })
  })

  describe('getManyShows()', () => {
    it('uses the ShowsService to find many Shows', async () => {
      const where: ShowCondition = {title: 'My Show'}
      const orderBy: ShowsOrderBy[] = [ShowsOrderBy.ID_ASC]

      const expected = {
        data: [show as Show],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      service.getMany.mockResolvedValueOnce(expected)

      const result = await resolver.getManyShows(
        where,
        orderBy,
        undefined,
        undefined
      )

      expect(service.getMany).toBeCalledTimes(1)
      expect(service.getMany).toBeCalledWith({
        where,
        orderBy: {
          id: 'asc',
        },
      })

      expect(result).toEqual(expected)
    })
  })

  describe('createShow()', () => {
    it('uses the ShowsService to create a Show', async () => {
      const input: CreateShowInput = {title: 'My Show'}

      service.create.mockResolvedValueOnce(show as Show)

      const result = await resolver.createShow(input, user, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('create', input)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)

      // Grants the Admin role
      expect(roles.grantRoles).toBeCalledTimes(1)
      expect(roles.grantRoles).toBeCalledWith(
        profile.id,
        {id: show.id, table: 'Show'},
        [Admin.key]
      )

      expect(result).toEqual({show})
    })

    it('requires authorization', async () => {
      const input: CreateShowInput = {title: 'My Show'}

      ability.can.mockReturnValueOnce(false)

      await expect(
        resolver.createShow(input, otherUser, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(roles.grantRoles).not.toBeCalled()
      expect(service.create).not.toBeCalled()
    })
  })

  describe('updateShow()', () => {
    it('uses the ShowsService to update an existing Show', async () => {
      const input: UpdateShowInput = {title: 'Test Title'}

      service.get.mockResolvedValueOnce(show as Show)
      service.update.mockResolvedValueOnce(show as Show)

      const result = await resolver.updateShow(show.id, input, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('update', show)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(show.id)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(show.id, input)

      expect(result).toEqual({show})
    })

    it('requires authorization', async () => {
      const input: UpdateShowInput = {title: 'Test Title'}

      ability.can.mockReturnValueOnce(false)
      service.get.mockResolvedValueOnce(show as Show)

      await expect(
        resolver.updateShow(show.id, input, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.update).not.toBeCalled()
    })
  })

  describe('deleteShow()', () => {
    it('uses the ShowsService to remove an existing Show', async () => {
      service.get.mockResolvedValueOnce(show as Show)

      const result = await resolver.deleteShow(show.id, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('delete', show)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(show.id)

      expect(service.delete).toBeCalledTimes(1)
      expect(service.delete).toBeCalledWith(show.id)

      expect(result).toBe(true)
    })

    it('requires authorization', async () => {
      ability.can.mockReturnValueOnce(false)
      service.get.mockResolvedValueOnce(show as Show)

      await expect(resolver.deleteShow(show.id, ability)).rejects.toThrowError(
        'Forbidden'
      )

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.delete).not.toBeCalled()
    })
  })
})
