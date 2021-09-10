import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'
import omit from 'lodash/omit'

import {ProfileFactory, UserFactory} from '../../../test/factories'
import {UsersService} from '../../users/users.service'
import {CreateProfileInput, UpdateProfileInput} from '../profile-input.model'
import {ProfileCondition, ProfilesOrderBy} from '../profile-query.model'
import {ProfilesResolver} from '../profiles.resolver'
import {ProfilesService} from '../profiles.service'

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver

  const service = mockDeep<ProfilesService>()
  const users = mockDeep<UsersService>()

  const username = 'test-username'
  const email = 'test@email.com'
  const user = UserFactory.make({username})
  const profile = ProfileFactory.make({user, userId: user.id, email})

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        {provide: ProfilesService, useValue: service},
        {provide: UsersService, useValue: users},
        ProfilesResolver,
      ],
    }).compile()

    resolver = testModule.get(ProfilesResolver)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getProfile()', () => {
    it('uses the ProfilesService to find the Profiles by username', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.getProfile(profile.id, username)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(result).toEqual(profile)
    })

    it('censors the results for unauthorized users', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.getProfile(profile.id, 'other-username')

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
        where,
        orderBy,
        undefined,
        undefined,
        username
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
        where,
        orderBy,
        undefined,
        undefined,
        'other-username'
      )

      expect(service.getMany).toBeCalledTimes(1)

      expect(result).toEqual(expected)
    })
  })

  describe('createProfile()', () => {
    it('uses the ProfilesService to create a Profile', async () => {
      const input: CreateProfileInput = {email, userId: user.id}

      users.get.mockResolvedValueOnce(user)
      service.create.mockResolvedValueOnce(profile)

      const result = await resolver.createProfile(input, username)

      expect(users.get).toBeCalledTimes(1)
      expect(users.get).toBeCalledWith(user.id)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)

      expect(result).toEqual({profile})
    })

    it('throws an error if no User is found for the given userId', async () => {
      const input: CreateProfileInput = {email, userId: user.id}

      await expect(
        resolver.createProfile(input, username)
      ).rejects.toThrowError()

      expect(users.get).toBeCalledTimes(1)

      expect(service.create).not.toBeCalled()
    })

    it('throws an error if a different username is found for the User with the given userId', async () => {
      const input: CreateProfileInput = {email, userId: user.id}

      users.get.mockResolvedValueOnce({...user, username: 'other-username'})

      await expect(
        resolver.createProfile(input, username)
      ).rejects.toThrowError()

      expect(users.get).toBeCalledTimes(1)

      expect(service.create).not.toBeCalled()
    })
  })

  describe('updateProfile()', () => {
    it('uses the ProfilesService to update an existing Profile', async () => {
      const input: UpdateProfileInput = {displayName: 'Test Display Name'}

      service.get.mockResolvedValueOnce(profile)
      service.update.mockResolvedValueOnce(profile)

      const result = await resolver.updateProfile(profile.id, input, username)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(profile.id, input)

      expect(result).toEqual({profile})
    })

    it("throws an error if the User on the requested Profile doesn't match", async () => {
      const input: UpdateProfileInput = {displayName: 'Test Display Name'}

      service.get.mockResolvedValueOnce({
        ...profile,
        user: {...user, username: 'other-username'},
      })

      await expect(
        resolver.updateProfile(profile.id, input, username)
      ).rejects.toThrowError('')

      expect(service.get).toBeCalledTimes(1)

      expect(service.update).not.toBeCalled()
    })
  })

  describe('deleteProfile()', () => {
    it('uses the ProfilesService to remove an existing Profile', async () => {
      service.get.mockResolvedValueOnce(profile)

      const result = await resolver.deleteProfile(profile.id, username)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(profile.id)

      expect(service.delete).toBeCalledTimes(1)
      expect(service.delete).toBeCalledWith(profile.id)

      expect(result).toBe(true)
    })

    it("throws an error if the User on the requested Profile doesn't match", async () => {
      service.get.mockResolvedValueOnce({
        ...profile,
        user: {...user, username: 'other-username'},
      })

      await expect(
        resolver.deleteProfile(profile.id, username)
      ).rejects.toThrowError()

      expect(service.get).toBeCalledTimes(1)

      expect(service.delete).not.toBeCalled()
    })
  })
})
