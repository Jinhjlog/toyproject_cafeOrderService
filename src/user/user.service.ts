import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CoreService } from '../core/core.service';

@Injectable()
export class UserService {
  @Inject()
  private jwtService: JwtService;

  @Inject()
  private coreService: CoreService;

  // 로그인
  async signIn(data) {
    const db_data = await this.coreService.query('user', null, 'get', null);
    let temp_data;
    await db_data.forEach((doc) => {
      if (doc.data().user_email === data.user_email) {
        temp_data = doc.data();
      }
    });
    if (!temp_data) {
      return '로그인 실패';
    }
    const pw_check = await bcrypt.compare(data.user_pw, temp_data.user_pw);
    if (!temp_data || !pw_check) {
      return '로그인 실패';
    }
    const payload = {
      user_email: temp_data.user_email,
      user_name: temp_data.user_name,
      user_role: temp_data.user_role,
    };

    // AccessToken
    const token = await this.getToken(payload);
    await this.coreService.query(
      'refreshToken',
      temp_data.user_email,
      'set',
      token,
    );

    return token;
  }

  // 로그아웃
  async signOut(headerData) {
    let de = headerData.authorization.substring(7);
    de = this.jwtService.decode(de);

    await this.coreService.query('refreshToken', de.user_email, 'delete', null);

    return '로그아웃';
  }

  // 회원가입
  async signUp(data) {
    const check = await this.emailDupCheck(data.user_email);

    if (!check) {
      return '이메일 중복';
    }
    data.user_pw = await this.hashPassword(data.user_pw);

    await this.coreService.query('user', null, 'set', {
      user_email: data.user_email,
      user_name: data.user_name,
      user_pw: data.user_pw,
      user_role: data.user_role,
    });

    return '계정 생성';
  }

  // 이메일 중복체크
  async emailDupCheck(user_email): Promise<boolean> {
    let bool = true;

    const data = await this.coreService.query('user', null, 'get', null);
    data.forEach((doc) => {
      if (user_email === doc.data().user_email) {
        bool = false;
      }
    });
    return bool;
  }

  // bcrypt
  async hashPassword(plainText: string): Promise<string> {
    // 해싱 알고리즘 10번 반복
    const saltOrRound = 10;
    return await bcrypt.hash(plainText, saltOrRound);
  }

  // 토큰 refresh
  async refreshToken(temp_data) {
    let bool = false;
    const value = await this.coreService.query(
      'refreshToken',
      null,
      'get',
      null,
    );
    value.forEach((doc) => {
      if (doc.id === temp_data.user_email) {
        bool = true;
      }
    });

    if (!bool) {
      return null;
    }

    const payload = {
      user_email: temp_data.user_email,
      user_name: temp_data.user_name,
      user_role: temp_data.user_role,
      sub: '0',
    };

    const token = await this.getToken(payload);

    return token;
  }

  // 토큰 발급
  async getToken(payload) {
    let adminToken = null;
    if (payload.user_role === 'admin') {
      adminToken = this.jwtService.sign(payload, {
        secret: 'admin',
        expiresIn: '3h',
      });
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: 'customer',
      expiresIn: '3h',
    });

    // refreshToken
    const refreshToken = this.jwtService.sign(payload, {
      secret: 'refresh',
      expiresIn: '1d',
    });

    return adminToken
      ? {
          accessToken: accessToken,
          refreshToken: refreshToken,
          adminToken: adminToken,
        }
      : { accessToken: accessToken, refreshToken: refreshToken };
  }
}
