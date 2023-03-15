import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpUserDto } from './dto/sign-up.user.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { JwtAuthGuardRefresh } from '../auth/jwt.auth.guard.refresh';
import { SignInUserDto } from './dto/sign-in.user.dto';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/test')
  test(@Request() req) {
    return 'test';
  }

  @Post('/signIn')
  signIn(@Body() data: SignInUserDto) {
    return this.userService.signIn(data);
  }

  @Post('/signUp')
  signUp(@Body() data: SignUpUserDto) {
    return this.userService.signUp(data);
  }

  // 해당 토큰 유저 정보 전달
  @UseGuards(JwtAuthGuard)
  @Get('/userInfo')
  userInfo(@Request() req) {
    return req.user;
  }

  // 로그아웃 // refreshToken 사용
  @Delete('/signOut')
  signOut(@Request() req) {
    return this.userService.signOut(req.headers);
  }

  // 토큰 재발급 // refreshToken 사용
  @UseGuards(JwtAuthGuardRefresh)
  @Get('/refreshToken')
  refreshToken(@Request() req) {
    return req.user;
  }
}
