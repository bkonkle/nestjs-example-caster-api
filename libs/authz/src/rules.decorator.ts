import {SetMetadata} from '@nestjs/common'

import {RULES_METADATA, RulesMetadata} from './ability.types'

export const Rules = () =>
  SetMetadata<string, RulesMetadata>(RULES_METADATA, {ruleEnhancer: true})
