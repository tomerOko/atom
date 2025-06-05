import * as AsyncHooks from 'async_hooks';
import { AsyncStorage } from '../async-storage';

export function setTransactionId(transactionId: string): void {
  AsyncStorage.setInAsyncStore('transactionId', transactionId);
}

export function getTransactionId(): string {
  let transactionId = AsyncStorage.getFromAsyncStore('transactionId');
  if (!transactionId) {
    const noTransactionId = 'run without transactionId ' + new Date().toISOString();
    setTransactionId(noTransactionId);
    transactionId = noTransactionId;
  }
  return transactionId;
}
