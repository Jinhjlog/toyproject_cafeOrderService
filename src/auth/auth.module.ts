import { forwardRef, Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { JwtStrategyAdmin } from './admin/jwt.strategy.admin';
import { CoreService } from '../core/core.service';

@Module({
  imports: [],
  providers: [
    JwtStrategy,
    JwtRefreshStrategy,
    JwtStrategyAdmin,
    UserService,
    JwtService,
    CoreService,
  ],
})
export class AuthModule {}
