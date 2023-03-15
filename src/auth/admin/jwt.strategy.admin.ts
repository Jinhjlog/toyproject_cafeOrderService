import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../jwt.payload';

@Injectable()
export class JwtStrategyAdmin extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'admin',
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload) {
    const user = payload.user_role === 'admin';

    if (user) {
      return payload;
    } else {
      throw new UnauthorizedException('접근 오류');
    }
  }
}
