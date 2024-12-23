import { DataBaseStrategy, TransactionResponse } from './DataBaseStrategy';
import { logDataBaseWrite } from '../../util/log';
import { DataBaseError, InSufficientStockError } from './Errors';
import { cacheWrite } from '../middlewares/cache/decorators';

export class LockFreeStrategy extends DataBaseStrategy {
  @cacheWrite('write-through')
  @logDataBaseWrite
  async processPurchase(
    itemId: number,
    quantity: number,
  ): Promise<TransactionResponse> {
    const combinedQuery = `
        UPDATE flash_sale_items
        SET quantity = quantity - $1
        WHERE id = $2 AND quantity >= $1
        RETURNING quantity
    `;
    const updateValues = [quantity, itemId];
    const client = await this._getDatabaseClient();

    try {
      const res = await client.query(combinedQuery, updateValues);

      if (res.rowCount === 0) {
        throw new InSufficientStockError('Insufficient quantity remaining');
      }

      const remainingQuantity = res.rows[0].quantity as number;

      return {
        message: 'Purchase successful',
        processedQuantity: quantity,
        remainingQuantity,
      };
    } catch (err: any) {
      if (err instanceof InSufficientStockError) {
        throw err;
      } else {
        throw new DataBaseError(err.msg);
      }
    } finally {
      await this._releaseDatabaseClient(client);
    }
  }
}
