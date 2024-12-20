import axios from 'axios';
import { performance } from 'perf_hooks';

const itemId = 1;
const purchaseQuantity = 1;

async function makePurchaseRequest() {
  const start = performance.now();

  try {
    const response = await axios.post('http://localhost:8080/purchase', {
      itemId,
      quantity: purchaseQuantity,
    });
    const end = performance.now();
    console.log(`Single request latency: ${end - start} ms`);
    console.log(response.data);
  } catch (error) {
    const end = performance.now();
    console.error(`Purchase failed: ${error.message}`);
    console.error(`Single request latency: ${end - start} ms`);
  }
}

async function simulateConcurrentPurchases(writePerSec, durationSec) {
  const interval = 1000 / writePerSec; // Calculate interval in milliseconds
  const endTime = performance.now() + durationSec * 1000;
  const purchasePromises = [];

  while (performance.now() < endTime) {
    purchasePromises.push(makePurchaseRequest());
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
  }

  await Promise.all(purchasePromises);
  console.log(`Completed purchase operations in ${durationSec} seconds`);
}

const WPS = 10;
const DURATION = 5;

simulateConcurrentPurchases(WPS, DURATION); // Example usage with 10 writes per second for 10 seconds
