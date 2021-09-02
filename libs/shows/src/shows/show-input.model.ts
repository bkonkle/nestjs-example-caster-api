import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Show} from './show.model'

@InputType()
export class CreateShowInput {
  @Field(() => String)
  title!: string

  @Field(() => String, {nullable: true})
  summary?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null
}

@InputType()
export class UpdateShowInput {
  @Field(() => String, {nullable: true})
  title?: string

  @Field(() => String, {nullable: true})
  summary?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null
}

@ObjectType()
export class MutateShowResult {
  @Field(() => Show, {nullable: true})
  show?: Show | null
}
