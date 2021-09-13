import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {ForbiddenException, UseGuards} from '@nestjs/common'

import {User} from './user.model'
import {
  CreateUserInput,
  MutateUserResult,
  UpdateUserInput,
} from './user-input.model'
import {UsersService} from './users.service'
import {UserGuard} from './user.guard'
import {AllowAnonymous, Username} from '@caster/authn'
import {RequestUser} from './user.decorators'

@Resolver(() => User)
@UseGuards(UserGuard)
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Query(() => User, {nullable: true})
  @AllowAnonymous()
  async getCurrentUser(
    @Username({require: true}) _username: string,
    @RequestUser() user?: User
  ) {
    return user
  }

  @Mutation(() => MutateUserResult)
  @AllowAnonymous()
  async getOrCreateCurrentUser(
    @Args('input') input: CreateUserInput,
    @Username({require: true}) username: string,
    @RequestUser() existing?: User
  ) {
    if (input.username !== username) {
      throw new ForbiddenException()
    }

    if (existing) {
      return {user: existing}
    }

    const user = await this.service.create(input)

    return {user}
  }

  @Mutation(() => MutateUserResult)
  async updateCurrentUser(
    @Args('input') input: UpdateUserInput,
    @RequestUser({require: true}) existing: User
  ) {
    const user = await this.service.update(existing.id, input)

    return {user}
  }
}
