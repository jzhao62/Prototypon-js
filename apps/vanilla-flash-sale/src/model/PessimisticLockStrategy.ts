import PurchaseStrategy from './PurchaseStrategy';
import { Client } from 'pg';

class PessimisticLockStrategy extends PurchaseStrategy {
  async processPurchase(
    client: Client,
    itemId: number,
    quantity: number,
  ): Promise<void> {
    const updateQuery = `
      UPDATE flash_sale_items
      SET quantity = quantity - $1
      WHERE id = $2 AND quantity >= $1
      RETURNING quantity;
    `;

    try {
      await client.query('BEGIN');

      // Perform atomic update with RETURNING to check stock and reduce quantity
      const res = await client.query(updateQuery, [quantity, itemId]);

      if (res.rows.length === 0) {
        throw new Error('Not enough items in stock');
      }

      console.log(
        'Purchase successful, remaining stock:',
        res.rows[0].quantity,
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Purchase failed:', (err as Error).message);
    }
  }
}

export { PessimisticLockStrategy };
