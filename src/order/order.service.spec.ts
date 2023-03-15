import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { OrderController } from './order.controller';
import admin from 'firebase-admin';
import * as serviceAccount from '../core/firebase_key.json';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { raw } from 'express';
import { CoreModule } from '../core/core.module';
import { CoreService } from '../core/core.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, AuthModule, CoreModule],
      controllers: [OrderController],
      providers: [OrderService, CoreService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let orderData;
  let orderData_cancel;

  describe('postOrder', () => {
    it('postOrder(member)', async () => {
      const headers = {
        authorization:
          'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2VtYWlsIjoidGVzdDEwIiwidXNlcl9uYW1lIjoidGVzdG5hbWUiLCJ1c2VyX3JvbGUiOiJjdXN0b21lciIsInN1YiI6IjAiLCJpYXQiOjE2NzcyMjUwNjIsImV4cCI6MTY3NzIyNTY2Mn0.-R9yacNDrmkR4bzBg4ZMsI9GNbwmnki33U9PLo0L6zI',
      };
      const result = await service.postOrder(headers, {
        order_addr: 'testAddr',
        order_menu: [
          {
            menu_cnt: '3',
            menu_name: 'testMenu_1',
            menu_price: '15000',
          },
          {
            menu_cnt: '1',
            menu_name: 'testMenu_2',
            menu_price: '4000',
          },
          {
            menu_cnt: '5',
            menu_name: 'testMenu_3',
            menu_price: '25000',
          },
        ],
        order_price: '44000',
      });
      orderData_cancel = result;
      expect(result).toBeDefined();
    });

    it('postOder(noneMember)', async () => {
      const headers = {
        none: '',
      };
      const result = await service.postOrder(headers, {
        order_addr: 'testAddr(none)',
        order_menu: [
          {
            menu_cnt: '3',
            menu_name: 'testMenu_1',
            menu_price: '15000',
          },
          {
            menu_cnt: '1',
            menu_name: 'testMenu_2',
            menu_price: '4000',
          },
          {
            menu_cnt: '5',
            menu_name: 'testMenu_3',
            menu_price: '25000',
          },
        ],
        order_price: '44000',
      });
      orderData = result;
      expect(result).toBeDefined();
    });
  });

  describe('getMyOrder', () => {
    it('getMyOder', async () => {
      const headers = {
        authorization:
          'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2VtYWlsIjoidGVzdDEwIiwidXNlcl9uYW1lIjoidGVzdG5hbWUiLCJ1c2VyX3JvbGUiOiJjdXN0b21lciIsInN1YiI6IjAiLCJpYXQiOjE2NzcyMjUwNjIsImV4cCI6MTY3NzIyNTY2Mn0.-R9yacNDrmkR4bzBg4ZMsI9GNbwmnki33U9PLo0L6zI',
      };
      const result = await service.getMyOrder(headers);

      expect(result).toBeDefined();
    });

    it('getMyOrder(Not Found)', async () => {
      try {
        const headers = {
          none: 'none',
        };
        const result = await service.getMyOrder(headers);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getNumOrder', () => {
    it('getNumOrder', async () => {
      const result = await service.getNumOrder(orderData.order_num);
      orderData = result;
      expect(result).toBeDefined();
    });

    it('getNumOrder', async () => {
      const result = await service.getNumOrder(orderData_cancel.order_num);
      orderData_cancel = result;
      expect(result).toBeDefined();
    });

    it('getNumOrder(Not Found)', async () => {
      try {
        const result = await service.getNumOrder(9999);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('putOrder, cancelOrder', () => {
    it('putOrder', async () => {
      orderData.order_state = '조리 시작';
      orderData.order_est_time = '15분';
      const result = await service.putOrder(orderData);
      expect(result).toBeDefined();
    });

    it('putOrder(orderData.docId = null)', async () => {
      const tempData = {
        docId: 'id',
      };
      try {
        await service.putOrder(tempData);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('cancelOrder(User : cancelError)', async () => {
      try {
        const result = await service.cancelOrder(orderData.docId);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('cancelOrder', async () => {
      const result = await service.cancelOrder(orderData_cancel.docId);
      orderData_cancel.order_state = '주문 취소';
      expect(result).toBeDefined();
    });

    it('putOrder(Admin : stateUpdateError)', async () => {
      try {
        await service.putOrder(orderData_cancel);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
