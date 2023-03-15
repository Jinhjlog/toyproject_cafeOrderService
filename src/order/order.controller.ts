import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { doc } from 'prettier';
import { PostOrderMenuDto } from './dto/post-order.menu.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { JwtAuthGuardAdmin } from '../auth/admin/jwt.auth.guard.admin';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 상품 조회
  // 1. 내가 주문한 상품 조회 (회원)
  @UseGuards(JwtAuthGuard)
  @Get('/getMyOrder')
  getMyOrder(@Request() req) {
    return this.orderService.getMyOrder(req.headers);
  }

  // 2. 내가 주문한 상품 조회 (주문번호) (비회원)
  @Get('/getNumOrder/:orderNum')
  getNumOrder(@Param('orderNum') orderNum: number) {
    return this.orderService.getNumOrder(orderNum);
  }

  // 3. 모든 주문 조회 (관리자)
  @UseGuards(JwtAuthGuardAdmin)
  @Get('/getAdminOrder')
  getAdminOrder(@Request() req) {
    return this.orderService.getAdminOrder();
  }

  // 상품 주문 하기(회원, 비회원)
  @Post('/postOrder')
  postOrder(@Body() orderData: PostOrderMenuDto, @Request() req) {
    return this.orderService.postOrder(req.headers, orderData);
  }

  // 주문 상태변경 (관리자)
  @UseGuards(JwtAuthGuardAdmin)
  @Put('/putOrder')
  putOrder(@Body() data) {
    return this.orderService.putOrder(data);
  }

  // 주문 취소 (회원, 비회원)
  @Put('/cancelOrder/:docId')
  order(@Param('docId') docId: string) {
    return this.orderService.cancelOrder(docId);
  }
}
