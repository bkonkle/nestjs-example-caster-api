import {Module} from '@nestjs/common'
import {PassportModule} from '@nestjs/passport'

import {ConfigModule} from '@caster/utils'

import {JwtStrategy} from './jwt.strategy'

@Module({
  imports: [PassportModule.register({defaultStrategy: 'jwt'}), ConfigModule],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthnModule {}
