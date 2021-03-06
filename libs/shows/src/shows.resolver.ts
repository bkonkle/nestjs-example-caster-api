import {Show} from '@prisma/client'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'
import {subject} from '@casl/ability'

import {JwtGuard} from '@caster/authn/jwt.guard'
import {AllowAnonymous, Ability} from '@caster/authz/authz.decorators'
import {AuthzGuard} from '@caster/authz/authz.guard'
import {AppAbility} from '@caster/authz/authz.types'
import {RolesService} from '@caster/roles/roles.service'
import {RequestUser} from '@caster/users/user.decorators'
import {UserWithProfile} from '@caster/users/user.types'
import {fromOrderByInput} from '@caster/utils/prisma'

import {Show as ShowModel} from './show.model'
import {ShowsService} from './shows.service'
import {Admin} from './show.roles'
import {ShowCondition, ShowsOrderBy, ShowsPage} from './show-queries.model'
import {
  CreateShowInput,
  UpdateShowInput,
  MutateShowResult,
} from './show-mutations.model'

@Resolver(() => ShowModel)
@UseGuards(JwtGuard, AuthzGuard)
export class ShowsResolver {
  constructor(
    private readonly service: ShowsService,
    private readonly roles: RolesService
  ) {}

  @Query(() => ShowModel, {nullable: true})
  @AllowAnonymous()
  async getShow(
    @Args('id', {type: () => ID}) id: string
  ): Promise<ShowModel | undefined> {
    const show = await this.service.get(id)

    if (show) {
      return show
    }
  }

  @Query(() => ShowsPage)
  @AllowAnonymous()
  async getManyShows(
    @Args('where', {nullable: true}) where?: ShowCondition,
    @Args('orderBy', {nullable: true, type: () => [ShowsOrderBy]})
    orderBy?: ShowsOrderBy[],
    @Args('pageSize', {type: () => Int, nullable: true}) pageSize?: number,
    @Args('page', {type: () => Int, nullable: true}) page?: number
  ): Promise<ShowsPage> {
    return this.service.getMany({
      where,
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })
  }

  @Mutation(() => MutateShowResult)
  async createShow(
    @Args('input') input: CreateShowInput,
    @RequestUser({require: true}) user: UserWithProfile,
    @Ability() ability: AppAbility
  ): Promise<MutateShowResult> {
    if (!user.profile?.id) {
      throw new BadRequestException('User object did not come with a Profile')
    }

    if (ability.cannot('create', subject('Show', input as Show))) {
      throw new ForbiddenException()
    }

    const show = await this.service.create(input)

    // Grant the Admin role to the creator
    await this.roles.grantRoles(
      user.profile?.id,
      {table: 'Show', id: show.id},
      [Admin.key]
    )

    return {show}
  }

  @Mutation(() => MutateShowResult)
  async updateShow(
    @Args('id', {type: () => ID}) id: string,
    @Args('input') input: UpdateShowInput,
    @Ability() ability: AppAbility
  ): Promise<MutateShowResult> {
    const existing = await this.getExisting(id)

    if (ability.cannot('update', subject('Show', existing))) {
      throw new ForbiddenException()
    }

    const show = await this.service.update(id, input)

    return {show}
  }

  @Mutation(() => Boolean)
  async deleteShow(
    @Args('id', {type: () => ID}) id: string,
    @Ability() ability: AppAbility
  ): Promise<boolean> {
    const existing = await this.getExisting(id)

    if (ability.cannot('delete', subject('Show', existing))) {
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
