import {Field, ID, ObjectType} from '@nestjs/graphql'

import {User} from '../users/user.model'

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string

  @Field({nullable: true})
  email?: string

  @Field({nullable: true})
  displayName?: string

  @Field({nullable: true})
  picture?: string

  @Field(() => Object, {nullable: true})
  content?: Record<string, unknown>

  @Field({nullable: true})
  city?: string

  @Field({nullable: true})
  stateProvince?: string

  @Field({nullable: true})
  user?: User

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
