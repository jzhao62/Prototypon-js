import RedisService from './RedisService';

function enableWriteCache(
  policy: 'write-through' | 'write-around' | 'write-back',
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      const [itemId] = args;
      const result = await originalMethod.apply(this, args);

      if (result && result.remainingQuantity !== undefined) {
        const redisService = RedisService.getInstance();

        if (policy === 'write-through') {
          // Write-through: Update the cache immediately
          await redisService.setCacheValue(itemId, result.remainingQuantity);
        } else if (policy === 'write-around') {
          // Write-around: Do not update the cache, let the cache be updated on read
          // No action needed here
        } else if (policy === 'write-back') {
          // Write-back: Defer the cache update
          setTimeout(async () => {
            await redisService.setCacheValue(itemId, result.remainingQuantity);
          }, 0);
        }
      }

      return result;
    };
  };
}

export { enableWriteCache };
