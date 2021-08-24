import {Controller, Get} from '@nestjs/common'

export interface HealthCheck {
  pong: true
}

@Controller('_health')
export class HealthController {
  @Get('ping')
  public ping(): HealthCheck {
    return {pong: true}
  }
}
