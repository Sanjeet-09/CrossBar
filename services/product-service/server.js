const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const products = require('../../shared/products.json');

const app = express();
const port = Number(process.env.PRODUCT_SERVICE_PORT || 4101);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'product-service', ok: true });
});

app.get('/api/products', (_req, res) => {
  res.json({ products });
});

app.listen(port, () => {
  console.log(`product-service running on http://localhost:${port}`);
});
