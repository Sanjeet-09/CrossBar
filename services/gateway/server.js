const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const app = express();
const port = Number(process.env.API_GATEWAY_PORT || 4000);
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4101';
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4103';
const cartServiceUrl = process.env.CART_SERVICE_URL || 'http://localhost:4102';

app.use(cors());
app.use(express.json());

const proxyJson = async (targetUrl, req, res) => {
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('gateway proxy failed:', error);
    const message = error instanceof Error ? error.message : 'Gateway request failed';
    return res.status(500).json({ success: false, message });
  }
};

app.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', ok: true });
});

app.get('/api/products', (req, res) => proxyJson(`${productServiceUrl}/api/products`, req, res));
app.post('/api/orders', (req, res) => proxyJson(`${paymentServiceUrl}/api/orders`, req, res));
app.use('/api/cart', (req, res) => proxyJson(`${cartServiceUrl}${req.originalUrl}`, req, res));

app.listen(port, () => {
  console.log(`api-gateway running on http://localhost:${port}`);
});
