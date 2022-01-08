import GraphQLTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {Show} from './show.model'

@InputType()
export class CreateShowInput {
  @Field()
  title!: string

  @Field({nullable: true})
  summary?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue
}

@InputType()
export class UpdateShowInput {
  @Field({nullable: true})
  title?: string

  @Field({nullable: true})
  summary?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphQLTypeJson, {nullable: true})
  content?: Prisma.JsonValue
}

@ObjectType()
export class MutateShowResult {
  @Field(() => Show, {nullable: true})
  show?: Show
}
