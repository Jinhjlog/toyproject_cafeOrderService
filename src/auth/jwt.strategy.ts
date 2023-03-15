import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './jwt.payload';
import { getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'customer',
      ignoreExpiration: false,
    });
  }

  // 토큰 검사
  async validate(payload: Payload) {
    // payload : { user_email: 'test1', sub: '0', iat: 1677115137, exp: 1677125937 }
    // iat : 토큰이 발급된 시간 issued at
    // exp : 토큰의 만료 시간 expiraton / 시간은 NumericDate 형식

    if (payload) {
      return payload; // 리턴된 데이터는 request에 담김 / request.user
    } else {
      throw new UnauthorizedException('접근 오류');
    }
  }
}
