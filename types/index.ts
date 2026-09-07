import { InferSelectModel } from 'drizzle-orm'
import {
  users,
  customers,
  suppliers,
  products,
  sales,
  saleItems,
  purchases,
  purchaseItems,
} from '@/lib/db/schema'

// ---------------------------------------------------------------------------
// Base entity types (inferred from Drizzle schema)
// ---------------------------------------------------------------------------
export type User = InferSelectModel<typeof users>
export type Customer = InferSelectModel<typeof customers>
export type Supplier = InferSelectModel<typeof suppliers>
export type Product = InferSelectModel<typeof products>
export type Sale = InferSelectModel<typeof sales>
export type SaleItem = InferSelectModel<typeof saleItems>
export type Purchase = InferSelectModel<typeof purchases>
export type PurchaseItem = InferSelectModel<typeof purchaseItems>

// ---------------------------------------------------------------------------
// Application-level constants (validated in Zod schemas + server actions)
// ---------------------------------------------------------------------------
export const PAYMENT_METHODS = ['Cash', 'Transfer', 'Hutang'] as const
export const PAYMENT_STATUSES = ['Lunas', 'Belum Lunas'] as const
export const TRANSACTION_UNITS = ['ekor', 'kg'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
export type TransactionUnit = (typeof TRANSACTION_UNITS)[number]

// ---------------------------------------------------------------------------
// Composite query result types
// ---------------------------------------------------------------------------
export type SaleWithCustomer = Sale & {
  customerName: string | null
  totalAmount: string
  totalQtyEkor: number
  totalQtyKg: string
}

export type PurchaseWithSupplier = Purchase & {
  supplierName: string | null
  totalAmount: string
  totalQtyEkor: number
  totalQtyKg: string
}

export type SaleItemWithProduct = {
  id: string
  saleId: string
  productId: string
  productName: string | null
  unit: TransactionUnit
  qty: string
  unitPrice: string
  subtotal: string
}

export type PurchaseItemWithProduct = {
  id: string
  purchaseId: string
  productId: string
  productName: string | null
  unit: TransactionUnit
  qty: string
  unitPrice: string
  subtotal: string
}

export type SaleDetail = Sale & {
  customerName: string | null
  items: SaleItemWithProduct[]
}

export type PurchaseDetail = Purchase & {
  supplierName: string | null
  items: PurchaseItemWithProduct[]
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export type DashboardStats = {
  salesTodayAmount: string
  purchasesTodayAmount: string
  salesTodayQtyEkor: number
  salesTodayQtyKg: string
  purchasesTodayQtyEkor: number
  purchasesTodayQtyKg: string
  unpaidSalesCount: number
  unpaidPurchasesCount: number
}

// ---------------------------------------------------------------------------
// Server action state
// ---------------------------------------------------------------------------
export type ActionState = {
  errors?: Record<string, string[]>
  message?: string
}

// ---------------------------------------------------------------------------
// Transaction Filter & Summary
// ---------------------------------------------------------------------------
export type DatePreset = 'today' | 'this-month' | 'last-month' | 'all' | 'custom'

export interface TransactionDateFilter {
  startDate?: string
  endDate?: string
  period?: DatePreset
}

export interface TransactionSummary {
  totalAmount: string
  totalQtyEkor: number
  totalQtyKg: string
  transactionCount: number
  unpaidCount: number
  unpaidAmount: string
  paidAmount: string
}
