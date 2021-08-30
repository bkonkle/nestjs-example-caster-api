import {ParseUUIDPipe, UseGuards} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'
import {JwtGuard, paginateResponse, UserSub} from '@caster/utils'

import {UsersService} from '../users/users.service'
import {ProfileAuthz} from './profile.authz'
import {Profile} from './profile.model'
import {ProfilesService} from './profiles.service'
import {censor, fromOrderByInput, fromProfileCondition} from './profile.utils'
import {
  ProfileCondition,
  ProfilesOrderBy,
  ProfilesPage,
} from './profile-query.model'
import {CreateProfileInput, MutateProfileResult} from './profile-input.model'

@Resolver(() => Profile)
@UseGuards(JwtGuard)
export class ProfilesResolver {
  constructor(
    private readonly service: ProfilesService,
    private readonly users: UsersService,
    private readonly authz: ProfileAuthz
  ) {}

  @Query(() => Profile, {nullable: true})
  async getProfile(
    @Args('id', {type: () => ID}, new ParseUUIDPipe()) id: string,
    @UserSub() username?: string
  ): Promise<Profile | undefined> {
    const profile = await this.service.get(id)

    if (!profile) {
      return
    }

    return censor(username, profile)
  }

  @Query(() => ProfilesPage)
  async getManyProfiles(
    @Args('where', {nullable: true}) where?: ProfileCondition,
    @Args('orderBy', {nullable: true, type: () => [ProfilesOrderBy]})
    orderBy?: ProfilesOrderBy[],
    @Args('pageSize', {type: () => Int, nullable: true}) pageSize?: number,
    @Args('page', {type: () => Int, nullable: true}) page?: number,
    @UserSub() username?: string
  ): Promise<ProfilesPage> {
    const {total, profiles} = await this.service.getMany({
      where: fromProfileCondition(where),
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })

    return paginateResponse(profiles.map(censor(username)), {
      total,
      pageSize,
      page,
    })
  }

  @Mutation(() => MutateProfileResult)
  async createProfile(
    @Args('input') input: CreateProfileInput,
    @UserSub({require: true}) username: string
  ): Promise<MutateProfileResult> {
    const user = await this.users
      .get(input.userId)
      .then(this.authz.create(username))

    const profile = await this.service.create(user.id, input)

    return {profile}
  }

  @Mutation(() => MutateProfileResult)
  async updateProfile(
    @Args('id', {type: () => ID}, new ParseUUIDPipe()) id: string,
    @Args('input') input: CreateProfileInput,
    @UserSub({require: true}) username: string
  ) {
    await this.authz.update(username, id)

    const profile = await this.service.update(id, input)

    return {profile}
  }

  @Mutation(() => MutateProfileResult)
  async deleteProfile(
    @Args('id', {type: () => ID}, new ParseUUIDPipe()) id: string,
    @UserSub({require: true}) username: string
  ) {
    await this.authz.delete(username, id)

    await this.service.delete(id)

    return {}
  }
}
