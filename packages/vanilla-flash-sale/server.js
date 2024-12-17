import express from 'express';
import clientsFactory from './script/databaseClient.js';
import { NoLockStrategy } from './model/purchaseStrategy.js';

const app = express();
const port = 8080;

app.use(express.json());

const clients = new clientsFactory(100).getClients();


//TODO: allow runnable with decorators
//TODO: figure out multiple package management within a nodeJS
app.post('/purchase', async (req, res) => {
  const { itemId, quantity } = req.body;
  const client = clients.pop(); // Get a client from the pool

  if (!client) {
    return res.status(500).send('No available clients');
  }

  try {
    const strategy = new NoLockStrategy();
    await client.connect();
    await strategy.purchase(client, itemId, quantity);
    await client.end();
    clients.push(client); // Return the client to the pool
    res.send('Purchase completed');
  } catch (err) {
    await client.end();
    clients.push(client); // Return the client to the pool
    res.status(500).send(`Purchase failed: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
