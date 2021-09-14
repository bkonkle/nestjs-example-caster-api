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

import {Episode} from './episode.model'

@ObjectType()
export class EpisodesPage {
  @Field(() => [Episode])
  data!: Episode[]

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
export class EpisodeCondition {
  @Field(() => ID, {nullable: true})
  id?: string | null

  @Field(() => String, {nullable: true})
  title?: string

  @Field(() => String, {nullable: true})
  summary?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field(() => String, {nullable: true})
  showId?: string | null

  @Field(() => Date, {nullable: true})
  createdAt?: Date | null

  @Field(() => Date, {nullable: true})
  updatedAt?: Date | null
}

export enum EpisodesOrderBy {
  ID_ASC = 'ID_ASC',
  ID_DESC = 'ID_DESC',
  TITLE_ASC = 'TITLE_ASC',
  TITLE_DESC = 'TITLE_DESC',
  SUMMARY_ASC = 'SUMMARY_ASC',
  SUMMARY_DESC = 'SUMMARY_DESC',
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  UPDATED_AT_ASC = 'UPDATED_AT_ASC',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
}

registerEnumType(EpisodesOrderBy, {
  name: 'EpisodesOrderBy',
})
