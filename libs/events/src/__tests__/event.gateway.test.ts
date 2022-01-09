import {LoggerService} from '@nestjs/common'
import {WsException} from '@nestjs/websockets'
import {Test} from '@nestjs/testing'
import {mockDeep, mockFn} from 'jest-mock-extended'
import {Socket} from 'socket.io'

import {Action, AppAbility, CensorFields} from '@caster/authz/authz.types'
import {AbilityFactory} from '@caster/authz/ability.factory'
import {UsersService} from '@caster/users/users.service'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'
import {UserFactory} from '@caster/users/test/factories/user.factory'
import {UserWithProfile} from '@caster/users/user.types'

import {
  makeClientRegisterEvent,
  makeMessageSend,
} from '../../test/factories/events.factory'
import {ChannelService} from '../channel.service'
import {EventsGateway} from '../events.gateway'

describe('EventsGateway', () => {
  const service = mockDeep<ChannelService>()
  const logger = mockDeep<LoggerService>()
  const censor = mockFn<CensorFields>()
  const ability = mockDeep<AppAbility>()
  const abilityFactory = mockDeep<AbilityFactory>()
  const socket = mockDeep<Socket>()
  const users = mockDeep<UsersService>()

  const username = 'test-username'
  const email = 'test@email.com'

  const profile = ProfileFactory.make({email})
  const user = UserFactory.make({
    username,
    profileId: profile.id,
    profile,
  }) as UserWithProfile

  let gateway: EventsGateway

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {provide: ChannelService, useValue: service},
        {provide: UsersService, useValue: users},
        {provide: AbilityFactory, useValue: abilityFactory},
      ],
    })
      .setLogger(logger)
      .compile()

    gateway = testModule.get(EventsGateway)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('clientRegister()', () => {
    it('TODO', async () => {
      const event = makeClientRegisterEvent()

      await gateway.clientRegister(event, ability, censor, socket)

      expect(ability.cannot).toBeCalledTimes(1)
      expect(ability.cannot).toBeCalledWith(Action.Read, {
        episodeId: event.episodeId,
      })

      expect(service.registerClient).toBeCalledTimes(1)
      expect(service.registerClient).toBeCalledWith(event, censor, socket)
    })

    it('rejects unauthorized events', async () => {
      const event = makeClientRegisterEvent()

      ability.cannot.mockReturnValueOnce(true)

      await expect(
        gateway.clientRegister(event, ability, censor, socket)
      ).rejects.toThrowError(new WsException('Forbidden'))

      expect(ability.cannot).toBeCalledTimes(1)
      expect(service.registerClient).not.toBeCalled()
    })

    it('rejects failed registration attempts', async () => {
      const event = makeClientRegisterEvent()

      service.registerClient.mockRejectedValueOnce(new Error('test-error'))

      await expect(
        gateway.clientRegister(event, ability, censor, socket)
      ).rejects.toThrowError(new WsException('test-error'))

      expect(ability.cannot).toBeCalledTimes(1)
      expect(service.registerClient).toBeCalledTimes(1)
    })
  })

  describe('messageSend()', () => {
    it('sends a message from the Websocket client', async () => {
      const event = makeMessageSend()

      await gateway.messageSend(event, ability, user)

      expect(ability.cannot).toBeCalledTimes(1)
      expect(ability.cannot).toBeCalledWith(Action.Create, {
        episodeId: event.episodeId,
        profileId: profile.id,
      })

      expect(service.sendMessage).toBeCalledTimes(1)
      expect(service.sendMessage).toBeCalledWith(event, profile.id)
    })

    it('rejects requests without a user profile', async () => {
      const event = makeMessageSend()

      const userWithoutProfile = {...user, profile: null}

      await expect(
        gateway.messageSend(event, ability, userWithoutProfile)
      ).rejects.toThrowError(new WsException('No User Profile found'))

      expect(ability.cannot).not.toBeCalled()
      expect(service.sendMessage).not.toBeCalled()
    })

    it('rejects unauthorized requests', async () => {
      const event = makeMessageSend()

      ability.cannot.mockReturnValueOnce(true)

      await expect(
        gateway.messageSend(event, ability, user)
      ).rejects.toThrowError(new WsException('Forbidden'))

      expect(ability.cannot).toBeCalledTimes(1)
      expect(service.sendMessage).not.toBeCalled()
    })

    it('rejects failed send attempts', async () => {
      const event = makeMessageSend()

      service.sendMessage.mockRejectedValueOnce(new Error('test-error'))

      await expect(
        gateway.messageSend(event, ability, user)
      ).rejects.toThrowError(new WsException('test-error'))

      expect(ability.cannot).toBeCalledTimes(1)
      expect(service.sendMessage).toBeCalledTimes(1)
    })
  })
})
