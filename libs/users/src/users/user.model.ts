import {Field, ID, ObjectType} from '@nestjs/graphql'

import {Profile} from '../profiles/profile.model'

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string

  @Field()
  username!: string

  @Field()
  isActive!: boolean

  @Field({nullable: true})
  profile?: Profile

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
