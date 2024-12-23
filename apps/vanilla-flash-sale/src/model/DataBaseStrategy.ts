import pg from 'pg';

interface TransactionResponse {
  message: string;
  processedQuantity: number;
  remainingQuantity: number;
}

abstract class DataBaseStrategy {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'postgrespassword',
      port: 5432,
      max: 1000,
    });
  }

  abstract processPurchase(
    itemId: number,
    quantity: number,
  ): Promise<TransactionResponse>;

  protected async _getDatabaseClient(): Promise<pg.PoolClient> {
    return this.pool.connect();
  }

  protected async _releaseDatabaseClient(client: pg.PoolClient): Promise<void> {
    client.release();
  }

  protected retry() {
    throw new Error('retry Method not implemented.');
  }

  public echo() {
    console.log(`echo from ${this.constructor.name}`);
  }
}

export { DataBaseStrategy, TransactionResponse };
