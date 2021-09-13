import faker from 'faker'
import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'
import omit from 'lodash/omit'

import {AbilityFactory, AbilityModule, AppAbility} from '@caster/authz'

import {ProfileFactory, UserFactory} from '../../../test/factories'
import {UserWithProfile} from '../../users/user.types'
import {UserRules} from '../../users/user.rules'
import {
  CreateProfileInput,
  UpdateProfileInput,
} from '../profile-mutations.model'
import {ProfileCondition, ProfilesOrderBy} from '../profile-queries.model'
import {ProfilesResolver} from '../profiles.resolver'
import {ProfilesService} from '../profiles.service'
import {ProfileWithUser} from '../profile.utils'
import {ProfileRules} from '../profile.rules'

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver
  let ability: AppAbility
  let otherAbility: AppAbility

  const service = mockDeep<ProfilesService>()

  const username = 'test-username'
  const email = 'test@email.com'

  const user = UserFactory.make({username}) as UserWithProfile

  const otherUser = {
    ...user,
    id: faker.datatype.uuid(),
    username: 'other-username',
  }

  const profile = ProfileFactory.make({
    user,
    userId: user.id,
    email,
  }) as ProfileWithUser

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [AbilityModule.forRoot({rules: [UserRules, ProfileRules]})],
      providers: [
        {provide: ProfilesService, useValue: service},
        ProfilesResolver,
      ],
    }).compile()

    resolver = testModule.get(ProfilesResolver)

    const abilityFactory = testModule.get(AbilityFactory)

    ability = await abilityFactory.createForUser(user)
    otherAbility = await abilityFactory.createForUser(otherUser)

    jest.spyOn(ability, 'can')
    jest.spyOn(ability, 'cannot')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile()', () => {
    it('uses the ProfilesService to find the Profiles by username', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.getProfile(profile.id, ability)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(result).toEqual(profile)
    })

    it('censors the results for unauthorized users', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.getProfile(profile.id, otherAbility)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(result).toEqual(omit(profile, ['email', 'userId', 'user']))
    })
  })

  describe('getManyProfiles()', () => {
    it('uses the ProfilesService to find many Profiles', async () => {
      const where: ProfileCondition = {email}
      const orderBy: ProfilesOrderBy[] = [ProfilesOrderBy.ID_ASC]

      const expected = {
        data: [profile],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      service.getMany.mockResolvedValueOnce(expected)

      const result = await resolver.getManyProfiles(
        ability,
        where,
        orderBy,
        undefined,
        undefined
      )

      expect(service.getMany).toBeCalledTimes(1)
      expect(service.getMany).toBeCalledWith({
        where: {email},
        orderBy: {
          id: 'asc',
        },
      })

      expect(result).toEqual(expected)
    })

    it('censors the results for unauthorized users', async () => {
      const where: ProfileCondition = {email}
      const orderBy: ProfilesOrderBy[] = [ProfilesOrderBy.ID_ASC]

      const profiles = {
        data: [profile],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      const expected = {
        ...profiles,
        data: [omit(profile, ['email', 'userId', 'user'])],
      }

      service.getMany.mockResolvedValueOnce(profiles)

      const result = await resolver.getManyProfiles(
        otherAbility,
        where,
        orderBy,
        undefined,
        undefined
      )

      expect(service.getMany).toBeCalledTimes(1)

      expect(result).toEqual(expected)
    })
  })

  describe('createProfile()', () => {
    it('uses the ProfilesService to create a Profile', async () => {
      const input: CreateProfileInput = {email, userId: user.id}

      service.create.mockResolvedValueOnce(profile)

      const result = await resolver.createProfile(input, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('create', input)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)

      expect(result).toEqual({profile})
    })

    it('requires authorization', async () => {
      const input: CreateProfileInput = {email, userId: otherUser.id}

      await expect(resolver.createProfile(input, ability)).rejects.toThrowError(
        'Forbidden'
      )

      expect(ability.can).toBeCalledTimes(1)
      expect(service.create).not.toBeCalled()
    })
  })

  describe('updateProfile()', () => {
    it('uses the ProfilesService to update an existing Profile', async () => {
      const input: UpdateProfileInput = {displayName: 'Test Display Name'}

      service.get.mockResolvedValueOnce(profile)
      service.update.mockResolvedValueOnce(profile)

      const result = await resolver.updateProfile(profile.id, input, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('update', profile)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(profile.id, input)

      expect(result).toEqual({profile})
    })

    it('requires authorization', async () => {
      const input: UpdateProfileInput = {displayName: 'Test Display Name'}

      service.get.mockResolvedValueOnce({
        ...profile,
        userId: otherUser.id,
        user: otherUser,
      })

      await expect(
        resolver.updateProfile(profile.id, input, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.update).not.toBeCalled()
    })
  })

  describe('deleteProfile()', () => {
    it('uses the ProfilesService to remove an existing Profile', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.deleteProfile(profile.id, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('delete', profile)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(service.delete).toBeCalledTimes(1)
      expect(service.delete).toBeCalledWith(profile.id)

      expect(result).toBe(true)
    })

    it('requires authorization', async () => {
      service.get.mockResolvedValueOnce({
        ...profile,
        userId: otherUser.id,
        user: otherUser,
      })

      await expect(
        resolver.deleteProfile(profile.id, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.delete).not.toBeCalled()
    })
  })
})
