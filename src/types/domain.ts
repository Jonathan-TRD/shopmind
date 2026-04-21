import type { Database, Tables, TablesInsert, TablesUpdate } from './database';

export type Product = Tables<'products'>;

export type ProductInsert = TablesInsert<'products'>;

export type ProductUpdate = TablesUpdate<'products'>;

/** Stored order row; `items` is JSON until validated or mapped. */
export type Order = Tables<'orders'>;

export type OrderInsert = TablesInsert<'orders'>;

export type OrderUpdate = TablesUpdate<'orders'>;

/**
 * Line item shape stored in `orders.items` (jsonb).
 * Keep in sync with what `create_order` and cart/checkout code persist.
 */
export type OrderLineItem = {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
};

/** Values used in seed data; the column is plain `text` in the database. */
export type ProductCategory = 'apparel' | 'home' | 'outdoor' | 'accessories';

/**
 * Application-level order status. The DB column is `text` without a CHECK;
 * narrow at boundaries (e.g. after RPC or admin updates).
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderWithLineItems = Omit<Order, 'items' | 'status'> & {
  items: OrderLineItem[];
  status: OrderStatus;
};

export type CreateOrderArgs =
  Database['public']['Functions']['create_order']['Args'];
