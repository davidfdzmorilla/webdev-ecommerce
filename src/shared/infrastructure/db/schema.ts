import { pgTable, uuid, text, varchar, decimal, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// IDENTITY CONTEXT (Better-Auth)
// ============================================================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

// ============================================================================
// CATALOG CONTEXT
// ============================================================================

export const categories = pgTable('catalog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  parentId: uuid('parent_id').references((): any => categories.id),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const products = pgTable('catalog_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  priceAmount: decimal('price_amount', { precision: 10, scale: 2 }).notNull(),
  priceCurrency: varchar('price_currency', { length: 3 }).notNull().default('EUR'),
  categoryId: uuid('category_id').references(() => categories.id),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const inventory = pgTable('catalog_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  reserved: integer('reserved').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const productImages = pgTable('catalog_product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  altText: text('alt_text'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

// ============================================================================
// ORDERS CONTEXT
// ============================================================================

export const orders = pgTable('orders_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  subtotalAmount: decimal('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

export const orderItems = pgTable('orders_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 50 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceAmount: decimal('unit_price_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

export const shippingAddresses = pgTable('orders_shipping_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 2 }).notNull(),
  phone: varchar('phone', { length: 20 }),
});

// ============================================================================
// DOMAIN EVENTS
// ============================================================================

export const domainEvents = pgTable('domain_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  aggregateId: uuid('aggregate_id').notNull(),
  aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: text('event_data').notNull(),
  occurredAt: timestamp('occurred_at').notNull().default(sql`now()`),
  processed: boolean('processed').notNull().default(false),
  processedAt: timestamp('processed_at'),
});
