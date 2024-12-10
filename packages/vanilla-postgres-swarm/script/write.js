import clients from '../client.js';
const concurrentWrites = 50000; // Adjust this number to test different levels of concurrency

async function performWriteOperation(client, id) {
  const query =
    'INSERT INTO test_table (id, value, timestamp) VALUES ($1, $2, NOW())';
  const values = [id, `value-${id}`];
  try {
    await client.query(query, values);
    console.log(
      `Write operation ${id} completed at ${new Date().toISOString()}`,
    );
  } catch (err) {
    console.error(`Write operation ${id} failed`, err.stack);
  }
}

async function concurrentWrite(client, concurrentWrites) {
  await client.connect();
  const writePromises = [];
  console.time('Total write time');
  for (let i = 0; i < concurrentWrites; i++) {
    writePromises.push(performWriteOperation(client, i));
  }
  await Promise.all(writePromises);
  console.timeEnd('Total write time');
  await client.end();
  console.log(`Completed ${concurrentWrites} concurrent write operations`);
}

clients.forEach((client) => {
  concurrentWrite(client, concurrentWrites);
});
