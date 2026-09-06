import { db } from '@/lib/db'
import { purchases, purchaseItems, suppliers, products } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { PurchaseWithSupplier, PurchaseDetail, PurchaseItemWithProduct } from '@/types'

export async function getPurchases(): Promise<PurchaseWithSupplier[]> {
  const rows = await db
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
      totalQty: sql<number>`COALESCE(SUM(${purchaseItems.qty})::int, 0)`,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .leftJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))
    .groupBy(purchases.id, suppliers.name)
    .orderBy(desc(purchases.purchaseDate), desc(purchases.createdAt))

  return rows as PurchaseWithSupplier[]
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
