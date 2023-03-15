import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { CoreModule } from '../core/core.module';
import { CoreService } from '../core/core.service';

@Module({
  imports: [JwtModule, AuthModule, CoreModule],
  controllers: [OrderController],
  providers: [OrderService, CoreService],
})
export class OrderModule {}
