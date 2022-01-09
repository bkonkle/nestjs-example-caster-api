import faker from 'faker'
import {Profile, User} from '@prisma/client'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {omit, pick} from 'lodash'
import {PrismaService} from 'nestjs-prisma'

import {OAuth2} from '@caster/utils/test/oauth2'
import {GraphQL} from '@caster/utils/test/graphql'
import {Validation} from '@caster/utils/test/validation'
import {CreateProfileInput} from '@caster/users/profiles/profile-mutations.model'
import {ProfileFactory} from '@caster/users/test/factories/profile.factory'
import {Query, Mutation} from '@caster/graphql/schema'
import {fixJsonInput} from '@caster/utils/types'

import {AppModule} from '../src/app.module'

describe('Profiles', () => {
  let app: INestApplication
  let graphql: GraphQL

  let user: User
  let otherUser: User

  const {credentials, altCredentials} = OAuth2.init()
  const prisma = new PrismaService()

  const createProfile = (input: CreateProfileInput) =>
    prisma.profile.upsert({
      include: {user: true},
      where: {userId: input.userId},
      create: fixJsonInput(input),
      update: fixJsonInput(input),
    })

  const deleteProfile = (id: string) => prisma.profile.delete({where: {id}})

  const mockCensor = (profile?: Partial<Profile>) => ({
    ...profile,
    email: null,
    user: null,
  })

  beforeAll(async () => {
    await prisma.user.deleteMany({where: {}})
    await prisma.profile.deleteMany({where: {}})

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())

    await app.init()

    graphql = new GraphQL(app.getHttpServer())
  })

  beforeAll(async () => {
    const {username} = credentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    user = await prisma.user.create({data: {username, isActive: true}})
  })

  beforeAll(async () => {
    const {username} = altCredentials

    if (!username) {
      throw new Error('No username found in OAuth2 credentials')
    }

    otherUser = await prisma.user.create({data: {username, isActive: true}})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Mutation: createProfile', () => {
    const mutation = `
      mutation CreateProfile($input: CreateProfileInput!) {
        createProfile(input: $input) {
          profile {
            id
            email
            displayName
            picture
            user {
              id
            }
          }
        }
      }
    `

    it('creates a new user profile', async () => {
      const {token} = credentials
      const profile = omit(ProfileFactory.makeCreateInput({userId: user.id}), [
        'user',
      ])
      const variables = {input: profile}

      const expected = {
        ...profile,
        id: expect.stringMatching(Validation.uuidRegex),
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'createProfile'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.createProfile).toHaveProperty(
        'profile',
        expect.objectContaining({
          ...omit(expected, 'userId'),
          user: {id: user.id},
        })
      )

      const created = await prisma.profile.findFirst({
        where: {id: data.createProfile.profile?.id},
      })

      if (!created) {
        fail('No profile created.')
      }

      expect(created).toMatchObject({
        ...expected,
        id: data.createProfile.profile?.id,
      })

      await prisma.profile.delete({
        where: {id: created.id},
      })
    })

    it('requires an email address and a userId', async () => {
      const {token} = credentials
      const profile = omit(ProfileFactory.makeCreateInput(), [
        'userId',
        'email',
      ])
      const variables = {input: profile}

      const body = await graphql.mutation(mutation, variables, {
        token,
        statusCode: 400,
        warn: false,
      })

      expect(body).toHaveProperty(
        'errors',
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(
              'Field "email" of required type "String!" was not provided.'
            ),
          }),
          expect.objectContaining({
            message: expect.stringContaining(
              'Field "userId" of required type "String!" was not provided.'
            ),
          }),
        ])
      )
    })

    it('requires authentication', async () => {
      const profile = ProfileFactory.makeCreateInput({userId: user.id})
      const variables = {input: profile}

      const body = await graphql.mutation(mutation, variables, {warn: false})

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {message: 'Unauthorized', statusCode: 401},
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = credentials
      const profile = omit(
        ProfileFactory.makeCreateInput({userId: otherUser.id}),
        ['user']
      )
      const variables = {input: profile}

      const body = await graphql.mutation(mutation, variables, {
        token,
        warn: false,
      })

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Forbidden',
          extensions: {
            code: 'FORBIDDEN',
            response: {
              message: 'Forbidden',
              statusCode: 403,
            },
          },
        }),
      ])
    })
  })

  describe('Query: getProfile', () => {
    let profile: Profile
    let profileInput: CreateProfileInput

    const query = `
      query GetProfile($id: ID!) {
        getProfile(id: $id) {
          id
          email
          displayName
          picture
          user {
            id
          }
        }
      }
    `
    const fields = ['id', 'email', 'displayName', 'picture', 'user.id']

    beforeAll(async () => {
      profileInput = ProfileFactory.makeCreateInput({userId: user.id})

      profile = await createProfile(profileInput)
    })

    afterAll(async () => {
      try {
        await deleteProfile(profile.id)
      } catch (_err) {
        // pass
      }
    })

    it('retrieves an existing user profile', async () => {
      const {token} = credentials
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toEqual(expected)
    })

    it('returns nothing when no profile is found', async () => {
      const {token} = credentials
      const variables = {id: profile.id}

      await deleteProfile(profile.id)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toBeFalsy()

      // Restore the profile for other tests
      profile = await createProfile(profileInput)
    })

    it('censors responses for anonymous users', async () => {
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {}
      )

      expect(data.getProfile).toEqual(mockCensor(expected))
    })

    it('censors responses for unauthorized users', async () => {
      const {token} = altCredentials
      const variables = {id: profile.id}
      const expected = pick(profile, fields)

      const {data} = await graphql.query<Pick<Query, 'getProfile'>>(
        query,
        variables,
        {token}
      )

      expect(data.getProfile).toEqual(mockCensor(expected))
    })
  })

  describe('Query: getManyProfiles', () => {
    let profile: Profile
    let profileInput: CreateProfileInput

    let otherProfile: Profile
    let otherInput: CreateProfileInput

    const query = `
      query GetManyProfiles(
        $where: ProfileCondition
        $orderBy: [ProfilesOrderBy!]
        $pageSize: Int
        $page: Int
      ) {
        getManyProfiles(
        where: $where
        orderBy: $orderBy
        pageSize: $pageSize
        page: $page
        ) {
          data {
            id
            email
            displayName
            picture
            user {
              id
            }
          }
          count
          total
          page
          pageCount
        }
      }
    `
    const fields = ['id', 'email', 'displayName', 'picture', 'user.id']

    beforeAll(async () => {
      profileInput = ProfileFactory.makeCreateInput({userId: user.id})
      otherInput = ProfileFactory.makeCreateInput({userId: otherUser.id})

      profile = await createProfile(profileInput)
      otherProfile = await createProfile(otherInput)
    })

    afterAll(async () => {
      try {
        await deleteProfile(profile.id)
        await deleteProfile(otherProfile.id)
      } catch (_err) {
        // pass
      }
    })

    it('queries existing profiles', async () => {
      const {token} = credentials
      const variables = {}

      const {data} = await graphql.query<Pick<Query, 'getManyProfiles'>>(
        query,
        variables,
        {token}
      )

      expect(data.getManyProfiles).toEqual({
        data: expect.arrayContaining([
          pick(profile, fields),
          mockCensor(pick(otherProfile, fields)),
        ]),
        count: 2,
        page: 1,
        pageCount: 1,
        total: 2,
      })
    })

    it('censors responses for anonymous users', async () => {
      const variables = {}

      const {data} = await graphql.query<Pick<Query, 'getManyProfiles'>>(
        query,
        variables,
        {}
      )

      expect(data.getManyProfiles).toEqual({
        data: expect.arrayContaining([
          mockCensor(pick(profile, fields)),
          mockCensor(pick(otherProfile, fields)),
        ]),
        count: 2,
        page: 1,
        pageCount: 1,
        total: 2,
      })
    })

    it('censors responses for unauthorized users', async () => {
      const {token} = altCredentials
      const variables = {}

      const {data} = await graphql.query<Pick<Query, 'getManyProfiles'>>(
        query,
        variables,
        {token}
      )

      expect(data.getManyProfiles).toEqual({
        data: expect.arrayContaining([
          mockCensor(pick(profile, fields)),
          pick(otherProfile, fields),
        ]),
        count: 2,
        page: 1,
        pageCount: 1,
        total: 2,
      })
    })
  })

  describe('Mutation: updateProfile', () => {
    let profile: Profile
    let profileInput: CreateProfileInput

    const mutation = `
      mutation UpdateProfile($id: ID!, $input: UpdateProfileInput!) {
        updateProfile(id: $id, input: $input) {
          profile {
            id
            email
            displayName
            picture
            user {
              id
            }
          }
        }
      }
    `
    const fields = ['id', 'email', 'displayName', 'picture', 'user.id']

    beforeAll(async () => {
      profileInput = ProfileFactory.makeCreateInput({userId: user.id})

      profile = await createProfile(profileInput)
    })

    afterAll(async () => {
      try {
        await deleteProfile(profile.id)
      } catch (_err) {
        // pass
      }
    })

    it('updates an existing user profile', async () => {
      const {token} = credentials
      const variables = {
        id: profile.id,
        input: {picture: faker.internet.avatar()},
      }

      const expected = {
        ...pick(profile, fields),
        picture: variables.input.picture,
      }

      const {data} = await graphql.mutation<Pick<Mutation, 'updateProfile'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.updateProfile).toHaveProperty(
        'profile',
        expect.objectContaining(expected)
      )

      const updated = await prisma.profile.findFirst({
        include: {user: true},
        where: {id: profile.id},
      })
      expect(updated).toMatchObject(expected)

      // Restore the profile for other tests
      profile = await createProfile(profileInput)
    })

    it('requires authentication', async () => {
      const variables = {
        id: profile.id,
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation(mutation, variables, {warn: false})

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {message: 'Unauthorized', statusCode: 401},
          },
        }),
      ])
    })

    it('returns an error if no existing profile was found', async () => {
      const {token} = credentials
      const variables = {
        id: faker.datatype.uuid(),
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation<Pick<Mutation, 'updateProfile'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Not Found',
          extensions: {
            code: '404',
            response: {message: 'Not Found', statusCode: 404},
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = altCredentials
      const variables = {
        id: profile.id,
        input: {picture: faker.internet.avatar()},
      }

      const body = await graphql.mutation(mutation, variables, {
        token,
        warn: false,
      })

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Forbidden',
          extensions: {
            code: 'FORBIDDEN',
            response: {
              message: 'Forbidden',
              statusCode: 403,
            },
          },
        }),
      ])
    })
  })

  describe('Mutation: deleteProfile', () => {
    let profile: Profile
    let profileInput: CreateProfileInput

    const mutation = `
        mutation DeleteProfile($id: ID!) {
          deleteProfile(id: $id)
        }
      `

    beforeAll(async () => {
      profileInput = ProfileFactory.makeCreateInput({userId: user.id})

      profile = await createProfile(profileInput)
    })

    afterAll(async () => {
      try {
        await deleteProfile(profile.id)
      } catch (_err) {
        // pass
      }
    })

    it('deletes an existing user profile', async () => {
      const {token} = credentials
      const variables = {id: profile.id}

      const {data} = await graphql.mutation<Pick<Mutation, 'deleteProfile'>>(
        mutation,
        variables,
        {token}
      )

      expect(data.deleteProfile).toBe(true)

      const deleted = await prisma.profile.findFirst({
        where: {id: profile.id},
      })
      expect(deleted).toBeNull()

      // Restore the profile for other tests
      profile = await createProfile(profileInput)
    })

    it('requires authentication', async () => {
      const variables = {id: profile.id}

      const body = await graphql.mutation(mutation, variables, {warn: false})

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {message: 'Unauthorized', statusCode: 401},
          },
        }),
      ])
    })

    it('returns an error if no existing profile was found', async () => {
      const {token} = credentials
      const variables = {id: faker.datatype.uuid()}

      const body = await graphql.mutation<Pick<Mutation, 'deleteProfile'>>(
        mutation,
        variables,
        {token, warn: false}
      )

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Not Found',
          extensions: {
            code: '404',
            response: {
              message: 'Not Found',
              statusCode: 404,
            },
          },
        }),
      ])
    })

    it('requires authorization', async () => {
      const {token} = altCredentials
      const variables = {id: profile.id}

      const body = await graphql.mutation(mutation, variables, {
        token,
        warn: false,
      })

      expect(body).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Forbidden',
          extensions: {
            code: 'FORBIDDEN',
            response: {
              message: 'Forbidden',
              statusCode: 403,
            },
          },
        }),
      ])
    })
  })
})
