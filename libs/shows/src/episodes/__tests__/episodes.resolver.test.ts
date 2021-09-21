import faker from 'faker'
import {Episode} from '@prisma/client'
import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

import {AbilityFactory, AppAbility} from '@caster/authz'
import {UserWithProfile} from '@caster/users'
import {RolesService} from '@caster/roles'
import {ProfileFactory, UserFactory} from '@caster/users/test'

import {EpisodeFactory, ShowFactory} from '../../../test/factories'
import {
  CreateEpisodeInput,
  UpdateEpisodeInput,
} from '../episode-mutations.model'
import {EpisodeCondition, EpisodesOrderBy} from '../episode-queries.model'
import {EpisodesResolver} from '../episodes.resolver'
import {EpisodesService} from '../episodes.service'

describe('EpisodesResolver', () => {
  let resolver: EpisodesResolver

  const service = mockDeep<EpisodesService>()
  const roles = mockDeep<RolesService>()
  const abilityFactory = mockDeep<AbilityFactory>()
  const ability = mockDeep<AppAbility>()

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
  const episode = EpisodeFactory.make({showId: show.id, show})

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        {provide: EpisodesService, useValue: service},
        {provide: RolesService, useValue: roles},
        {provide: AbilityFactory, useValue: abilityFactory},
        EpisodesResolver,
      ],
    }).compile()

    abilityFactory.createForUser.mockResolvedValue(ability)

    resolver = testModule.get(EpisodesResolver)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEpisode()', () => {
    it('uses the EpisodesService to find the Episodes by id', async () => {
      service.get.mockResolvedValueOnce(episode as Episode)

      const result = await resolver.getEpisode(episode.id)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(episode.id)

      expect(result).toEqual(episode)
    })
  })

  describe('getManyEpisodes()', () => {
    it('uses the EpisodesService to find many Episodes', async () => {
      const where: EpisodeCondition = {title: 'My Episode'}
      const orderBy: EpisodesOrderBy[] = [EpisodesOrderBy.ID_ASC]

      const expected = {
        data: [episode as Episode],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      }

      service.getMany.mockResolvedValueOnce(expected)

      const result = await resolver.getManyEpisodes(
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

  describe('createEpisode()', () => {
    it('uses the EpisodesService to create a Episode', async () => {
      const input: CreateEpisodeInput = {title: 'My Episode', showId: show.id}

      service.create.mockResolvedValueOnce(episode as Episode)

      const result = await resolver.createEpisode(input, user, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('create', input)

      expect(service.create).toBeCalledTimes(1)
      expect(service.create).toBeCalledWith(input)

      expect(result).toEqual({episode})
    })

    it('requires authorization', async () => {
      const input: CreateEpisodeInput = {title: 'My Episode', showId: show.id}

      ability.can.mockReturnValueOnce(false)

      await expect(
        resolver.createEpisode(input, otherUser, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(roles.grantRoles).not.toBeCalled()
      expect(service.create).not.toBeCalled()
    })
  })

  describe('updateEpisode()', () => {
    it('uses the EpisodesService to update an existing Episode', async () => {
      const input: UpdateEpisodeInput = {title: 'Test Title'}

      service.get.mockResolvedValueOnce(episode as Episode)
      service.update.mockResolvedValueOnce(episode as Episode)

      const result = await resolver.updateEpisode(episode.id, input, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('update', episode)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(episode.id)

      expect(service.update).toBeCalledTimes(1)
      expect(service.update).toBeCalledWith(episode.id, input)

      expect(result).toEqual({episode})
    })

    it('requires authorization', async () => {
      const input: UpdateEpisodeInput = {title: 'Test Title'}

      ability.can.mockReturnValueOnce(false)
      service.get.mockResolvedValueOnce(episode as Episode)

      await expect(
        resolver.updateEpisode(episode.id, input, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.update).not.toBeCalled()
    })
  })

  describe('deleteEpisode()', () => {
    it('uses the EpisodesService to remove an existing Episode', async () => {
      service.get.mockResolvedValueOnce(episode as Episode)

      const result = await resolver.deleteEpisode(episode.id, ability)

      expect(ability.can).toBeCalledTimes(1)
      expect(ability.can).toBeCalledWith('delete', episode)

      expect(service.get).toBeCalledTimes(1)
      expect(service.get).toBeCalledWith(episode.id)

      expect(service.delete).toBeCalledTimes(1)
      expect(service.delete).toBeCalledWith(episode.id)

      expect(result).toBe(true)
    })

    it('requires authorization', async () => {
      ability.can.mockReturnValueOnce(false)
      service.get.mockResolvedValueOnce(episode as Episode)

      await expect(
        resolver.deleteEpisode(episode.id, ability)
      ).rejects.toThrowError('Forbidden')

      expect(ability.can).toBeCalledTimes(1)
      expect(service.get).toBeCalledTimes(1)
      expect(service.delete).not.toBeCalled()
    })
  })
})
