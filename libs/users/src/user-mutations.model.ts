import GraphqlTypeJson from 'graphql-type-json'
import {Field, InputType, ObjectType} from '@nestjs/graphql'
import {Prisma} from '@prisma/client'

import {User} from './user.model'

@InputType()
export class CreateUserProfileInput {
  @Field()
  email!: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => GraphqlTypeJson, {nullable: true})
  content?: Prisma.JsonValue
}

@InputType()
export class CreateUserInput {
  @Field(() => CreateUserProfileInput, {nullable: true})
  profile?: CreateUserProfileInput
}

@InputType()
export class UpdateUserInput {
  @Field({nullable: true})
  username?: string

  @Field(() => Boolean, {nullable: true})
  isActive?: boolean
}

@ObjectType()
export class MutateUserResult {
  @Field(() => User, {nullable: true})
  user?: User
}
