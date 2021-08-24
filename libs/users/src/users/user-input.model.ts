import {Field, ObjectType} from '@nestjs/graphql'

import {User} from './user.model'

@ObjectType()
export class CreateUserProfileInput {
  @Field()
  email!: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => Object, {nullable: true})
  content?: Record<string, unknown>
}

@ObjectType()
export class CreateUserInput {
  @Field()
  username!: string

  @Field({nullable: true})
  profile?: CreateUserProfileInput
}

@ObjectType()
export class UpdateUserInput {
  @Field({nullable: true})
  username?: string

  @Field({nullable: true})
  isActive?: boolean
}

@ObjectType()
export class MutateUserResult {
  @Field({nullable: true})
  user?: User
}
