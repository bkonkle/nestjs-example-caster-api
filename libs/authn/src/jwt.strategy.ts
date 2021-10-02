import {Inject, Injectable} from '@nestjs/common'
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {passportJwtSecret} from 'jwks-rsa'

import {Config} from '@caster/utils/config/config.types'

import {JWT} from './authn.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(Config) readonly config: Config) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.get('auth.url')}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get('auth.audience'),
      issuer: `${config.get('auth.url')}/`,
      algorithms: ['RS256'],
    })
  }

  validate(payload: JWT): JWT {
    return payload
  }
}
