import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {ForbiddenException, NotFoundException} from '@nestjs/common'

import {UserSub} from '@caster/utils'

import {User} from './user.model'
import {
  CreateUserInput,
  MutateUserResult,
  UpdateUserInput,
} from './user-input.model'
import {UsersService} from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Query(() => User)
  async getCurrentUser(@UserSub({require: true}) username: string) {
    return this.service.getByUsername(username)
  }

  @Mutation(() => MutateUserResult)
  async createUser(
    @Args('input') input: CreateUserInput,
    @UserSub({require: true}) username: string
  ) {
    if (input.username !== username) {
      throw new ForbiddenException()
    }

    const user = await this.service.create(input)

    return {user}
  }

  @Mutation(() => MutateUserResult)
  async getOrCreateCurrentUser(
    @Args('input') input: CreateUserInput,
    @UserSub({require: true}) username: string
  ) {
    if (input.username !== username) {
      throw new ForbiddenException()
    }

    const existing = await this.service.getByUsername(username)
    if (existing) {
      return {user: existing}
    }

    const user = await this.service.create(input)

    return {user}
  }

  @Mutation(() => MutateUserResult)
  async updateCurrentUser(
    @Args('input') input: UpdateUserInput,
    @UserSub({require: true}) username: string
  ) {
    if (input.username !== username) {
      throw new ForbiddenException()
    }

    const existing = await this.service.getByUsername(username)
    if (!existing) {
      throw new NotFoundException()
    }

    const user = await this.service.update(existing.id, input)

    return {user}
  }
}
