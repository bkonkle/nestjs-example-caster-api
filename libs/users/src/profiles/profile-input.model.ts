import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Profile} from './profile.model'

@InputType()
export class CreateProfileInput {
  @Field()
  email!: string

  @Field(() => String, {nullable: true})
  displayName?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field()
  userId!: string
}

@InputType()
export class UpdateProfileInput {
  @Field(() => String, {nullable: true})
  email?: string | null

  @Field(() => String, {nullable: true})
  displayName?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field(() => String, {nullable: true})
  userId?: string | null
}

@ObjectType()
export class MutateProfileResult {
  @Field(() => Profile, {nullable: true})
  profile?: Profile | null
}
