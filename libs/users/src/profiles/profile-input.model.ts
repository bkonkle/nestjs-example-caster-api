import {Field, ObjectType} from '@nestjs/graphql'

import {Profile} from './profile.model'

@ObjectType()
export class CreateProfileInput {
  @Field()
  email!: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => Object, {nullable: true})
  content?: Record<string, unknown>

  @Field()
  userId!: string
}

@ObjectType()
export class UpdateProfileInput {
  @Field({nullable: true})
  email?: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => Object, {nullable: true})
  content?: Record<string, unknown>

  @Field({nullable: true})
  userId?: string
}

@ObjectType()
export class MutateProfileResult {
  @Field({nullable: true})
  profile?: Profile
}
