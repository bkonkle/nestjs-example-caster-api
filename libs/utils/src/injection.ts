import {Abstract, Type} from '@nestjs/common'

export type InjectionToken<T = unknown> =
  | string
  | symbol
  | Type<T>
  | Abstract<T>
