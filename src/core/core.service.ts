import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class CoreService {
  async query(col, doc, type, data) {
    const db = getFirestore();
    let result;
    switch (type) {
      case 'get':
        result = doc
          ? await db.collection(col).doc(doc).get()
          : await db.collection(col).get();
        break;
      case 'set':
        result = doc
          ? await db.collection(col).doc(doc).set(data)
          : await db.collection(col).doc().set(data);
        break;
      case 'delete':
        result = await db.collection(col).doc(doc).delete();
        break;
    }
    return result;
  }
}
