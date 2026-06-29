import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type definitions matching our Supabase tables ────────────────────────────

export interface OrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  total: number;
  status: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  selected_color: string | null;
}
