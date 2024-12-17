import clients from '../client.js';

const clearTable = async (client) => {
  try {
    await client.connect();
    await client.query('DELETE FROM test_table');
    console.log(
      `Cleared table from ${client.host}:${client.port} (${client.database})`,
    );
  } catch (err) {
    console.error('Failed to clear table', err.stack);
  } finally {
    await client.end();
  }
};

clients.forEach((client) => {
  clearTable(client);
});
