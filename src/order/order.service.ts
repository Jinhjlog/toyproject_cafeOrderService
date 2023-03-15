import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CoreService } from '../core/core.service';

@Injectable()
export class OrderService {
  @Inject()
  private jwtService: JwtService;

  @Inject()
  private coreService: CoreService;

  // 주문 목록 가져오기
  async getMyOrder(headers) {
    if (headers.authorization) {
      const userInfo = await this.tokenDecode(headers);

      const orderList = [];
      const orderData = await this.coreService.query(
        'order',
        null,
        'get',
        null,
      );
      orderData.forEach((doc) => {
        if (userInfo.user_email === doc.data().user_email) {
          const temp = doc.data();
          temp.docId = doc.id;
          orderList.push(temp);
        }
      });

      return orderList;
    } else {
      throw new NotFoundException('Not Found');
    }
  }

  // 주문 번호로 주문 정보 가져오기
  async getNumOrder(orderNum: number) {
    const dbList = await this.getAdminOrder();
    let orderData = null;
    await dbList.forEach((doc) => {
      if (doc.order_num === orderNum) {
        orderData = doc;
      }
    });

    if (!orderData) {
      throw new NotFoundException('주문 기록이 없음');
    }

    return orderData;
  }

  // 주문 하기
  async postOrder(headers, orderData) {
    // 회원
    if (headers.authorization) {
      const userInfo = await this.tokenDecode(headers);
      orderData.user_email = userInfo.user_email;

      return await this.setOrder(orderData);
    } else {
      // 비회원
      orderData.user_email = 'none';
      return await this.setOrder(orderData);
    }
  }

  // 모든 주문 목록 가져오기
  async getAdminOrder() {
    const allOrderList = [];
    const dbData = await this.coreService.query('order', null, 'get', null);

    await dbData.forEach((doc) => {
      const temp = doc.data();
      if (doc.id != 'orderNumber') {
        temp.docId = doc.id;
        allOrderList.push(temp);
      }
    });

    return allOrderList;
  }

  // 주문 상태변경
  async putOrder(data) {
    const orderList = await this.getAdminOrder();
    let orderData;

    await orderList.forEach((doc) => {
      if (doc.docId === data.docId) {
        orderData = doc;
      }
    });

    if (!orderData) {
      throw new NotFoundException();
    }

    if (orderData.order_state === '주문 취소') {
      throw new UnauthorizedException('주문 취소됨');
    }

    if (data.order_est_time) {
      orderData.order_est_time = data.order_est_time;
    }

    orderData.order_state = data.order_state;
    return await this.coreService.query('order', data.docId, 'set', orderData);
  }

  // 주문 취소하기 (고객)
  async cancelOrder(docId: string) {
    const dbData = await this.coreService.query('order', docId, 'get', null);
    if (dbData.data().order_state != '접수 대기') {
      throw new UnauthorizedException('조리가 이미 시작 됨');
    }

    const orderData = dbData.data();
    orderData.order_state = '주문 취소';

    return await this.coreService.query('order', docId, 'set', orderData);
  }

  // 주문 메소드
  private async setOrder(orderData1) {
    const orderData = JSON.parse(JSON.stringify(orderData1));

    const dbOrderNum = await this.coreService.query(
      'order',
      'orderNumber',
      'get',
      null,
    );
    if (dbOrderNum.data() == undefined) {
      await this.coreService.query('order', 'orderNumber', 'set', {
        number: 0,
      });
    }

    orderData.order_num = dbOrderNum.data().number + 1;
    // 날짜, 시간 가져오기
    const today = await this.getDate();

    // 예상시간 null
    orderData.order_est_time = null;
    // 주문상태 : 접수 대기
    orderData.order_state = '접수 대기';
    // 주문 날짜
    orderData.order_date = today.date;
    // 주문 시간
    orderData.order_time = today.time;

    await this.coreService.query('order', 'orderNumber', 'set', {
      number: dbOrderNum.data().number + 1,
    });

    await this.coreService.query('order', null, 'set', orderData);
    return { result: '주문완료', order_num: dbOrderNum.data().number + 1 };
  }

  private async tokenDecode(headers) {
    return await JSON.parse(
      JSON.stringify(this.jwtService.decode(headers.authorization.slice(7))),
    );
  }

  // 오늘 날짜 시간 가져오기
  async getDate() {
    const date = new Date();

    const today = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(
      -2,
    )}-${('0' + date.getDate()).slice(-2)}`;
    const time = `${('0' + date.getHours()).slice(-2)}:${(
      '0' + date.getMinutes()
    ).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

    return {
      date: today,
      time: time,
    };
  }
}
