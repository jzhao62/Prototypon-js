import clients from '../client.js';

const read = async (client, table, id) => {
  try {
    await client.connect();
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await client.query(query, [id]);
    console.log(result.rows);
    return result;
  } catch (err) {
    console.error('Failed to read from table', err.stack);
  } finally {
    await client.end();
  }
};

read(clients[0], 'test_table', 1).then((el) => {
  console.log(el);
  q;
});
