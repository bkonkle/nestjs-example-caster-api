import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Episode} from './episode.model'

@InputType()
export class CreateEpisodeInput {
  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  summary?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null

  @Field(() => String)
  showId!: string
}

@InputType()
export class UpdateEpisodeInput {
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
}

@ObjectType()
export class MutateEpisodeResult {
  @Field(() => Episode, {nullable: true})
  episode?: Episode | null
}
