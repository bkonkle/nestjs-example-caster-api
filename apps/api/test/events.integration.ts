import {Prisma, Profile, User, Show, Episode} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {PrismaService} from 'nestjs-prisma'
import {io} from 'socket.io-client'
import supertest from 'supertest'
import {URL} from 'url'
import omit from 'lodash/omit'

import {
  ClientRegister,
  EventTypes,
  MessageSend,
} from '@caster/events/event.types'
import {OAuth2} from '@caster/utils/test/oauth2'
import {retry} from '@caster/utils/test/events'
import {Guest, Reader} from '@caster/shows/episodes/episode.roles'
import {ShowFactory} from '@caster/shows/test/factories/show.factory'
import {EpisodeFactory} from '@caster/shows/test/factories/episodes.factory'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'

import {AppModule} from '../src/app.module'

// Work around issues when json is stringified and parsed
const reserialize = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

describe('Events', () => {
  let app: INestApplication
  let port: string
  let defaultHeaders: Record<string, string>

  let user: User
  let otherUser: User
  let show: Show
  let episode: Episode

  let profile: Profile
  let otherProfile: Profile

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = new PrismaService()

  const createSocket = async (
    headers: Record<string, string> = defaultHeaders
  ) => {
    let connected = false

    const isConnected = async () => connected

    const state: {
      events: {eventName: string; args: unknown[]}[]
    } = {
      events: [],
    }

    const socket = io(`http://localhost:${port}`, {
      extraHeaders: headers,
      transports: ['websocket'],
      path: '/socket.io/',
    })

    socket.on('connect', () => {
      connected = true
    })

    socket.onAny((eventName, ...args) => {
      state.events.push({eventName, args})
    })

    await retry(isConnected, 10)

    expect(connected).toBe(true)

    return {socket, state}
  }

  beforeAll(async () => {
    await prisma.user.deleteMany({where: {}})
    await prisma.profile.deleteMany({where: {}})
    await prisma.show.deleteMany({where: {}})
    await prisma.episode.deleteMany({where: {}})
    await prisma.roleGrant.deleteMany({where: {}})

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    await app.init()

    const test = supertest(app.getHttpServer()).post('/')

    const url = new URL(test.url)
    port = url.port

    defaultHeaders = {
      Authorization: `Bearer ${credentials.token}`,
    }
  })

  beforeAll(async () => {
    const {username} = credentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    user = await prisma.user.create({data: {username, isActive: true}})

    profile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: user.id}),
    })

    show = await prisma.show.create({
      data: ShowFactory.makeCreateInput(),
    })

    episode = await prisma.episode.create({
      data: EpisodeFactory.makeCreateInput({showId: show.id}),
    })

    // Give the primary profile the Guest role
    await prisma.roleGrant.create({
      data: {
        profileId: profile.id,
        roleKey: Guest.key,
        subjectTable: 'Episode',
        subjectId: episode.id,
      },
    })
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    otherUser = await prisma.user.create({data: {username, isActive: true}})

    otherProfile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: otherUser.id}),
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Event: ClientRegister', () => {
    let registerEvent: ClientRegister

    beforeAll(() => {
      registerEvent = {
        episodeId: episode.id,
        profileId: profile.id,
      }
    })

    it('acknowledges the event', async () => {
      const {state, socket} = await createSocket()

      socket.emit(EventTypes.ClientRegister, registerEvent)

      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: EventTypes.ClientRegistered,
          args: [registerEvent],
        },
      ])
    })

    it('requires authentication', async () => {
      const {socket, state} = await createSocket({})

      socket.emit(EventTypes.ClientRegister, registerEvent)

      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: 'exception',
          args: [{message: 'Unauthorized', status: 'error'}],
        },
      ])
    })

    it('requires authorization', async () => {
      /**
       * The secondary user
       */

      const {socket, state} = await createSocket({
        Authorization: `Bearer ${altCredentials.token}`,
      })

      socket.emit(EventTypes.ClientRegister, {
        ...registerEvent,
        profileId: otherProfile.id,
      })

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: 'exception',
          args: [{status: 'error', message: 'Forbidden'}],
        },
      ])
    })
  })

  describe('Event: MessageSend', () => {
    let registerEvent: ClientRegister
    let sendEvent: MessageSend

    beforeAll(() => {
      registerEvent = {
        episodeId: episode.id,
        profileId: profile.id,
      }

      sendEvent = {
        episodeId: episode.id,
        text: 'Test message',
      }
    })

    it('echoes the message back via a MessageReceived event', async () => {
      const {socket, state} = await createSocket()

      socket.emit(EventTypes.ClientRegister, registerEvent)

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => state.events.length, 10)

      // Reset the event state
      state.events = []

      socket.emit(EventTypes.MessageSend, sendEvent)

      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: 'message-receive',
          args: [
            {
              episodeId: episode.id,
              sender: reserialize(omit(profile, ['content'])),
              text: 'Test message',
            },
          ],
        },
      ])
    })

    it('sends the message to other subscribers', async () => {
      /**
       * The primary user
       */

      const {socket, state} = await createSocket()

      socket.emit(EventTypes.ClientRegister, registerEvent)

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => state.events.length, 10)

      // Reset the event state
      state.events = []

      /**
       * The secondary user
       */

      // First grant permission
      await prisma.roleGrant.create({
        data: {
          profileId: otherProfile.id,
          roleKey: Reader.key,
          subjectTable: 'Episode',
          subjectId: episode.id,
        },
      })

      const {socket: otherSocket, state: otherState} = await createSocket({
        Authorization: `Bearer ${altCredentials.token}`,
      })

      otherSocket.emit(EventTypes.ClientRegister, {
        ...registerEvent,
        profileId: otherProfile.id,
      })

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => otherState.events.length, 10)

      expect(otherState.events).toEqual([
        {
          eventName: EventTypes.ClientRegistered,
          args: [{...registerEvent, profileId: otherProfile.id}],
        },
      ])

      // Reset the event state
      otherState.events = []

      /**
       * The test
       */

      // Send with the primary user
      socket.emit(EventTypes.MessageSend, sendEvent)

      // Receive with the secondary user
      await retry(async () => otherState.events.length, 10)

      expect(otherState.events).toEqual([
        {
          eventName: 'message-receive',
          args: [
            {
              episodeId: episode.id,
              sender: reserialize(
                // With a censored user
                omit(profile, ['email', 'user', 'userId', 'content'])
              ),
              text: 'Test message',
            },
          ],
        },
      ])

      // Finally, revoke permission to return to status quo
      await prisma.roleGrant.deleteMany({
        where: {
          profileId: otherProfile.id,
          subjectTable: 'Episode',
          subjectId: episode.id,
        },
      })
    })

    it('requires authorization', async () => {
      const {socket, state} = await createSocket({
        Authorization: `Bearer ${altCredentials.token}`,
      })

      // Grant read permission
      await prisma.roleGrant.create({
        data: {
          profileId: otherProfile.id,
          roleKey: Reader.key,
          subjectTable: 'Episode',
          subjectId: episode.id,
        },
      })

      socket.emit(EventTypes.ClientRegister, {
        ...registerEvent,
        profileId: otherProfile.id,
      })

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => state.events.length, 10)

      // Reset the event state
      state.events = []

      socket.emit(EventTypes.MessageSend, sendEvent)

      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: 'exception',
          args: [
            {
              status: 'error',
              message: 'Forbidden',
            },
          ],
        },
      ])

      // Revoke permission
      await prisma.roleGrant.deleteMany({
        where: {
          profileId: otherProfile.id,
          subjectTable: 'Episode',
          subjectId: episode.id,
        },
      })
    })

    it('throws errors when no associated Profile is found', async () => {
      const {socket, state} = await createSocket()

      socket.emit(EventTypes.ClientRegister, registerEvent)

      // Wait for the ClientRegistered acknowledge event
      await retry(async () => state.events.length, 10)

      // Reset the event state
      state.events = []

      // Delete the profile and roleGrants
      await prisma.roleGrant.deleteMany({
        where: {profileId: profile.id},
      })
      await prisma.profile.delete({
        where: {id: profile.id},
      })

      socket.emit(EventTypes.MessageSend, sendEvent)

      await retry(async () => state.events.length, 10)

      expect(state.events).toEqual([
        {
          eventName: 'exception',
          args: [
            {
              message: 'No User Profile found',
              status: 'error',
            },
          ],
        },
      ])

      // Restore the profile
      await prisma.profile.create({
        data: {
          ...omit(profile, ['user', 'userId']),
          content: undefined,
          user: {connect: {id: user.id}},
        } as Prisma.ProfileCreateInput,
      })

      // Give the profile the Guest role back
      await prisma.roleGrant.create({
        data: {
          profileId: profile.id,
          roleKey: Guest.key,
          subjectTable: 'Episode',
          subjectId: episode.id,
        },
      })
    })
  })
})
