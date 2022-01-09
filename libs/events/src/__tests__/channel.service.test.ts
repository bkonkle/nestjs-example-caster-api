import faker from 'faker'
import {Test} from '@nestjs/testing'
import {mockDeep, mockFn} from 'jest-mock-extended'
import {Redis} from 'ioredis'
import {Socket} from 'socket.io'

import {AppSubjects, CensorFields} from '@caster/authz/authz.types'
import {ProfilesService} from '@caster/users/profiles/profiles.service'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'
import {UserFactory} from '@caster/users/test/factories/user.factory'

import {
  makeClientRegisterEvent,
  makeMessageReceive,
  makeMessageSend,
} from '../../test/factories/events.factory'
import {ChannelService} from '../channel.service'
import {EventTypes, Publisher, Subscriber} from '../event.types'
import {ProfileWithUser} from '@caster/users/profiles/profile.utils'
import {LoggerService} from '@nestjs/common'

describe('ChannelService', () => {
  const publisher = mockDeep<Redis>()
  const subscriber = mockDeep<Redis>()
  const logger = mockDeep<LoggerService>()
  const censor = mockFn<CensorFields>()
  const socket = mockDeep<Socket>()
  const profiles = mockDeep<ProfilesService>()

  let service: ChannelService

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {provide: Publisher, useValue: publisher},
        {provide: Subscriber, useValue: subscriber},
        {provide: ProfilesService, useValue: profiles},
      ],
    })
      .setLogger(logger)
      .compile()

    service = testModule.get(ChannelService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('registerClient()', () => {
    it('uses Redis to subscribe to messages', async () => {
      const event = makeClientRegisterEvent()

      await service.registerClient(event, censor, socket)

      expect(subscriber.on).toBeCalledTimes(1)
      expect(subscriber.on).toBeCalledWith('message', expect.any(Function))

      expect(subscriber.subscribe).toBeCalledTimes(1)
      expect(subscriber.subscribe).toBeCalledWith(
        `ep:${event.episodeId}`,
        expect.any(Function)
      )

      expect(socket.emit).toBeCalledTimes(1)
      expect(socket.emit).toBeCalledWith(EventTypes.ClientRegistered, event)
    })
  })

  describe('sendMessage()', () => {
    it('sends a message from the Websocket client', async () => {
      const event = makeMessageSend()
      const profileId = faker.datatype.uuid()

      await service.sendMessage(event, profileId)

      expect(publisher.publish).toBeCalledTimes(1)
      expect(publisher.publish).toBeCalledWith(
        `ep:${event.episodeId}`,
        JSON.stringify({sender: {profileId}, text: event.text})
      )
    })
  })

  describe('handleMessage()', () => {
    it('handles Redis events for the Websocket client', async () => {
      const event = makeClientRegisterEvent()

      const channel = 'test-channel'
      const message = JSON.stringify({
        sender: {profileId: event.profileId},
        text: 'test-message',
      })

      const profile = {
        ...ProfileFactory.make(),
        user: UserFactory.make(),
      } as ProfileWithUser

      const receive = makeMessageReceive({
        episodeId: event.episodeId,
        sender: profile,
        text: 'test-message',
      })

      profiles.get.mockResolvedValueOnce(profile)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      censor.mockReturnValueOnce(profile as any as AppSubjects)

      await service.registerClient(event, censor, socket)

      const handleMessage = subscriber.on.mock.calls[0][1]

      await handleMessage(channel, message)

      expect(profiles.get).toBeCalledTimes(1)
      expect(profiles.get).toBeCalledWith(event.profileId)

      expect(censor).toBeCalledTimes(1)
      expect(censor).toBeCalledWith(profile, {fieldsFrom: expect.any(Function)})

      expect(socket.emit).toBeCalledTimes(2)
      expect(socket.emit).toBeCalledWith(EventTypes.MessageReceive, receive)
    })

    it('ignores events with no sender', async () => {
      const event = makeClientRegisterEvent()

      const channel = 'test-channel'
      const message = JSON.stringify({
        text: 'test-message',
      })

      await service.registerClient(event, censor, socket)

      const handleMessage = subscriber.on.mock.calls[0][1]

      await handleMessage(channel, message)

      expect(profiles.get).not.toBeCalled()
      expect(censor).not.toBeCalled()
      expect(socket.emit).toBeCalledTimes(1)

      expect(logger.error).toBeCalledTimes(1)
      expect(logger.error).toBeCalledWith(
        expect.stringContaining(
          'Error: Cannot find Profile for message received on channel "test-channel"'
        ),
        'ChannelService'
      )
    })

    it('ignores events where the sender cannot be found', async () => {
      const event = makeClientRegisterEvent()

      const channel = 'test-channel'
      const message = JSON.stringify({
        sender: {profileId: event.profileId},
        text: 'test-message',
      })

      await service.registerClient(event, censor, socket)

      const handleMessage = subscriber.on.mock.calls[0][1]

      await handleMessage(channel, message)

      expect(profiles.get).toBeCalledTimes(1)
      expect(censor).not.toBeCalled()
      expect(socket.emit).toBeCalledTimes(1)

      expect(logger.error).toBeCalledTimes(1)
      expect(logger.error).toBeCalledWith(
        expect.stringContaining(
          'Error: Cannot find Profile for message received on channel "test-channel"'
        ),
        'ChannelService'
      )
    })

    it('ignores events with no text', async () => {
      const event = makeClientRegisterEvent()

      const channel = 'test-channel'
      const message = JSON.stringify({
        sender: {profileId: event.profileId},
      })

      const profile = {
        ...ProfileFactory.make(),
        user: UserFactory.make(),
      } as ProfileWithUser

      profiles.get.mockResolvedValueOnce(profile)

      await service.registerClient(event, censor, socket)

      const handleMessage = subscriber.on.mock.calls[0][1]

      await handleMessage(channel, message)

      expect(profiles.get).toBeCalledTimes(1)
      expect(censor).not.toBeCalled()
      expect(socket.emit).toBeCalledTimes(1)

      expect(logger.error).toBeCalledTimes(1)
      expect(logger.error).toBeCalledWith(
        expect.stringContaining(
          'Error: Message received on channel "test-channel" with no text'
        ),
        'ChannelService'
      )
    })
  })
})
