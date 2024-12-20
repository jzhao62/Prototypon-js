import { Client } from 'pg';
import PurchaseStrategy from './PurchaseStrategy';

class OptimisticLockStrategy extends PurchaseStrategy {
  async processPurchase(
    client: Client,
    itemId: number,
    quantity: number,
  ): Promise<void> {
    const selectQuery = `
        SELECT quantity, version
        FROM flash_sale_items
        WHERE id = $1
    `;
    const updateQuery = `
        UPDATE flash_sale_items
        SET quantity = quantity - $1, version = version + 1
        WHERE id = $2 AND version = $3 AND quantity >= $1
    `;
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await client.query('BEGIN');
        const res = await client.query(selectQuery, [itemId]);

        if (res.rows.length === 0) {
          throw new Error('Item not found');
        }
        const { quantity: currentQuantity, version } = res.rows[0];

        if (currentQuantity < quantity) {
          throw new Error('Not enough items in stock');
        }
        const updateRes = await client.query(updateQuery, [
          quantity,
          itemId,
          version,
        ]);

        if (updateRes.rowCount === 0) {
          throw new Error('Concurrent update detected');
        }
        await client.query('COMMIT');
        console.log(`Purchase successful, ${updateRes.rowCount} rows updated`);

        return;
      } catch (err) {
        await client.query('ROLLBACK');

        if ((err as Error).message === 'Concurrent update detected') {
          attempt++;
          console.warn(`Retrying... (${attempt}/${maxRetries})`);
        } else {
          console.error('Purchase failed', (err as Error).stack);
          throw err;
        }
      }
    }
    throw new Error(
      'Max retries reached. Purchase failed due to concurrent updates.',
    );
  }

  protected retry() {
    super.retry();
  }
}

export { OptimisticLockStrategy };

/**
 * vulnerable
 */
// async purchase(client, itemId, quantity) {
//   const selectQuery = `
//     SELECT quantity
//     FROM flash_sale_items
//     WHERE id = $1
//     FOR UPDATE
//   `;
//   const updateQuery = `
//     UPDATE flash_sale_items
//     SET quantity = quantity - $1
//     WHERE id = $2 AND quantity >= $1
//   `;
//   try {
//     await client.query('BEGIN');
//     const res = await client.query(selectQuery, [itemId]);
//     if (res.rows.length === 0) {
//       throw new Error('Item not found');
//     }
//     const { quantity: currentQuantity } = res.rows[0];
//     if (currentQuantity < quantity) {
//       throw new Error('Not enough items in stock');
//     }
//     const updateRes = await client.query(updateQuery, [quantity, itemId]);
//     if (updateRes.rowCount === 0) {
//       throw new Error('Update failed');
//     }
//     await client.query('COMMIT');
//     console.log('Purchase successful');
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Purchase failed', err.stack);
//   }
// }
