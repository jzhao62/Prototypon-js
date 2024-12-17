import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

function logPurchase(target, key, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    const [client, itemId, quantity] = args;
    logger.info(
      `Attempting to purchase: itemId=${itemId}, quantity=${quantity}`,
    );
    try {
      await originalMethod.apply(this, args);
      logger.info('Purchase successful');
    } catch (err) {
      logger.error(`Purchase failed: ${err.message}`);
      throw err;
    }
  };

  return descriptor;
}

export { logger, logPurchase };
