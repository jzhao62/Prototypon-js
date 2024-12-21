import { PurchaseStrategy, TransactionResponse } from './PurchaseStrategy';
import { logDataBaseWrite } from '../../util/log';
import { DataBaseError, InSufficientStockError } from './Errors';
import { cacheWrite } from '../middlewares/cache/decorators';

export class LockFreeStrategy extends PurchaseStrategy {
  @cacheWrite('write-through')
  @logDataBaseWrite
  async processPurchase(
    itemId: number,
    quantity: number,
  ): Promise<TransactionResponse> {
    const updateQuery = `
      UPDATE flash_sale_items
      SET quantity = quantity - $1
      WHERE id = $2 AND quantity >= $1
    `;
    const selectQuery = `
      SELECT quantity
      FROM flash_sale_items
      WHERE id = $1
    `;
    const updateValues = [quantity, itemId];
    const client = await this._getDatabaseClient();

    try {
      const res = await client.query(updateQuery, updateValues);

      if (res.rowCount === 0) {
        throw new InSufficientStockError('Insufficient stock');
      }

      const selectRes = await client.query(selectQuery, [itemId]);
      const remainingQuantity = selectRes.rows[0].quantity as number;
      console.log(`Current remaining quantity: ${remainingQuantity}`);

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
