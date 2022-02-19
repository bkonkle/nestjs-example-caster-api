import {
  ConsoleLogger,
  DynamicModule,
  FactoryProvider,
  Logger,
  Module,
} from '@nestjs/common'
import Redis from 'ioredis'

import {ProfilesModule} from '@caster/users/profiles/profiles.module'
import {Config} from '@caster/utils/config/config.types'

import {EventsGateway} from './events.gateway'
import {Publisher, Subscriber} from './event.types'
import {ChannelService} from './channel.service'

export interface EventsOptions {
  url?: string
}

export interface RedisSettings {
  publisher?: boolean
}

/**
 * A Redis factory provider that can act as either a Cubscriber or a Publisher
 */
const redisProvider = (
  options: EventsOptions = {},
  settings: RedisSettings = {}
): FactoryProvider<Redis.Redis> => ({
  provide: settings.publisher ? Publisher : Subscriber,
  useFactory: (config: Config) =>
    new Redis(options.url || config.get('redis.url')),
  inject: [Config],
})

/**
 * WebSocket event handling via the EventsGateway
 */
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
        redisProvider(options),
        redisProvider(options, {publisher: true}),
      ],
    }
  }
}
