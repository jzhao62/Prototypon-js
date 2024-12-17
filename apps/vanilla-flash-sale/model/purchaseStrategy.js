import { logPurchase } from '../util/logger.js';

class PurchaseStrategy {
  async purchase(client, itemId, quantity) {
    logPurchase();
    console.log(client, itemId, quantity);
    throw new Error('Method not implemented');
  }
}
class NoLockStrategy extends PurchaseStrategy {
  async purchase(client, itemId, quantity) {
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
    try {
      const res = await client.query(updateQuery, updateValues);
      if (res.rowCount === 0) {
        throw new Error('Not enough items in stock');
      }

      console.log('Purchase successful');
      const selectRes = await client.query(selectQuery, [itemId]);
      const remainingQuantity = selectRes.rows[0].quantity;
      console.log(`Current remaining quantity: ${remainingQuantity}`);
    } catch (err) {
      console.error('Purchase failed', err.stack);
    }
  }
}

class OptimisticLockStrategy extends PurchaseStrategy {
  async purchase(client, itemId, quantity) {
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
        if (err.message === 'Concurrent update detected') {
          attempt++;
          console.warn(`Retrying... (${attempt}/${maxRetries})`);
        } else {
          console.error('Purchase failed', err.stack);
          throw err;
        }
      }
    }
    throw new Error(
      'Max retries reached. Purchase failed due to concurrent updates.',
    );
  }
}

class PessimisticLockStrategy extends PurchaseStrategy {
  async purchase(client, itemId, quantity) {
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

      console.log('Purchase successful, remaining stock:', res.rows[0].quantity);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Purchase failed:', err.message);
    }
  }

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
}

export { NoLockStrategy, OptimisticLockStrategy, PessimisticLockStrategy };
