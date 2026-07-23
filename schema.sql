CREATE DATABASE IF NOT EXISTS CrossBar;
Use CrossBar;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(255) NOT NULL,
  shipping_zip VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  selected_color VARCHAR(100) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_orders
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  product_data JSON NOT NULL,
  quantity INT NOT NULL,
  selected_color VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_cart_items_session_id (session_id)
);
