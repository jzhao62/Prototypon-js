import { createClient, RedisClientType } from 'redis';
import { logCache } from '../../../util/logger';
class RedisService {
  private static instance: RedisService;

  public client: RedisClientType;

  private constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect().catch(console.error);
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }

    return RedisService.instance;
  }

  @logCache('write')
  async setCacheValue(
    itemID: number,
    remainingQuantity: number,
  ): Promise<void> {
    const transaction = this.client.multi();
    transaction.set(itemID.toString(), remainingQuantity);

    await transaction.exec();
  }

  @logCache('read')
  async readCacheValue(itemId: number): Promise<string | null> {
    return this.client.get(itemId.toString());
  }
}

export default RedisService;
