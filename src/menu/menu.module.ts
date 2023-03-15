import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { CoreService } from '../core/core.service';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [MenuController],
  providers: [MenuService, CoreService],
})
export class MenuModule {}
