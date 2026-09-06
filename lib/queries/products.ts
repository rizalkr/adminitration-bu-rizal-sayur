import { db } from '@/lib/db'
import { products, saleItems, purchaseItems } from '@/lib/db/schema'
import { eq, desc, count, or } from 'drizzle-orm'

export async function getProducts(includeInactive = false) {
  if (includeInactive) {
    return db.select().from(products).orderBy(desc(products.createdAt))
  }
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
}

export async function getActiveProducts() {
  return db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.name)
}

export async function getProductById(id: string) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function productHasTransactions(id: string): Promise<boolean> {
  const [saleResult, purchaseResult] = await Promise.all([
    db.select({ count: count() }).from(saleItems).where(eq(saleItems.productId, id)),
    db.select({ count: count() }).from(purchaseItems).where(eq(purchaseItems.productId, id)),
  ])
  return (saleResult[0]?.count ?? 0) > 0 || (purchaseResult[0]?.count ?? 0) > 0
}
