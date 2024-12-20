import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'combined.log',
      handleExceptions: true,
    }),
  ],
});

function logDataBaseWrite(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): void {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = async function (...args: any[]) {
    const [itemId, quantity] = args;
    logger.info(
      `Attempting to purchase: itemId=${itemId}, quantity=${quantity}`,
    );

    try {
      const resp = await originalMethod.apply(this, args);
      logger.info('Purchase successful', resp);

      return resp;
    } catch (err: any) {
      logger.error(`Purchase failed: ${err.message}`);
    }
  };
}

function logCache(operation: 'read' | 'write') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      const [itemId] = args;
      logger.info(`Checking cache for item: ${itemId} (${operation})`);

      try {
        const resp = await originalMethod.apply(this, args);
        logger.info(`Cache ${operation} successful`, resp);

        return resp;
      } catch (err: any) {
        logger.error(`Cache ${operation} failed: ${err.message}`);
      }
    };
  };
}

export { logger, logDataBaseWrite, logCache };
