import {pick} from 'lodash'
import {permittedFieldsOf, PermittedFieldsOptions} from '@casl/ability/extra'

import {Action, AppAbility, AppSubjects} from './ability.types'

export interface CensorFieldsOptions {
  ability: AppAbility
  action?: Action
  // subject: AppSubjects
  fieldOptions: PermittedFieldsOptions<AppAbility>
}

export const censorFields = <T extends AppSubjects>(
  subject: T,
  options: CensorFieldsOptions
) => {
  const {ability, action = 'read', fieldOptions} = options
  const fields = permittedFieldsOf(ability, action, subject, fieldOptions)

  return pick(subject, fields) as T
}
