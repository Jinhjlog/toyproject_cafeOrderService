import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { CoreService } from '../core/core.service';
@WebSocketGateway(3131, {
  cors: { origin: '*' },
})
export class WsAdapter implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @Inject()
  private coreService: CoreService;

  handleConnection() {}

  handleDisconnect() {}

  // admin은 orderDB에서 접수대기가 아니거나
  // 조리완료상태가 아닌 주문 room에 모두 접속해야한다.
  @SubscribeMessage('signIn')
  async adminSignIn(socket: Socket, userInfo) {
    const order = [];
    console.log(userInfo);
    if (userInfo.user_email === 'admin') {
      // arr변수에 admin 소켓의 room 목록을 저장함.
      const arr = [...socket.rooms];

      // admin의 소켓 id를 파이어베이스에 저장시킨다.
      await this.coreService.query('socket', 'admin', 'set', {
        user_email: 'admin',
        socketId: arr[0],
      });

      // db에서 모든 주문 목록을 가져온다.
      const orderList = await this.coreService.query(
        'order',
        null,
        'get',
        null,
      );
      // 주문 모록에서 접수대기, 조리 완료상태가 아닌 주문목록을 order 변수에 저장한다.
      orderList.forEach((list) => {
        if (
          list.data().order_state !== '접수 대기' &&
          list.data().order_state !== '조리 완료' &&
          list.data().order_state
        ) {
          order.push(list.data());
        }
      });

      //console.log(order);

      // 조리중인 주문에 해당하는 접수번호의 room 에 들어간다.
      for (let i = 0; i < order.length; i++) {
        socket.join(order[i].order_num);
      }

      console.log(socket.rooms);
      // if (userInfo.user_email === 'admin')
    } else {
      const orderList = await this.coreService.query(
        'order',
        null,
        'get',
        null,
      );

      orderList.forEach((list) => {
        if (
          list.data().order_state !== '접수 대기' &&
          list.data().order_state !== '조리 완료'
        ) {
          if (list.data().user_email === userInfo.user_email) {
            order.push(list.data());
          }
        }
      });

      // 조리중인 주문에 해당하는 접수번호의 room 에 들어간다.
      for (let i = 0; i < order.length; i++) {
        socket.join(order[i].order_num);
      }
      console.log(socket.rooms);
    }
  }

  @SubscribeMessage('userOrder')
  async order(socket: Socket, orderData) {
    // 주문누르면 주문 번호로 socketRoom을 만든다
    socket.join(orderData.orderNum);
    //console.log(orderData);

    // admin에게 주문 들어온 것을 알림
    const adminSocId = await this.coreService.query(
      'socket',
      'admin',
      'get',
      null,
    );

    socket.to(adminSocId.data().socketId).emit('orderAdminAlert', {
      orderNum: orderData.orderNum,
    });
  }

  @SubscribeMessage('orderUpdate')
  async orderUpdate(socket: Socket, orderData) {
    socket.join(orderData.orderNum);
    socket.to(orderData.orderNum).emit('orderUserAlert', '조리 시작');
  }

  @SubscribeMessage('findOrder')
  async findOrder(socket: Socket, orderNum) {
    const data = await this.coreService.query('order', null, 'get', null);
    await data.forEach((list) => {
      if (list.data().order_num === +orderNum) {
        socket.join(orderNum);
      }
    });
  }
}
