import {DynamicModule, Global, Module} from '@nestjs/common'

import {config} from './config.default'
import {Config} from './config.types'

const defaultProvider = {
  provide: Config,
  useValue: config,
}

@Global()
@Module({
  providers: [defaultProvider],
  exports: [defaultProvider],
})
export class ConfigModule {
  static for(config: Config): DynamicModule {
    const provider = {provide: Config, useValue: config}

    return {
      module: ConfigModule,
      providers: [provider],
      exports: [provider],
    }
  }
}
