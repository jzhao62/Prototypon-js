import client from './client.js';

client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
  })
  .catch((err) => console.error('Connection error', err.stack));

// Example query
client.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Query error', err.stack);
  } else {
    console.log('Query result', res.rows);
  }
  client.end();
});
