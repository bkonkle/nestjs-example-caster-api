import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Episode} from './episode.model'

@InputType()
export class CreateEpisodeInput {
  @Field()
  title!: string

  @Field({nullable: true})
  summary?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue

  @Field()
  showId!: string
}

@InputType()
export class UpdateEpisodeInput {
  @Field({nullable: true})
  title?: string

  @Field({nullable: true})
  summary?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue

  @Field({nullable: true})
  showId?: string
}

@ObjectType()
export class MutateEpisodeResult {
  @Field(() => Episode, {nullable: true})
  episode?: Episode
}
