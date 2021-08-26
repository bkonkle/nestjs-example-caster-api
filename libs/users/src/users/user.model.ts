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

  @Field(() => Profile, {nullable: true})
  profile?: Profile | null

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
