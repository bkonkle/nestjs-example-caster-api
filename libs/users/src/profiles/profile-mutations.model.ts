import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Profile} from './profile.model'

@InputType()
export class CreateProfileInput {
  @Field()
  email!: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.InputJsonValue

  @Field()
  userId!: string
}

@InputType()
export class UpdateProfileInput {
  @Field({nullable: true})
  email?: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.InputJsonValue

  @Field({nullable: true})
  userId?: string
}

@ObjectType()
export class MutateProfileResult {
  @Field(() => Profile, {nullable: true})
  profile?: Profile
}
