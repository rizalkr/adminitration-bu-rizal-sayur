import { db } from '@/lib/db'
import { purchases, purchaseItems, suppliers, products } from '@/lib/db/schema'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'
import type { PurchaseWithSupplier, PurchaseDetail, PurchaseItemWithProduct, TransactionDateFilter, TransactionSummary } from '@/types'

export async function getPurchases(filter?: TransactionDateFilter): Promise<PurchaseWithSupplier[]> {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(purchases.purchaseDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(purchases.purchaseDate, filter.endDate))
  }

  const query = db
    .select({
      id: purchases.id,
      supplierId: purchases.supplierId,
      supplierName: suppliers.name,
      purchaseDate: purchases.purchaseDate,
      paymentMethod: purchases.paymentMethod,
      paymentStatus: purchases.paymentStatus,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
      totalAmount: sql<string>`COALESCE(SUM(${purchaseItems.subtotal}), 0)`,
      totalQtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'ekor' THEN ${purchaseItems.qty} ELSE 0 END)::int, 0)`,
      totalQtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'kg' THEN ${purchaseItems.qty} ELSE 0 END)::text, '0')`,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .leftJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))

  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).groupBy(purchases.id, suppliers.name).orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))
    : await query.groupBy(purchases.id, suppliers.name).orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))

  return rows as PurchaseWithSupplier[]
}

export async function getPurchasesSummary(filter?: TransactionDateFilter): Promise<TransactionSummary> {
  const conditions = []
  if (filter?.startDate) {
    conditions.push(gte(purchases.purchaseDate, filter.startDate))
  }
  if (filter?.endDate) {
    conditions.push(lte(purchases.purchaseDate, filter.endDate))
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [itemTotals, purchasesStats, unpaidTotals] = await Promise.all([
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${purchaseItems.subtotal}), 0)`,
        totalQtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'ekor' THEN ${purchaseItems.qty} ELSE 0 END)::int, 0)`,
        totalQtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'kg' THEN ${purchaseItems.qty} ELSE 0 END)::text, '0')`,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
      .where(whereClause),

    db
      .select({
        transactionCount: sql<number>`COUNT(${purchases.id})::int`,
        unpaidCount: sql<number>`COALESCE(SUM(CASE WHEN ${purchases.paymentStatus} = 'Belum Lunas' THEN 1 ELSE 0 END)::int, 0)`,
      })
      .from(purchases)
      .where(whereClause),

    db
      .select({
        unpaidAmount: sql<string>`COALESCE(SUM(${purchaseItems.subtotal}), 0)`,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
      .where(whereClause ? and(whereClause, eq(purchases.paymentStatus, 'Belum Lunas')) : eq(purchases.paymentStatus, 'Belum Lunas')),
  ])

  const totalAmount = itemTotals[0]?.totalAmount ?? '0'
  const unpaidAmount = unpaidTotals[0]?.unpaidAmount ?? '0'
  const paidAmount = (parseFloat(totalAmount) - parseFloat(unpaidAmount)).toFixed(2)

  return {
    totalAmount,
    totalQtyEkor: itemTotals[0]?.totalQtyEkor ?? 0,
    totalQtyKg: itemTotals[0]?.totalQtyKg ?? '0',
    transactionCount: purchasesStats[0]?.transactionCount ?? 0,
    unpaidCount: purchasesStats[0]?.unpaidCount ?? 0,
    unpaidAmount,
    paidAmount,
  }
}

export async function getPurchaseById(id: string): Promise<PurchaseDetail | null> {
  const [purchaseRows, itemRows] = await Promise.all([
    db
      .select({
        id: purchases.id,
        supplierId: purchases.supplierId,
        supplierName: suppliers.name,
        purchaseDate: purchases.purchaseDate,
        paymentMethod: purchases.paymentMethod,
        paymentStatus: purchases.paymentStatus,
        createdAt: purchases.createdAt,
        updatedAt: purchases.updatedAt,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .where(eq(purchases.id, id))
      .limit(1),

    db
      .select({
        id: purchaseItems.id,
        purchaseId: purchaseItems.purchaseId,
        productId: purchaseItems.productId,
        productName: products.name,
        unit: purchaseItems.unit,
        qty: purchaseItems.qty,
        unitPrice: purchaseItems.unitPrice,
        subtotal: purchaseItems.subtotal,
      })
      .from(purchaseItems)
      .leftJoin(products, eq(purchaseItems.productId, products.id))
      .where(eq(purchaseItems.purchaseId, id)),
  ])

  if (!purchaseRows[0]) return null

  return {
    ...purchaseRows[0],
    items: itemRows as PurchaseItemWithProduct[],
  }
}
