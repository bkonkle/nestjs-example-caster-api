import {ParseUUIDPipe} from '@nestjs/common'
import {Args, Query, Resolver} from '@nestjs/graphql'
import {UserSub} from '@caster/utils'

import {Profile} from './profile.model'
import {ProfilesService} from './profiles.service'

@Resolver(() => Profile)
export class ProfilesResolver {
  constructor(private readonly service: ProfilesService) {}

  @Query(() => Profile)
  async getProfile(
    @Args('id', new ParseUUIDPipe()) id: string,
    @UserSub() username?: string
  ) {
    const profile = await this.service.get(id)

    if (!profile) {
      return null
    }

    return censor(username, profile)
  }
}
