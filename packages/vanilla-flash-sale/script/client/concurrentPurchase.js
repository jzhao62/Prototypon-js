import axios from 'axios';
import { performance } from 'perf_hooks';

const numberOfConcurrentPurchases = 50;
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

async function simulateConcurrentPurchases() {
  const start = performance.now();
  const purchasePromises = [];
  for (let i = 0; i < numberOfConcurrentPurchases; i++) {
    purchasePromises.push(makePurchaseRequest());
  }
  await Promise.all(purchasePromises);
  const end = performance.now();
  console.log(
    `Completed ${numberOfConcurrentPurchases} concurrent purchase operations in ${end - start} ms`,
  );
}

simulateConcurrentPurchases();
