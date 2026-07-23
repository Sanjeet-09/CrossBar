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
const port = Number(process.env.CART_SERVICE_PORT || 4102);

app.use(cors());
app.use(express.json());

const ensureCartTable = async () => {
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS cart_items (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      session_id VARCHAR(255) NOT NULL,
      product_id VARCHAR(255) NOT NULL,
      product_data JSON NOT NULL,
      quantity INT NOT NULL,
      selected_color VARCHAR(100) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_cart_items_session_id (session_id)
    )`
  );
};

void ensureCartTable().catch((error) => {
  console.error('cart-service failed to initialize schema:', error);
});

app.get('/health', (_req, res) => {
  res.json({ service: 'cart-service', ok: true });
});

app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT product_data, quantity, selected_color
       FROM cart_items
       WHERE session_id = ?
       ORDER BY id ASC`,
      [req.params.sessionId]
    );

    const cart = rows.map((row) => ({
      product: typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data,
      quantity: row.quantity,
      selectedColor: row.selected_color,
    }));

    res.json({ cart });
  } catch (error) {
    console.error('cart-service load failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to load cart';
    res.status(500).json({ success: false, message });
  }
});

app.post('/api/cart/:sessionId', async (req, res) => {
  try {
    const cart = Array.isArray(req.body.cart) ? req.body.cart : [];

    await pool.query('DELETE FROM cart_items WHERE session_id = ?', [req.params.sessionId]);

    if (cart.length > 0) {
      const values = cart.map((item) => [
        req.params.sessionId,
        item.product.id,
        JSON.stringify(item.product),
        item.quantity,
        item.selectedColor ?? null,
      ]);

      await pool.query(
        `INSERT INTO cart_items (session_id, product_id, product_data, quantity, selected_color)
         VALUES ?`,
        [values]
      );
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('cart-service save failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to save cart';
    res.status(500).json({ success: false, message });
  }
});

app.delete('/api/cart/:sessionId', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE session_id = ?', [req.params.sessionId]);
    res.json({ success: true });
  } catch (error) {
    console.error('cart-service delete failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to clear cart';
    res.status(500).json({ success: false, message });
  }
});

app.listen(port, () => {
  console.log(`cart-service running on http://localhost:${port}`);
});
