import {ExecutionContext} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {Test} from '@nestjs/testing'
import {mockDeep} from 'jest-mock-extended'

import {UserFactory} from '@caster/users/test/factories/user.factory'
import {UserWithProfile} from '@caster/users/user.types'
import {UsersService} from '@caster/users/users.service'

import {AbilityFactory} from '../ability.factory'
import {AuthzGuard} from '../authz.guard'
import {ALLOW_ANONYMOUS, AppAbility, AuthRequest} from '../authz.types'

describe('AuthzGuard', () => {
  let guard: AuthzGuard

  const ability = mockDeep<AppAbility>()
  const reflector = mockDeep<Reflector>()
  const service = mockDeep<UsersService>()
  const factory = mockDeep<AbilityFactory>()
  const request = mockDeep<AuthRequest>({
    jwt: {
      sub: undefined,
    },
  })
  const handler = jest.fn()

  const httpContext = mockDeep<ReturnType<ExecutionContext['switchToHttp']>>({
    getRequest: jest.fn(),
  })

  const gqlCtx = {}
  const gqlInfo = {}
  const context = mockDeep<ExecutionContext>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getArgs: () => [{}, {}, gqlCtx, gqlInfo] as any,
  })

  const user = UserFactory.make() as UserWithProfile

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        AuthzGuard,
        {provide: Reflector, useValue: reflector},
        {provide: UsersService, useValue: service},
        {provide: AbilityFactory, useValue: factory},
      ],
    }).compile()

    guard = testModule.get(AuthzGuard)
  })

  beforeEach(() => {
    jest.clearAllMocks()

    context.getClass.mockReturnValue(AuthzGuard)
    context.getHandler.mockReturnValue(handler)

    context.switchToHttp.mockReturnValue(httpContext)
    httpContext.getRequest.mockReturnValue(request)
  })

  describe('canActivate()', () => {
    it('rejects anonymous requests by default', async () => {
      await expect(guard.canActivate(context)).rejects.toThrowError(
        'Unauthorized'
      )

      expect(reflector.getAllAndOverride).toBeCalledTimes(1)
      expect(reflector.getAllAndOverride).toBeCalledWith(ALLOW_ANONYMOUS, [
        handler,
        AuthzGuard,
      ])
    })

    it('allows anonymous requests when decorated with @AllowAnonymous()', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(true)

      const result = await guard.canActivate(context)

      expect(reflector.getAllAndOverride).toBeCalledTimes(1)

      expect(result).toEqual(true)
    })

    it('allows authenticated requests and adds context', async () => {
      const jwt = {sub: user.username}
      const authReq = {...request, jwt}

      httpContext.getRequest.mockReturnValueOnce(authReq)
      service.getByUsername.mockResolvedValueOnce(user)
      factory.createForUser.mockResolvedValueOnce(ability)

      const result = await guard.canActivate(context)

      expect(reflector.getAllAndOverride).toBeCalledTimes(1)
      expect(httpContext.getRequest).toBeCalledTimes(1)

      expect(service.getByUsername).toBeCalledTimes(1)
      expect(service.getByUsername).toBeCalledWith(user.username)

      expect(factory.createForUser).toBeCalledTimes(1)
      expect(factory.createForUser).toBeCalledWith(user)

      expect(authReq.user).toEqual(user)
      expect(authReq.ability).toEqual(ability)
      expect(authReq.censor).toEqual(expect.any(Function))

      expect(result).toEqual(true)
    })
  })
})
