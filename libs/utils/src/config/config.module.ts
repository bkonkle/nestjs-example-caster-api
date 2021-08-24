import {DynamicModule, Module} from '@nestjs/common'

import {config} from './config.default'
import {Config} from './config.types'

@Module({
  providers: [
    {
      provide: Config,
      useValue: config,
    },
  ],
  exports: [],
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
