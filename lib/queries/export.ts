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
import { eq, desc } from 'drizzle-orm'

export async function getCustomersExport() {
  return await db
    .select({
      id: customers.id,
      name: customers.name,
      desa: customers.desa,
      dukuh: customers.dukuh,
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

export async function getSalesExport() {
  return await db
    .select({
      saleId: sales.id,
      tanggal: sales.saleDate,
      customer: customers.name,
      desa: customers.desa,
      dukuh: customers.dukuh,
      produk: products.name,
      qty: saleItems.qty,
      unitPrice: saleItems.unitPrice,
      subtotal: saleItems.subtotal,
      paymentMethod: sales.paymentMethod,
      paymentStatus: sales.paymentStatus,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .leftJoin(products, eq(saleItems.productId, products.id))
    .orderBy(desc(sales.saleDate), desc(sales.createdAt))
}

export async function getPurchasesExport() {
  return await db
    .select({
      purchaseId: purchases.id,
      tanggal: purchases.purchaseDate,
      supplier: suppliers.name,
      produk: products.name,
      qty: purchaseItems.qty,
      unitPrice: purchaseItems.unitPrice,
      subtotal: purchaseItems.subtotal,
      paymentMethod: purchases.paymentMethod,
      paymentStatus: purchases.paymentStatus,
    })
    .from(purchaseItems)
    .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .leftJoin(products, eq(purchaseItems.productId, products.id))
    .orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))
}
