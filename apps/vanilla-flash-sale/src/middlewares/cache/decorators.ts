import RedisService from './RedisService';

function enableCacheThrough(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = async function (...args: any[]) {
    const [itemId, quantity] = args;
    const redisService = RedisService.getInstance();

    // Check the cache first
    const cachedValue = await redisService.readCacheValue(itemId);

    if (cachedValue !== null) {
      return {
        message: 'Cache hit',
        processedQuantity: quantity,
        remainingQuantity: parseInt(cachedValue, 10),
      };
    }

    // Proceed with the original method if cache miss
    const result = await originalMethod.apply(this, args);

    // Update the cache with the new value
    if (result && result.remainingQuantity !== undefined) {
      await redisService.setCacheValue(itemId, result.remainingQuantity);
    }

    return result;
  };
}

export { enableCacheThrough };
