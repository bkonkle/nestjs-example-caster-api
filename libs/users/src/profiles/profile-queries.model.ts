import GraphQLTypeJson from 'graphql-type-json'
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Profile} from './profile.model'

@ObjectType()
export class ProfilesPage {
  @Field(() => [Profile])
  data!: Profile[]

  @Field(() => Int)
  count!: number

  @Field(() => Int)
  total!: number

  @Field(() => Int)
  page!: number

  @Field(() => Int)
  pageCount!: number
}

@InputType()
export class ProfileCondition {
  @Field(() => ID, {nullable: true})
  id?: string

  @Field({nullable: true})
  email?: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue

  @Field(() => ID, {nullable: true})
  userId?: string

  @Field(() => Date, {nullable: true})
  createdAt?: Date

  @Field(() => Date, {nullable: true})
  updatedAt?: Date
}

export enum ProfilesOrderBy {
  ID_ASC = 'ID_ASC',
  ID_DESC = 'ID_DESC',
  EMAIL_ASC = 'EMAIL_ASC',
  EMAIL_DESC = 'EMAIL_DESC',
  DISPLAY_NAME_ASC = 'DISPLAY_NAME_ASC',
  DISPLAY_NAME_DESC = 'DISPLAY_NAME_DESC',
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  UPDATED_AT_ASC = 'UPDATED_AT_ASC',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
}

registerEnumType(ProfilesOrderBy, {
  name: 'ProfilesOrderBy',
})
