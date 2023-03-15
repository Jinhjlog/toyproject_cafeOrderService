import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getFirestore } from 'firebase-admin/firestore';
import { doc } from 'prettier';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const userInfo = {
    user_email: 'e2eEmail',
    user_name: 'e2eName',
    user_pw: '1234',
    user_role: 'customer',
  };
  let userOrder;
  let userToken;
  let adminToken;
  let menuList;
  let adminOrderList;

  describe('userAllTest', () => {
    // 회원가입 > 로그인 > 토큰 refresh > 메뉴 리스트 가져오기 > 주문 > 주문 목록 가져오기 >
    // 주문 취소 > 주문 > 주문목록 가져오기 > 로그아웃
    it('userSignUp Post 201', () => {
      return request(app.getHttpServer())
        .post('/signUp')
        .send(userInfo)
        .expect(201);
    });

    it('userSignIn POST 201', async () => {
      const userRes = await request(app.getHttpServer()).post('/signIn').send({
        user_email: userInfo.user_email,
        user_pw: userInfo.user_pw,
      });

      userToken = userRes.body;
      return userRes;
    });

    it('getMenuList GET 200', () => {
      return request(app.getHttpServer()).get('/menu/getMenu').expect(200);
    });

    it('postOrder POST 201', () => {
      return request(app.getHttpServer())
        .post('/order/postOrder')
        .send({
          order_addr: '주소',
          order_menu: [
            {
              menu_cnt: '2',
              menu_name: '메뉴 이름1',
              menu_price: '6000',
            },
            {
              menu_cnt: '3',
              menu_name: '메뉴 이름2',
              menu_price: '12000',
            },
            {
              menu_cnt: '1',
              menu_name: '메뉴 이름3',
              menu_price: '6000',
            },
          ],
          order_price: '24000',
        })
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(201);
    });

    it('getMyOrder GET 200', async () => {
      const result = await request(app.getHttpServer())
        .get('/order/getMyOrder')
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(200);

      userOrder = result.body;
      return result;
    });

    it('cancelOrder PUT 200', () => {
      return request(app.getHttpServer())
        .put('/order/cancelOrder/' + userOrder[0].docId)
        .expect(200);
    });

    it('postOrder POST 201', async () => {
      const db = getFirestore();
      await db.collection('order').doc(userOrder[0].docId).delete();

      return request(app.getHttpServer())
        .post('/order/postOrder')
        .send({
          order_addr: '주소',
          order_menu: [
            {
              menu_cnt: '2',
              menu_name: '메뉴 이름1',
              menu_price: '6000',
            },
            {
              menu_cnt: '3',
              menu_name: '메뉴 이름2',
              menu_price: '12000',
            },
            {
              menu_cnt: '1',
              menu_name: '메뉴 이름3',
              menu_price: '8000',
            },
          ],
          order_price: '26000',
        })
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(201);
    });

    it('getMyOrder GET 200', async () => {
      const result = await request(app.getHttpServer())
        .get('/order/getMyOrder')
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(200);

      userOrder = result.body;
      return result;
    });

    it('signOut ', () => {
      return request(app.getHttpServer())
        .delete('/signOut')
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(200);
    });
    /*
    it('test', async () => {
      return request(app.getHttpServer())
        .get('/test')
        .set('Authorization', 'Bearer ' + userToken.accessToken)
        .expect(200);
    });*/
  });

  describe('adminAllTest', () => {
    // 로그인 -> 메뉴 작성 -> 전체 메뉴 가져오기 -> 메뉴 수정 -> 메뉴 삭제 ->
    // 모든 주문 목록 조회  -> 주문 상태 변경(조리시작 )-> 주문상태변경(조리완료)
    it('signInAdmin', async () => {
      const result = await request(app.getHttpServer()).post('/signIn').send({
        user_email: 'admin',
        user_pw: '1234',
      });

      adminToken = result.body;
      return result;
    });

    it('insertMenu', () => {
      return request(app.getHttpServer())
        .post('/menu/insert')
        .send({
          menu_name: 'e2eMenuInsertTest',
          menu_price: '3000',
          menu_state: 'tempState',
          menu_type: 'tempType',
          menu_img: 'testImg',
        })
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(201);
    });

    it('getMenu', async () => {
      const result = await request(app.getHttpServer())
        .get('/menu/getMenu')
        .expect(200);

      menuList = result.body;
    });

    it('updateMenu', async () => {
      let docId;
      await menuList.forEach((list) => {
        if (list.menu_name === 'e2eMenuInsertTest') {
          docId = list.docId;
        }
      });

      return request(app.getHttpServer())
        .put('/menu/updateMenu/')
        .send({
          menu_name: 'e2eMenuInsertTestUpdate',
          menu_price: '3000',
          menu_state: 'tempState',
          menu_type: 'tempType',
          menu_img: 'testImg',
          docId: docId,
        })
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(200);
    });

    it('getMenu', async () => {
      const result = await request(app.getHttpServer())
        .get('/menu/getMenu')
        .expect(200);

      menuList = result.body;
    });

    it('deleteMenu', async () => {
      let docId;
      await menuList.forEach((list) => {
        if (list.menu_name === 'e2eMenuInsertTestUpdate') {
          docId = list.docId;
        }
      });

      return request(app.getHttpServer())
        .delete('/menu/deleteMenu/' + docId)
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(200);
    });

    it('getAdminOrder', async () => {
      const result = await request(app.getHttpServer())
        .get('/order/getAdminOrder')
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(200);

      adminOrderList = result.body;
      // console.log(userOrder);
    });

    it('putOrder(조리 시작)', () => {
      return request(app.getHttpServer())
        .put('/order/putOrder')
        .send({
          docId: userOrder[0].docId,
          order_est_time: '15분',
          order_state: '조리 시작',
        })
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(200);
    });

    it('putOrder(조리 완료)', () => {
      return request(app.getHttpServer())
        .put('/order/putOrder')
        .send({
          docId: userOrder[0].docId,
          order_state: '조리 완료',
        })
        .set('Authorization', 'Bearer ' + adminToken.adminToken)
        .expect(200);
    });
  });
});
