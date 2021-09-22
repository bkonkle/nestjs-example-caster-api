import {Episode} from '@prisma/client'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'
import {subject} from '@casl/ability'

import {JwtGuard} from '@caster/authn/jwt.guard'
import {Ability, AllowAnonymous} from '@caster/authz/authz.decorators'
import {AuthzGuard} from '@caster/authz/authz.guard'
import {AppAbility} from '@caster/authz/authz.types'
import {UserWithProfile} from '@caster/users/users/user.types'
import {RequestUser} from '@caster/users/users/user.decorators'
import {fromOrderByInput} from '@caster/utils/prisma'

import {Episode as EpisodeModel} from './episode.model'
import {EpisodesService} from './episodes.service'
import {fromEpisodeCondition} from './episode.utils'
import {
  EpisodeCondition,
  EpisodesOrderBy,
  EpisodesPage,
} from './episode-queries.model'
import {
  CreateEpisodeInput,
  UpdateEpisodeInput,
  MutateEpisodeResult,
} from './episode-mutations.model'

@Resolver(() => EpisodeModel)
@UseGuards(JwtGuard, AuthzGuard)
export class EpisodesResolver {
  constructor(private readonly service: EpisodesService) {}

  @Query(() => EpisodeModel, {nullable: true})
  @AllowAnonymous()
  async getEpisode(
    @Args('id', {type: () => ID}) id: string
  ): Promise<EpisodeModel | undefined> {
    const episode = await this.service.get(id)

    if (episode) {
      return episode
    }
  }

  @Query(() => EpisodesPage)
  @AllowAnonymous()
  async getManyEpisodes(
    @Args('where', {nullable: true}) where?: EpisodeCondition,
    @Args('orderBy', {nullable: true, type: () => [EpisodesOrderBy]})
    orderBy?: EpisodesOrderBy[],
    @Args('pageSize', {type: () => Int, nullable: true}) pageSize?: number,
    @Args('page', {type: () => Int, nullable: true}) page?: number
  ): Promise<EpisodesPage> {
    return this.service.getMany({
      where: fromEpisodeCondition(where),
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })
  }

  @Mutation(() => MutateEpisodeResult)
  async createEpisode(
    @Args('input') input: CreateEpisodeInput,
    @RequestUser({require: true}) user: UserWithProfile,
    @Ability() ability: AppAbility
  ): Promise<MutateEpisodeResult> {
    if (!user.profile?.id) {
      throw new BadRequestException('User object did not come with a Profile')
    }

    if (!ability.can('create', subject('Episode', input as Episode))) {
      throw new ForbiddenException()
    }

    const episode = await this.service.create(input)

    return {episode}
  }

  @Mutation(() => MutateEpisodeResult)
  async updateEpisode(
    @Args('id', {type: () => ID}) id: string,
    @Args('input') input: UpdateEpisodeInput,
    @Ability() ability: AppAbility
  ): Promise<MutateEpisodeResult> {
    const existing = await this.getExisting(id)

    if (!ability.can('update', subject('Episode', existing))) {
      throw new ForbiddenException()
    }

    const episode = await this.service.update(id, input)

    return {episode}
  }

  @Mutation(() => Boolean)
  async deleteEpisode(
    @Args('id', {type: () => ID}) id: string,
    @Ability() ability: AppAbility
  ): Promise<boolean> {
    const existing = await this.getExisting(id)

    if (!ability.can('delete', subject('Episode', existing))) {
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
