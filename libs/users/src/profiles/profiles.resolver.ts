import {Profile} from '@prisma/client'
import {ForbiddenException, NotFoundException, UseGuards} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'
import {subject} from '@casl/ability'

import {fromOrderByInput} from '@caster/utils/prisma'

import {JwtGuard} from '../authn/jwt.guard'
import {Ability, AllowAnonymous, Censor} from '../authz/authz.decorators'
import {AppAbility, CensorFields} from '../authz/authz.types'
import {AuthzGuard} from '../authz/authz.guard'
import {Profile as ProfileModel} from './profile.model'
import {ProfilesService} from './profiles.service'
import {fieldOptions, fromProfileCondition} from './profile.utils'
import {
  ProfileCondition,
  ProfilesOrderBy,
  ProfilesPage,
} from './profile-queries.model'
import {
  CreateProfileInput,
  UpdateProfileInput,
  MutateProfileResult,
} from './profile-mutations.model'

@Resolver(() => ProfileModel)
@UseGuards(JwtGuard, AuthzGuard)
export class ProfilesResolver {
  constructor(private readonly service: ProfilesService) {}

  @Query(() => ProfileModel, {nullable: true})
  @AllowAnonymous()
  async getProfile(
    @Args('id', {type: () => ID}) id: string,
    @Censor() censor: CensorFields
  ): Promise<ProfileModel | undefined> {
    const profile = await this.service.get(id)

    if (profile) {
      const result = censor(subject('Profile', profile), fieldOptions)

      return result
    }
  }

  @Query(() => ProfilesPage)
  @AllowAnonymous()
  async getManyProfiles(
    @Censor() censor: CensorFields,
    @Args('where', {nullable: true}) where?: ProfileCondition,
    @Args('orderBy', {nullable: true, type: () => [ProfilesOrderBy]})
    orderBy?: ProfilesOrderBy[],
    @Args('pageSize', {type: () => Int, nullable: true}) pageSize?: number,
    @Args('page', {type: () => Int, nullable: true}) page?: number
  ): Promise<ProfilesPage> {
    const {data, ...rest} = await this.service.getMany({
      where: fromProfileCondition(where),
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })

    const permitted = data.map((profile) =>
      censor(subject('Profile', profile), fieldOptions)
    )

    return {...rest, data: permitted}
  }

  @Mutation(() => MutateProfileResult)
  async createProfile(
    @Args('input') input: CreateProfileInput,
    @Ability() ability: AppAbility
  ): Promise<MutateProfileResult> {
    const condition = ability.can(
      'create',
      subject('Profile', input as Profile)
    )
    if (!condition) {
      throw new ForbiddenException()
    }

    const profile = await this.service.create(input)

    return {profile}
  }

  @Mutation(() => MutateProfileResult)
  async updateProfile(
    @Args('id', {type: () => ID}) id: string,
    @Args('input') input: UpdateProfileInput,
    @Ability() ability: AppAbility
  ): Promise<MutateProfileResult> {
    const existing = await this.getExisting(id)

    if (!ability.can('update', subject('Profile', existing))) {
      throw new ForbiddenException()
    }

    const profile = await this.service.update(id, input)

    return {profile}
  }

  @Mutation(() => Boolean)
  async deleteProfile(
    @Args('id', {type: () => ID}) id: string,
    @Ability() ability: AppAbility
  ): Promise<boolean> {
    const existing = await this.getExisting(id)

    if (!ability.can('delete', subject('Profile', existing))) {
      throw new ForbiddenException()
    }

    await this.service.delete(id)

    return true
  }

  private getExisting = async (id: string) => {
    const existing = await this.service.get(id)
    if (!existing) {
      throw new NotFoundException()
    }

    return existing
  }
}
