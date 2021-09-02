import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'

import {AllowAnonymous, JwtGuard, UserSub} from '@caster/utils'

import {UsersService} from '../users/users.service'
import {Profile} from './profile.model'
import {ProfilesService} from './profiles.service'
import {
  censor,
  fromOrderByInput,
  fromProfileCondition,
  isOwner,
} from './profile.utils'
import {
  ProfileCondition,
  ProfilesOrderBy,
  ProfilesPage,
} from './profile-query.model'
import {
  CreateProfileInput,
  UpdateProfileInput,
  MutateProfileResult,
} from './profile-input.model'

@Resolver(() => Profile)
@UseGuards(JwtGuard)
export class ProfilesResolver {
  constructor(
    private readonly service: ProfilesService,
    private readonly users: UsersService
  ) {}

  @Query(() => Profile, {nullable: true})
  @AllowAnonymous()
  async getProfile(
    @Args('id', {type: () => ID}) id: string,
    @UserSub() username?: string
  ): Promise<Profile | undefined> {
    const profile = await this.service.get(id)

    if (profile) {
      return censor(username, profile)
    }
  }

  @Query(() => ProfilesPage)
  @AllowAnonymous()
  async getManyProfiles(
    @Args('where', {nullable: true}) where?: ProfileCondition,
    @Args('orderBy', {nullable: true, type: () => [ProfilesOrderBy]})
    orderBy?: ProfilesOrderBy[],
    @Args('pageSize', {type: () => Int, nullable: true}) pageSize?: number,
    @Args('page', {type: () => Int, nullable: true}) page?: number,
    @UserSub() username?: string
  ): Promise<ProfilesPage> {
    const {data, ...rest} = await this.service.getMany({
      where: fromProfileCondition(where),
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })

    // Censor profiles based on the caller's username
    return {
      ...rest,
      data: data.map(censor(username)),
    }
  }

  @Mutation(() => MutateProfileResult)
  async createProfile(
    @Args('input') input: CreateProfileInput,
    @UserSub({require: true}) username: string
  ): Promise<MutateProfileResult> {
    await this.canCreate(input.userId, username)

    const profile = await this.service.create(input)

    return {profile}
  }

  @Mutation(() => MutateProfileResult)
  async updateProfile(
    @Args('id', {type: () => ID}) id: string,
    @Args('input') input: UpdateProfileInput,
    @UserSub({require: true}) username: string
  ) {
    await this.canUpdate(id, username)

    const profile = await this.service.update(id, input)

    return {profile}
  }

  @Mutation(() => Boolean)
  async deleteProfile(
    @Args('id', {type: () => ID}) id: string,
    @UserSub({require: true}) username: string
  ): Promise<boolean> {
    await this.canUpdate(id, username)

    await this.service.delete(id)

    return true
  }

  private async canCreate(userId: string, username: string): Promise<void> {
    const user = await this.users.get(userId)

    if (!user) {
      throw new BadRequestException('No user found with that id')
    }

    if (username !== user.username) {
      throw new ForbiddenException()
    }
  }

  private async canUpdate(id: string, username: string): Promise<void> {
    const existing = await this.service.get(id)

    if (!existing) {
      throw new NotFoundException()
    }

    if (!isOwner(existing, username)) {
      throw new ForbiddenException()
    }
  }
}
