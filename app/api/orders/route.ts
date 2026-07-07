import { NextResponse } from 'next/server';
import { mysqlPool } from '../../lib/mysql';

type CartItemPayload = {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  selectedColor?: string;
};

type OrderPayload = {
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  cart: CartItemPayload[];
  orderTotal: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderPayload;
    const {
      shippingName,
      shippingEmail,
      shippingAddress,
      shippingCity,
      shippingZip,
      cart,
      orderTotal,
    } = body;

    const [orderResult] = await mysqlPool.execute(
      `INSERT INTO orders (customer_name, customer_email, shipping_address, shipping_city, shipping_zip, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip, orderTotal, 'confirmed']
    );

    const insertedOrder = orderResult as { insertId: number };

    if (cart.length > 0) {
      const orderItems = cart.map((item) => [
        insertedOrder.insertId,
        item.product.id,
        item.product.name,
        item.product.image,
        item.quantity,
        item.product.price,
        item.selectedColor ?? null,
      ]);

      await mysqlPool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, selected_color)
         VALUES ?`,
        [orderItems]
      );
    }

    return NextResponse.json({ success: true, orderId: insertedOrder.insertId });
  } catch (error) {
    console.error('Order API failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to save order';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
