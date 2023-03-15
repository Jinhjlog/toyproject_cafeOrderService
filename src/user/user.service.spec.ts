import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { CoreModule } from '../core/core.module';
import * as serviceAccount from '../core/firebase_key.json';
import admin from 'firebase-admin';
import { NotFoundException } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { CoreService } from "../core/core.service";

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, JwtModule, CoreModule],
      controllers: [UserController],
      providers: [UserService, CoreService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  var admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let token;

  describe('signUp', () => {
    it('user signUp', async () => {
      const result = await service.signUp({
        user_email: 'testEmail',
        user_name: 'testName',
        user_pw: '1234',
        user_role: 'customer',
      });
      expect(result).toEqual('계정 생성');
    });

    it('return 이메일 중복', async () => {
      const result = await service.signUp({
        user_email: 'testEmail',
        user_name: 'testName',
        user_pw: '1234',
        user_role: 'customer',
      });
      expect(result).toEqual('이메일 중복');
    });
  });

  describe('signIn', () => {
    it('return token', async () => {
      const result = await service.signIn({
        user_email: 'testEmail',
        user_pw: '1234',
      });
      //onsole.log(result);
      token = result;
      expect(result).toBeInstanceOf(Object);
    });

    // db 아이디 조회 실패
    it('return 로그인실패', async () => {
      const result = await service.signIn({
        user_email: 'testEmail123',
        user_pw: '1234123',
      });
      expect(result).toEqual('로그인 실패');
    });

    // 비밀번호 입력 오류
    it('return 로그인 실패', async () => {
      const result = await service.signIn({
        user_email: 'testEmail',
        user_pw: '12345',
      });
      expect(result).toEqual('로그인 실패');
    });
  });

  describe('refreshToken', () => {
    // 토큰 발급 실패
    it('return null', async () => {
      const result = await service.refreshToken({
        user_email: 'testEmail123',
      });
      //expect(result).toBeInstanceOf(NotFoundException);
      expect(result).toEqual(null);
    });

    it('return token', async () => {
      const result = await service.refreshToken({
        user_email: 'testEmail',
      });
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('getToken', () => {
    it('return userToken', async () => {
      const result = await service.getToken({
        user_email: 'testEmail',
        user_role: 'customer',
      });
      expect(result).toBeDefined();
    });

    it('return adminToken', async () => {
      const result = await service.getToken({
        user_email: 'testEmail',
        user_role: 'admin',
      });
      expect(result).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('return 로그아웃', async () => {
      const result = await service.signOut({
        authorization: 'bearer ' + token.refreshToken,
      });
      expect(result).toEqual('로그아웃');
    });
  });

  describe('deleteTestUser', () => {
    it('deleteTestUser', async () => {
      const db = getFirestore();
      const db_data = await db.collection('user').get();
      let temp_data;
      await db_data.forEach((doc) => {
        if (doc.data().user_email === 'testEmail') {
          temp_data = doc.id;
        }
      });
      await db.collection('user').doc(temp_data).delete();
    });
  });
});
