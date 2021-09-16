import {Profile, User, Show, Episode} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {PrismaService} from 'nestjs-prisma'
import {Socket, io} from 'socket.io-client'
import {range} from 'lodash'
import supertest from 'supertest'
import {URL} from 'url'

import {dbCleaner, OAuth2} from '@caster/utils/test'
import {EpisodeFactory, ShowFactory} from '@caster/shows/test'
import {ProfileFactory} from '@caster/users/test'

import {AppModule} from '../src/app.module'
import {EventTypes} from '@caster/events'

const delay = async (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout))

describe('Events', () => {
  let app: INestApplication
  let clientSocket: Socket
  let connected = false

  let user: User
  let otherUser: User
  let show: Show
  let episode: Episode

  // @ts-expect-error - Needs to exist, but isn't used
  let _profile: Profile
  // @ts-expect-error - Needs to exist, but isn't used
  let _otherProfile: Profile

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = new PrismaService()

  const tables = ['User', 'Profile', 'Show', 'Episode']

  beforeAll(async () => {
    await dbCleaner(prisma, tables)

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    await app.init()

    const test = supertest(app.getHttpServer()).post('/')
    const {port} = new URL(test.url)

    clientSocket = io(`http://localhost:${port}`, {
      transports: ['websocket'],
      path: '/socket.io/',
    })

    clientSocket.on('connect', () => {
      console.log('[socket] connected')

      connected = true
    })
  })

  beforeAll(async () => {
    for (const _ of range(100)) {
      await delay(200)

      if (connected) {
        break
      }
    }

    expect(connected).toBe(true)
  })

  beforeAll(async () => {
    const {username} = credentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    user = await prisma.user.create({data: {username, isActive: true}})

    _profile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: user.id}),
    })

    show = await prisma.show.create({
      data: ShowFactory.makeCreateInput(),
    })

    episode = await prisma.episode.create({
      data: EpisodeFactory.makeCreateInput({showId: show.id}),
    })
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    otherUser = await prisma.user.create({data: {username, isActive: true}})

    _otherProfile = await prisma.profile.create({
      include: {user: true},
      data: ProfileFactory.makeCreateInput({userId: otherUser.id}),
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Event: ClientRegister', () => {
    it('handles the event', async () => {
      clientSocket.emit(EventTypes.ClientRegister, {episodeId: episode.id})

      await delay(200)
    })
  })
})
