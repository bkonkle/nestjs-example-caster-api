import {Resolver} from '@nestjs/graphql'

import {Profile} from './profile.model'

@Resolver(() => Profile)
export class ProfilesResolver {}
