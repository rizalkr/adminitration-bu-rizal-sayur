import { db } from '@/lib/db'
import { suppliers, purchases } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'

export async function getSuppliers(includeInactive = false) {
  if (includeInactive) {
    return db.select().from(suppliers).orderBy(desc(suppliers.createdAt))
  }
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.isActive, true))
    .orderBy(desc(suppliers.createdAt))
}

export async function getActiveSuppliers() {
  return db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.isActive, true))
    .orderBy(suppliers.name)
}

export async function getSupplierById(id: string) {
  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function supplierHasTransactions(id: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(purchases)
    .where(eq(purchases.supplierId, id))
  return (result[0]?.count ?? 0) > 0
}
