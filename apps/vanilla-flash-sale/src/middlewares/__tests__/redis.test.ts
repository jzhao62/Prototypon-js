import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from 'redis';

describe('Redis Middleware', () => {
  let client: any;

  beforeAll(async () => {
    client = createClient();
    client.on('error', (err: any) => console.error('Redis Client Error', err));
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should connect to redis', async () => {
    const isConnected = client.isOpen;
    expect(isConnected).toBe(true);
  });

  it('should set and get a value', async () => {
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    expect(value).toBe('test-value');
  });
});
