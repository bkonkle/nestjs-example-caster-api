import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'

import {Show} from './show.model'

@ObjectType()
export class ShowsPage {
  @Field(() => [Show])
  data!: Show[]

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
export class ShowCondition {
  @Field(() => ID, {nullable: true})
  id?: string

  @Field({nullable: true})
  title?: string

  @Field({nullable: true})
  summary?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => Date, {nullable: true})
  createdAt?: Date

  @Field(() => Date, {nullable: true})
  updatedAt?: Date
}

export enum ShowsOrderBy {
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

registerEnumType(ShowsOrderBy, {
  name: 'ShowsOrderBy',
})
