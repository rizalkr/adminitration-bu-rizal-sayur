import { db } from '@/lib/db'
import { sales, saleItems, customers, products } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { SaleWithCustomer, SaleDetail, SaleItemWithProduct } from '@/types'

export async function getSales(): Promise<SaleWithCustomer[]> {
  const rows = await db
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
    // LEFT JOIN so sales still appear even if items are somehow missing
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .groupBy(sales.id, customers.name)
    .orderBy(desc(sales.saleDate), desc(sales.createdAt))

  return rows as SaleWithCustomer[]
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
