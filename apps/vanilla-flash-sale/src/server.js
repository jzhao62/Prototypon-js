import express from 'express';
import { LockFreeStrategy } from './model/LockFreeStrategy.js';
import { logger } from '../util/logger';

const app = express();
const port = 8080;

app.use(express.json());

const strategy = new LockFreeStrategy();

// Middleware to log latency
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const end = Date.now();
    const latency = end - start;
    logger.info(`Request to ${req.path} took ${latency} ms`);
    console.log(`Request to ${req.path} took ${latency} ms`);
  });
  next();
});

// TODO: allow runnable with decorators
// TODO: figure out multiple package management within a nodeJS
app.post('/purchase', async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    await strategy.processPurchase(itemId, quantity);
    res.send('Purchase completed');
  } catch (err) {
    res.status(500).send(`Purchase failed: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
