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
    // Total sales amount and qty today
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${saleItems.subtotal}), 0)`,
        totalQty: sql<number>`COALESCE(SUM(${saleItems.qty})::int, 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(eq(sales.saleDate, today)),

    // Total purchases amount and qty today
    db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(${purchaseItems.subtotal}), 0)`,
        totalQty: sql<number>`COALESCE(SUM(${purchaseItems.qty})::int, 0)`,
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
    salesTodayQty: salesToday[0]?.totalQty ?? 0,
    purchasesTodayQty: purchasesToday[0]?.totalQty ?? 0,
    unpaidSalesCount: unpaidSales[0]?.count ?? 0,
    unpaidPurchasesCount: unpaidPurchases[0]?.count ?? 0,
  }
}
