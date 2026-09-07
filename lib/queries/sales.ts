import { db } from '@/lib/db'
import { sales, saleItems, customers, products } from '@/lib/db/schema'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'
import type { SaleWithCustomer, SaleDetail, SaleItemWithProduct, TransactionDateFilter, TransactionSummary } from '@/types'

export async function getSales(filter?: TransactionDateFilter): Promise<SaleWithCustomer[]> {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(sales.saleDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(sales.saleDate, filter.endDate))
  }

  const query = db
    .select({
      id: sales.id,
      customerId: sales.customerId,
      customerName: customers.name,
      saleDate: sales.saleDate,
      paymentMethod: sales.paymentMethod,
      paymentStatus: sales.paymentStatus,
      createdAt: sales.createdAt,
      updatedAt: sales.updatedAt,
      // Aggregate across joined items; COALESCE handles sales with no items (edge case)
      totalAmount: sql<string>`COALESCE(SUM(${saleItems.subtotal}), 0)`,
      totalQtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'ekor' THEN ${saleItems.qty} ELSE 0 END)::int, 0)`,
      totalQtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'kg' THEN ${saleItems.qty} ELSE 0 END)::text, '0')`,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))

  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).groupBy(sales.id, customers.name).orderBy(desc(sales.saleDate), desc(sales.createdAt))
    : await query.groupBy(sales.id, customers.name).orderBy(desc(sales.saleDate), desc(sales.createdAt))

  return rows as SaleWithCustomer[]
}

export async function getSalesSummary(filter?: TransactionDateFilter): Promise<TransactionSummary> {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(sales.saleDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(sales.saleDate, filter.endDate))
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [itemTotals, salesStats, unpaidTotals] = await Promise.all([
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${saleItems.subtotal}), 0)`,
        totalQtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'ekor' THEN ${saleItems.qty} ELSE 0 END)::int, 0)`,
        totalQtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'kg' THEN ${saleItems.qty} ELSE 0 END)::text, '0')`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(whereClause),

    db
      .select({
        transactionCount: sql<number>`COUNT(${sales.id})::int`,
        unpaidCount: sql<number>`COALESCE(SUM(CASE WHEN ${sales.paymentStatus} = 'Belum Lunas' THEN 1 ELSE 0 END)::int, 0)`,
      })
      .from(sales)
      .where(whereClause),

    db
      .select({
        unpaidAmount: sql<string>`COALESCE(SUM(${saleItems.subtotal}), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(whereClause ? and(whereClause, eq(sales.paymentStatus, 'Belum Lunas')) : eq(sales.paymentStatus, 'Belum Lunas')),
  ])

  const totalAmount = itemTotals[0]?.totalAmount ?? '0'
  const unpaidAmount = unpaidTotals[0]?.unpaidAmount ?? '0'
  const paidAmount = (parseFloat(totalAmount) - parseFloat(unpaidAmount)).toFixed(2)

  return {
    totalAmount,
    totalQtyEkor: itemTotals[0]?.totalQtyEkor ?? 0,
    totalQtyKg: itemTotals[0]?.totalQtyKg ?? '0',
    transactionCount: salesStats[0]?.transactionCount ?? 0,
    unpaidCount: salesStats[0]?.unpaidCount ?? 0,
    unpaidAmount,
    paidAmount,
  }
}

export async function getSaleById(id: string): Promise<SaleDetail | null> {
  const [saleRows, itemRows] = await Promise.all([
    db
      .select({
        id: sales.id,
        customerId: sales.customerId,
        customerName: customers.name,
        saleDate: sales.saleDate,
        paymentMethod: sales.paymentMethod,
        paymentStatus: sales.paymentStatus,
        createdAt: sales.createdAt,
        updatedAt: sales.updatedAt,
      })
      .from(sales)
      // No isActive filter here — historical records must always display
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(eq(sales.id, id))
      .limit(1),

    db
      .select({
        id: saleItems.id,
        saleId: saleItems.saleId,
        productId: saleItems.productId,
        // No isActive filter — show product name even if subsequently deactivated
        productName: products.name,
        unit: saleItems.unit,
        qty: saleItems.qty,
        unitPrice: saleItems.unitPrice,
        subtotal: saleItems.subtotal,
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, id)),
  ])

  if (!saleRows[0]) return null

  return {
    ...saleRows[0],
    items: itemRows as SaleItemWithProduct[],
  }
}
