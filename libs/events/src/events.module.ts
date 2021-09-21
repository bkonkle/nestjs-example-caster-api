import {ConsoleLogger, DynamicModule, Logger, Module} from '@nestjs/common'
import Redis from 'ioredis'

import {ProfilesModule} from '@caster/users'
import {Config} from '@caster/utils'

import {EventsGateway} from './events.gateway'
import {IoRedis} from './event.types'
import {ChannelService} from './channel.service'

export interface EventsOptions {
  url?: string
}

@Module({
  imports: [ProfilesModule],
  providers: [
    {provide: Logger, useClass: ConsoleLogger},
    EventsGateway,
    ChannelService,
  ],
})
export class EventsModule {
  static forRoot(options: EventsOptions = {}): DynamicModule {
    return {
      module: EventsModule,
      providers: [
        {
          provide: IoRedis,
          useFactory: (config: Config) => {
            const url = options.url || config.get('redis.url')

            return new Redis(url)
          },
          inject: [Config],
        },
      ],
    }
  }
}
