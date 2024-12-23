import { Mutex } from 'async-mutex';
import PurchaseStrategy from './DataBaseStrategy';

// const lock = new Mutex();

class SynchronizedPurchase extends PurchaseStrategy {
  async processPurchase(itemId: number, quantity: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export { SynchronizedPurchase };
