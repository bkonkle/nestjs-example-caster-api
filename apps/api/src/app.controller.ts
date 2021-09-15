import {Controller, Post} from '@nestjs/common'

@Controller()
export class AppController {
  @Post()
  async index() {
    return {pong: true}
  }
}
