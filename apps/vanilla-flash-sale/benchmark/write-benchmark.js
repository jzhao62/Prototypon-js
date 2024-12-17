import clients from '../client.js';
const numberOfConcurrentWrites = 20000; // Adjust this number to test different levels of concurrency

async function performWriteOperation(client, id) {
  const query =
    'INSERT INTO test_table (id, value, timestamp) VALUES ($1, $2, NOW())';
  const values = [id, `value-${id}`];

  // const largeValue = 'x'.repeat(1000); // Example of a larger value
  // const values = [id, largeValue];

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
  const startTime = Date.now();
  for (let i = 0; i < concurrentWrites; i++) {
    writePromises.push(performWriteOperation(client, i));
  }
  await Promise.all(writePromises);
  const endTime = Date.now();
  console.timeEnd('Total write time');
  await client.end();
  const totalTimeInSeconds = (endTime - startTime) / 1000;
  const writesPerSecond = concurrentWrites / totalTimeInSeconds;
  console.log(`Completed ${concurrentWrites} concurrent write operations`);
  console.log(`Max write speed: ${writesPerSecond.toFixed(2)} writes/second`);
}

clients.forEach((client) => {
  concurrentWrite(client, numberOfConcurrentWrites);
});
