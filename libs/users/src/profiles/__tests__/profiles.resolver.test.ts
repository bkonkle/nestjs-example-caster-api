import faker from 'faker'
import {subject} from '@casl/ability'
import {Test} from '@nestjs/testing'
import {mockFn, mockDeep} from 'jest-mock-extended'

/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {AppAbility, CensorFields} from '@caster/authz/authz.types'
import {AuthzTestModule} from '@caster/authz/authz-test.module'
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

import * as UserFactory from '../../../test/factories/user.factory'
import * as ProfileFactory from '../../../test/factories/profile.factory'
import {UserWithProfile} from '../../users/user.types'
import {
  CreateProfileInput,
  UpdateProfileInput,
} from '../profile-mutations.model'
import {ProfileCondition, ProfilesOrderBy} from '../profile-queries.model'
import {ProfilesResolver} from '../profiles.resolver'
import {ProfilesService} from '../profiles.service'
import {ProfileWithUser, fieldOptions} from '../profile.utils'
import {UsersService} from '../../users/users.service'

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver

  const service = mockDeep<ProfilesService>()
  const users = mockDeep<UsersService>()

  const username = 'test-username'
  const email = 'test@email.com'

  const user = UserFactory.make({username}) as UserWithProfile
  const ability = mockDeep<AppAbility>()
  const censor = mockFn<CensorFields>()

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
      imports: [AuthzTestModule],
      providers: [
        {provide: ProfilesService, useValue: service},
        {provide: UsersService, useValue: users},
        ProfilesResolver,
      ],
    }).compile()

    resolver = testModule.get(ProfilesResolver)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile()', () => {
    it('uses the ProfilesService to find the Profiles by username', async () => {
      service.get.mockResolvedValueOnce(profile)
      censor.mockReturnValueOnce(subject('Profile', profile))

      const result = await resolver.getProfile(profile.id, censor)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(censor).toBeCalledTimes(1)
      expect(censor).toBeCalledWith(profile, fieldOptions)

      expect(result).toEqual(profile)
    })

    it('censors the results for unauthorized users', async () => {
      service.get.mockResolvedValueOnce(profile)
      censor.mockReturnValueOnce(subject('Profile', profile))

      await resolver.getProfile(profile.id, censor)

      expect(service.get).toBeCalledTimes(1)
      expect(censor).toBeCalledTimes(1)
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
      censor.mockReturnValueOnce(subject('Profile', profile))

      const result = await resolver.getManyProfiles(
        censor,
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

      expect(censor).toBeCalledTimes(1)
      expect(censor).toBeCalledWith(profile, fieldOptions)

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
        data: [profile],
      }

      service.getMany.mockResolvedValueOnce(profiles)
      censor.mockReturnValueOnce(subject('Profile', profile))

      const result = await resolver.getManyProfiles(
        censor,
        where,
        orderBy,
        undefined,
        undefined
      )

      expect(service.getMany).toBeCalledTimes(1)
      expect(censor).toBeCalledTimes(1)

      expect(result).toEqual(expected)
    })
  })

  describe('createProfile()', () => {
    it('uses the ProfilesService to create a Profile', async () => {
      const input: CreateProfileInput = {email, userId: user.id}

      ability.can.mockReturnValueOnce(true)
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

      ability.can.mockReturnValueOnce(true)
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
      ability.can.mockReturnValueOnce(true)
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
