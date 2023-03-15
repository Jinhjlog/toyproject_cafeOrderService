import { Module } from '@nestjs/common';
import { WsAdapter } from './ws.adapter';
import { CoreModule } from '../core/core.module';
import { CoreService } from '../core/core.service';

@Module({
  imports: [CoreModule],
  providers: [WsAdapter, CoreService],
})
export class WsModule {}
