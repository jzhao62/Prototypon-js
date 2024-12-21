import winston from 'winston';

import { Logger } from 'winston';
import { PostgresTransport } from '@innova2/winston-pg';
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(
//       ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`,
//     ),
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: 'combined.log',
//       handleExceptions: true,
//     }),
//   ],
// });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...metadata }) =>
        `${timestamp} [${level}]: ${message} ${JSON.stringify(metadata)}`,
    ),
  ),
  transports: [
    new PostgresTransport({
      connectionString:
        'postgresql://postgres:logpassword@localhost:5433/postgres?schema=public',
      maxPool: 10,
      level: 'info',
      tableName: 'logs',
      tableColumns: [
        { name: 'id', dataType: 'SERIAL', primaryKey: true },
        { name: 'timestamp', dataType: 'TIMESTAMPTZ', notNull: true },
        { name: 'level', dataType: 'VARCHAR(10)', notNull: true },
        { name: 'message', dataType: 'TEXT', notNull: true },
        { name: 'metadata', dataType: 'JSONB' },
      ],
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
