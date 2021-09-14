import GraphQLTypeJson from 'graphql-type-json'
import {Field, ID, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Show} from '../shows/show.model'

@ObjectType()
export class Episode {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  summary?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field(() => String, {nullable: true})
  showId?: string | null

  @Field(() => Show, {nullable: true})
  show?: Show | null

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
