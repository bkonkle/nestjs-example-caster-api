import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {ForbiddenException, NotFoundException, UseGuards} from '@nestjs/common'

import {JwtGuard, UserSub} from '@caster/utils'

import {User} from './user.model'
import {
  CreateUserInput,
  MutateUserResult,
  UpdateUserInput,
} from './user-input.model'
import {UsersService} from './users.service'

@Resolver(() => User)
@UseGuards(JwtGuard)
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Query(() => User, {nullable: true})
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
    const existing = await this.service.getByUsername(username)
    if (!existing) {
      throw new NotFoundException()
    }

    if (existing.username !== username) {
      throw new ForbiddenException()
    }

    const user = await this.service.update(existing.id, input)

    return {user}
  }
}
