import {ConsoleLogger, Logger, Module} from '@nestjs/common'

import {EventsGateway} from './events.gateway'

@Module({
  providers: [{provide: Logger, useClass: ConsoleLogger}, EventsGateway],
})
export class EventsModule {}
