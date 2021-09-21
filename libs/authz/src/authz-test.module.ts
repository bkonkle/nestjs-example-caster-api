import {Module} from '@nestjs/common'
import {mockDeep} from 'jest-mock-extended'

import {AbilityFactory} from './ability.factory'

const mockAbilityFactory = {
  provide: AbilityFactory,
  useFactory: () => mockDeep<AbilityFactory>(),
}

@Module({
  providers: [mockAbilityFactory],
  exports: [mockAbilityFactory],
})
export class AuthzTestModule {}
