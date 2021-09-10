import {NotFoundException, UseGuards} from '@nestjs/common'
import {Args, ID, Int, Mutation, Query, Resolver} from '@nestjs/graphql'

import {AllowAnonymous, JwtGuard, UserSub} from '@caster/authn'
import {fromOrderByInput} from '@caster/utils'

import {Show} from './show.model'
import {ShowsService} from './shows.service'
import {fromShowCondition} from './show.utils'
import {ShowCondition, ShowsOrderBy, ShowsPage} from './show-query.model'
import {
  CreateShowInput,
  UpdateShowInput,
  MutateShowResult,
} from './show-input.model'

@Resolver(() => Show)
@UseGuards(JwtGuard)
export class ShowsResolver {
  constructor(private readonly service: ShowsService) {}

  @Query(() => Show, {nullable: true})
  @AllowAnonymous()
  async getShow(
    @Args('id', {type: () => ID}) id: string
  ): Promise<Show | undefined> {
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
      where: fromShowCondition(where),
      orderBy: fromOrderByInput(orderBy),
      pageSize,
      page,
    })
  }

  @Mutation(() => MutateShowResult)
  async createShow(
    @Args('input') input: CreateShowInput,
    @UserSub({require: true}) username: string
  ): Promise<MutateShowResult> {
    await this.canCreate(input, username)

    const show = await this.service.create(input)

    return {show}
  }

  @Mutation(() => MutateShowResult)
  async updateShow(
    @Args('id', {type: () => ID}) id: string,
    @Args('input') input: UpdateShowInput,
    @UserSub({require: true}) username: string
  ) {
    await this.canUpdate(id, username)

    const show = await this.service.update(id, input)

    return {show}
  }

  @Mutation(() => Boolean)
  async deleteShow(
    @Args('id', {type: () => ID}) id: string,
    @UserSub({require: true}) username: string
  ): Promise<boolean> {
    await this.canUpdate(id, username)

    await this.service.delete(id)

    return true
  }

  private async canCreate(
    _input: CreateShowInput,
    _username: string
  ): Promise<void> {
    // TODO
  }

  private async canUpdate(id: string, _username: string): Promise<void> {
    const existing = await this.service.get(id)

    if (!existing) {
      throw new NotFoundException()
    }

    // TODO
  }
}
