import GraphQLTypeJson from 'graphql-type-json'
import {Field, ID, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {User} from '../users/user.model'

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string

  @Field(() => String, {nullable: true})
  email?: string | null

  @Field(() => String, {nullable: true})
  displayName?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field(() => String, {nullable: true})
  city?: string | null

  @Field(() => String, {nullable: true})
  stateProvince?: string | null

  @Field(() => User, {nullable: true})
  user?: User | null

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}