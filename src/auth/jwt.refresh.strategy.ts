import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Payload } from './jwt.payload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'refresh',
      ignoreExpiration: false,
    });
  }

  @Inject()
  private userService: UserService;

  async validate(payload: Payload) {
    // console.log(payload);
    //   return 'temptoken';

    return this.userService.refreshToken(payload);
  }
}
