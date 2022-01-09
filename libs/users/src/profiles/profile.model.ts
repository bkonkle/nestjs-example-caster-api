import GraphQLTypeJson from 'graphql-type-json'
import {Field, ID, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {User} from '../user.model'

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string

  // Nullable because this field may be censored for unauthorized users
  @Field(() => String, {nullable: true})
  email?: string | null

  @Field(() => String, {nullable: true})
  displayName?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue

  @Field(() => String, {nullable: true})
  city?: string | null

  @Field(() => String, {nullable: true})
  stateProvince?: string | null

  @Field(() => String, {nullable: true})
  userId?: string | null

  @Field(() => User, {nullable: true})
  user?: User | null

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
