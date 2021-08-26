import GraphqlTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {User} from './user.model'

@InputType()
export class CreateUserProfileInput {
  @Field()
  email!: string

  @Field(() => String, {nullable: true})
  displayName?: string | null

  @Field(() => String, {nullable: true})
  picture?: string | null

  @Field(() => GraphqlTypeJson, {nullable: true})
  content?: Prisma.JsonValue | null
}

@InputType()
export class CreateUserInput {
  @Field()
  username!: string

  @Field(() => CreateUserProfileInput, {nullable: true})
  profile?: CreateUserProfileInput | null
}

@InputType()
export class UpdateUserInput {
  @Field(() => String, {nullable: true})
  username?: string | null

  @Field(() => Boolean, {nullable: true})
  isActive?: boolean | null
}

@ObjectType()
export class MutateUserResult {
  @Field(() => User, {nullable: true})
  user?: User | null
}
