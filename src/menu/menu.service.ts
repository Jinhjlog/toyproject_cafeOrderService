import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CoreService } from '../core/core.service';

@Injectable()
export class MenuService {
  @Inject()
  private coreService: CoreService;

  // 메뉴 입력
  async insertMenu(data) {
    const menuList = await this.getMenu();
    let bool = true;

    // 메뉴 명 중복 확인
    await menuList.forEach((menu) => {
      if (menu.menu_name === data.menu_name) {
        bool = false;
      }
    });
    if (!bool) {
      return '메뉴명 중복';
    }

    // 이미지가 없을 경우
    if (!data.menu_img) {
      data.menu_img = '';
    }

    const result = await this.coreService.query('menu_item', null, 'set', {
      menu_name: data.menu_name,
      menu_price: data.menu_price,
      menu_state: data.menu_state,
      menu_type: data.menu_type,
      menu_img: data.menu_img,
    });

    return result;
  }

  // 전체 상품목록을 가져옴
  async getMenu() {
    const menuList = [];
    const data = await this.coreService.query('menu_item', null, 'get', null);

    data.forEach((doc) => {
      const temp = doc.data();
      temp.docId = doc.id;
      menuList.push(temp);
    });

    return menuList;
  }

  // 메뉴 수정
  async updateMenu(menuData) {
    const tempList = await this.getMenu();
    const menuList = [];
    let bool = true;
    await tempList.forEach((list) => {
      if (list.docId !== menuData.docId) {
        menuList.push(list);
      }
    });

    await menuList.forEach((list) => {
      if (list.menu_name === menuData.menu_name) {
        bool = false;
      }
    });
    if (!bool) {
      return '메뉴명 중복';
    }

    await this.coreService.query('menu_item', menuData.docId, 'set', {
      menu_name: menuData.menu_name,
      menu_price: menuData.menu_price,
      menu_state: menuData.menu_state,
      menu_type: menuData.menu_type,
      menu_img: menuData.menu_img,
    });
  }

  // 메뉴 삭제
  async deleteMenu(docId) {
    await this.coreService.query('menu_item', docId, 'delete', null);
    return 'delete';
  }
}
