import { db } from '@/lib/db'
import { sales, purchases, saleItems, purchaseItems } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import { getTodayWIB } from '@/lib/utils'
import type { DashboardStats } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = getTodayWIB()

  const [
    salesToday,
    purchasesToday,
    unpaidSales,
    unpaidPurchases,
  ] = await Promise.all([
    // Total sales amount and qty today by unit
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${saleItems.subtotal}), 0)`,
        qtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'ekor' THEN ${saleItems.qty} ELSE 0 END)::int, 0)`,
        qtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${saleItems.unit} = 'kg' THEN ${saleItems.qty} ELSE 0 END)::text, '0')`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(eq(sales.saleDate, today)),

    // Total purchases amount and qty today by unit
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${purchaseItems.subtotal}), 0)`,
        qtyEkor: sql<number>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'ekor' THEN ${purchaseItems.qty} ELSE 0 END)::int, 0)`,
        qtyKg: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseItems.unit} = 'kg' THEN ${purchaseItems.qty} ELSE 0 END)::text, '0')`,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
      .where(eq(purchases.purchaseDate, today)),

    // Count of unpaid sales
    db
      .select({ count: count() })
      .from(sales)
      .where(eq(sales.paymentStatus, 'Belum Lunas')),

    // Count of unpaid purchases
    db
      .select({ count: count() })
      .from(purchases)
      .where(eq(purchases.paymentStatus, 'Belum Lunas')),
  ])

  return {
    salesTodayAmount: salesToday[0]?.totalAmount ?? '0',
    purchasesTodayAmount: purchasesToday[0]?.totalAmount ?? '0',
    salesTodayQtyEkor: salesToday[0]?.qtyEkor ?? 0,
    salesTodayQtyKg: salesToday[0]?.qtyKg ?? '0',
    purchasesTodayQtyEkor: purchasesToday[0]?.qtyEkor ?? 0,
    purchasesTodayQtyKg: purchasesToday[0]?.qtyKg ?? '0',
    unpaidSalesCount: unpaidSales[0]?.count ?? 0,
    unpaidPurchasesCount: unpaidPurchases[0]?.count ?? 0,
  }
}
