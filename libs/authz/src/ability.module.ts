import {Module} from '@nestjs/common'

import {AbilitiesExplorer} from './abilities.explorer'
import {AbilityFactory} from './ability.factory'

@Module({
  providers: [AbilitiesExplorer, AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
