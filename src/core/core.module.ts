import { Module, OnModuleInit } from '@nestjs/common';
import * as serviceAccount from './firebase_key.json';
import { firestore } from 'firebase-admin';
import { CoreService } from './core.service';
import admin from 'firebase-admin';

@Module({
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule implements OnModuleInit {
  onModuleInit(): any {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(JSON.stringify(serviceAccount)),
      ),
    });
  }
}
