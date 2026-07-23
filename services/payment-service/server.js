const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const databaseUrl = process.env.MYSQL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing MYSQL_DATABASE_URL environment variable in .env.local');
}

const pool = mysql.createPool(databaseUrl);
const app = express();
const port = Number(process.env.PAYMENT_SERVICE_PORT || 4103);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'payment-service', ok: true });
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      shippingName,
      shippingEmail,
      shippingAddress,
      shippingCity,
      shippingZip,
      cart,
    } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const subtotal = cart.reduce((total, item) => total + Number(item.product.price) * Number(item.quantity), 0);
    const tax = subtotal * 0.08;
    const shippingCost = subtotal > 500 ? 0 : 25;
    const orderTotal = subtotal + tax + shippingCost;

    const [orderResult] = await pool.execute(
      `INSERT INTO orders (customer_name, customer_email, shipping_address, shipping_city, shipping_zip, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip, orderTotal, 'confirmed']
    );

    const insertedOrder = orderResult;

    const orderItems = cart.map((item) => [
      insertedOrder.insertId,
      item.product.id,
      item.product.name,
      item.product.image,
      item.quantity,
      item.product.price,
      item.selectedColor ?? null,
    ]);

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, selected_color)
       VALUES ?`,
      [orderItems]
    );

    return res.json({ success: true, orderId: insertedOrder.insertId, orderTotal });
  } catch (error) {
    console.error('payment-service failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to save order';
    return res.status(500).json({ success: false, message });
  }
});

app.listen(port, () => {
  console.log(`payment-service running on http://localhost:${port}`);
});
