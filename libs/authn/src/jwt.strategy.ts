import {Inject, Injectable} from '@nestjs/common'
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {passportJwtSecret} from 'jwks-rsa'

import {Config} from '@caster/utils'

import {JWT} from './authn.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(Config) readonly config: Config) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${`https://${config.get(
          'auth.domain'
        )}/`}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get('auth.audience'),
      issuer: `https://${config.get('auth.domain')}/`,
      algorithms: ['RS256'],
    })
  }

  validate(payload: JWT): JWT {
    return payload
  }
}
