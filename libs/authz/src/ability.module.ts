import {Module} from '@nestjs/common'
import {MetadataScanner} from '@nestjs/core/metadata-scanner'

import {RulesExplorer} from './rules.explorer'
import {AbilityFactory} from './ability.factory'

@Module({
  providers: [MetadataScanner, RulesExplorer, AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
