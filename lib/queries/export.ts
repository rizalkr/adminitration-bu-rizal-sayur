import { db } from '@/lib/db'
import {
  customers,
  suppliers,
  products,
  sales,
  saleItems,
  purchases,
  purchaseItems,
} from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import type { TransactionDateFilter } from '@/types'

export async function getCustomersExport() {
  return await db
    .select({
      id: customers.id,
      name: customers.name,
      desa: customers.desa,
      dukuh: customers.dukuh,
      contact: customers.contact,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
    })
    .from(customers)
    .orderBy(desc(customers.createdAt))
}

export async function getSuppliersExport() {
  return await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contact: suppliers.contact,
      address: suppliers.address,
      isActive: suppliers.isActive,
      createdAt: suppliers.createdAt,
      updatedAt: suppliers.updatedAt,
    })
    .from(suppliers)
    .orderBy(desc(suppliers.createdAt))
}

export async function getProductsExport() {
  return await db
    .select({
      id: products.id,
      name: products.name,
      isActive: products.isActive,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(desc(products.createdAt))
}

export async function getSalesExport(filter?: TransactionDateFilter) {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(sales.saleDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(sales.saleDate, filter.endDate))
  }

  const query = db
    .select({
      saleId: sales.id,
      tanggal: sales.saleDate,
      customer: customers.name,
      desa: customers.desa,
      dukuh: customers.dukuh,
      produk: products.name,
      qty: saleItems.qty,
      unit: saleItems.unit,
      unitPrice: saleItems.unitPrice,
      subtotal: saleItems.subtotal,
      paymentMethod: sales.paymentMethod,
      paymentStatus: sales.paymentStatus,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .leftJoin(products, eq(saleItems.productId, products.id))

  if (conditions.length > 0) {
    return await query
      .where(and(...conditions))
      .orderBy(desc(sales.saleDate), desc(sales.createdAt))
  }

  return await query.orderBy(desc(sales.saleDate), desc(sales.createdAt))
}

export async function getPurchasesExport(filter?: TransactionDateFilter) {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(purchases.purchaseDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(purchases.purchaseDate, filter.endDate))
  }

  const query = db
    .select({
      purchaseId: purchases.id,
      tanggal: purchases.purchaseDate,
      supplier: suppliers.name,
      produk: products.name,
      qty: purchaseItems.qty,
      unit: purchaseItems.unit,
      unitPrice: purchaseItems.unitPrice,
      subtotal: purchaseItems.subtotal,
      paymentMethod: purchases.paymentMethod,
      paymentStatus: purchases.paymentStatus,
    })
    .from(purchaseItems)
    .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .leftJoin(products, eq(purchaseItems.productId, products.id))

  if (conditions.length > 0) {
    return await query
      .where(and(...conditions))
      .orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))
  }

  return await query.orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))
}
