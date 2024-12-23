import winston from 'winston';
// import PostgresTransport from 'winston-postgres-transport';

const metadata = {
  userId: '12345',
  ipAddress: '192.168.1.1',
  loginTime: new Date().toISOString(),
};

// const postgresUrl =
//   'postgresql://postgres:logpassword@localhost:5433/postgres?schema=public';

const logger = winston.createLogger({
  level: 'info',
  // format: winston.format.json(),
  defaultMeta: { service: 'database-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
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

    try {
      logger.info(
        `user try to purchase itemId=${itemId}, quantity=${quantity}`,
        { metadata },
      );
      const resp = await originalMethod.apply(this, args);
      logger.info('Purchase successful', metadata);

      return resp;
    } catch (err: any) {
      logger.error(`Purchase failed: ${err.message}`, { err });
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

    descriptor.value = async function (...args: any[]) {
      const [itemId] = args;

      try {
        logger.info(`Checking cache for item: ${itemId} (${operation})`, {
          itemId,
          operation,
        });

        const resp = await originalMethod.apply(this, args);
        logger.info(`Cache ${operation} successful`, { resp });

        return resp;
      } catch (err: any) {
        logger.error(`Cache ${operation} failed: ${err.message}`, { err });
      }
    };
  };
}

export { logger, logDataBaseWrite, logCache };
