import { db } from '@/lib/db'
import { customers, sales } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'

export async function getCustomers(includeInactive = false) {
  if (includeInactive) {
    return db.select().from(customers).orderBy(desc(customers.createdAt))
  }
  return db
    .select()
    .from(customers)
    .where(eq(customers.isActive, true))
    .orderBy(desc(customers.createdAt))
}

export async function getActiveCustomers() {
  return db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(eq(customers.isActive, true))
    .orderBy(customers.name)
}

export async function getCustomerById(id: string) {
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function customerHasTransactions(id: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(sales)
    .where(eq(sales.customerId, id))
  return (result[0]?.count ?? 0) > 0
}
