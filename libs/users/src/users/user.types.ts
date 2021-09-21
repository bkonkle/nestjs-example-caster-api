import {Profile, User} from '@prisma/client'

export type UserWithProfile = User & {profile: Profile | null}
