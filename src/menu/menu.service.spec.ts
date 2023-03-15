import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { NotFoundException } from '@nestjs/common';
import admin from 'firebase-admin';
import * as serviceAccount from '../core/firebase_key.json';
import { CoreService } from '../core/core.service';
import { CoreModule } from '../core/core.module';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [MenuService, CoreService],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertMenu', () => {
    it('insertMenu(img)', async () => {
      const result = await service.insertMenu({
        menu_name: 'insertMenuTestName(img)',
        menu_price: 'insertMenuTestPrice',
        menu_state: 'insertMenuTestState',
        menu_type: 'insertMenuTestType',
        menu_img: 'insertMenuImg',
      });
      expect(result).toBeDefined();
    });

    it('insertMenu(noImg)', async () => {
      const result = await service.insertMenu({
        menu_name: 'insertMenuTestName(noImg)',
        menu_price: 'insertMenuTestPrice',
        menu_state: 'insertMenuTestState',
        menu_type: 'insertMenuTestType',
      });
      expect(result).toBeDefined();
    });

    it('insertMenu(dpl)', async () => {
      const result = await service.insertMenu({
        menu_name: 'insertMenuTestName(img)',
        menu_price: 'insertMenuTestPrice',
        menu_state: 'insertMenuTestState',
        menu_type: 'insertMenuTestType',
        menu_img: 'insertMenuImg',
      });
      expect(result).toEqual('메뉴명 중복');
    });
  });

  describe('getMenu', () => {
    it('getMenu', () => {
      const result = service.getMenu();
      expect(result).toBeDefined();
    });
  });

  describe('updateMenu', () => {
    it('updateMenu', async () => {
      let docId;
      const menuList = await service.getMenu();
      await menuList.forEach((menu) => {
        if (menu.menu_name === 'insertMenuTestName(img)') {
          docId = menu.docId;
        }
      });

      await service.updateMenu({
        menu_name: 'insertMenuTestName(img)update',
        menu_price: 'insertMenuTestPrice',
        menu_state: 'insertMenuTestState',
        menu_type: 'insertMenuTestType',
        menu_img: 'insertMenuImgUpdate',
        docId: docId,
      });
    });
  });

  describe('deleteMenu', () => {
    it('deleteMenu1', async () => {
      let docId;
      const menuList = await service.getMenu();
      await menuList.forEach((menu) => {
        if (menu.menu_name === 'insertMenuTestName(img)update') {
          docId = menu.docId;
        }
      });

      await service.deleteMenu(docId);
    });

    it('deleteMenu2', async () => {
      let docId;
      const menuList = await service.getMenu();
      await menuList.forEach((menu) => {
        if (menu.menu_name === 'insertMenuTestName(noImg)') {
          docId = menu.docId;
        }
      });

      await service.deleteMenu(docId);
    });
  });
});
