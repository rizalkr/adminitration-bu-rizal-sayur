import { pgTable, uuid, text, boolean, timestamp, date, numeric, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // Stored as text (not ENUM) so new roles can be added via migration
  role: text('role').notNull().default('employee'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('users_role_check', sql`${t.role} IN ('admin', 'employee')`),
])

// ---------------------------------------------------------------------------
// Master data
// ---------------------------------------------------------------------------
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  desa: text('desa').notNull(),
  dukuh: text('dukuh').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------
export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  saleDate: date('sale_date').notNull(),
  // Stored as text with DB CHECK — not ENUM — for future extensibility
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('sales_payment_method_check', sql`${t.paymentMethod} IN ('Cash', 'Transfer', 'Hutang')`),
  check('sales_payment_status_check', sql`${t.paymentStatus} IN ('Lunas', 'Belum Lunas')`),
])

export const saleItems = pgTable('sale_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  // CASCADE DELETE: removing a sale removes its items atomically
  saleId: uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  unit: text('unit').notNull(),
  // numeric(10,2) allows decimal for kg (e.g. 25.50) and integer for ekor
  qty: numeric('qty', { precision: 10, scale: 2 }).notNull(),
  // numeric(12,2) avoids floating-point issues with monetary values
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  // subtotal is always calculated server-side; client value is discarded
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
}, (t) => [
  check('sale_items_unit_check', sql`${t.unit} IN ('ekor', 'kg')`),
  check('sale_items_qty_check', sql`${t.qty} > 0`),
  check('sale_items_unit_price_check', sql`${t.unitPrice} >= 0`),
  check('sale_items_subtotal_check', sql`${t.subtotal} >= 0`),
])

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------
export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
  purchaseDate: date('purchase_date').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check('purchases_payment_method_check', sql`${t.paymentMethod} IN ('Cash', 'Transfer', 'Hutang')`),
  check('purchases_payment_status_check', sql`${t.paymentStatus} IN ('Lunas', 'Belum Lunas')`),
])

export const purchaseItems = pgTable('purchase_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id').notNull().references(() => purchases.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  unit: text('unit').notNull(),
  qty: numeric('qty', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
}, (t) => [
  check('purchase_items_unit_check', sql`${t.unit} IN ('ekor', 'kg')`),
  check('purchase_items_qty_check', sql`${t.qty} > 0`),
  check('purchase_items_unit_price_check', sql`${t.unitPrice} >= 0`),
  check('purchase_items_subtotal_check', sql`${t.subtotal} >= 0`),
])

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchases: many(purchases),
}))

export const productsRelations = relations(products, ({ many }) => ({
  saleItems: many(saleItems),
  purchaseItems: many(purchaseItems),
}))

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(saleItems),
}))

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}))

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
  items: many(purchaseItems),
}))

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),
  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id],
  }),
}))
