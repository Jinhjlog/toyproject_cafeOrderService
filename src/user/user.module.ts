import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { CoreService } from '../core/core.service';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [JwtModule, AuthModule, CoreModule],
  controllers: [UserController],
  providers: [UserService, CoreService],
})
export class UserModule {}
