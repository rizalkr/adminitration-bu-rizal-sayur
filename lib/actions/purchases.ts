'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { purchases, purchaseItems, products, suppliers } from '@/lib/db/schema'
import { purchaseSchema } from '@/lib/validations/purchase'
import { calculateSubtotal } from '@/lib/utils'
import type { ActionState, PaymentStatus } from '@/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) return { error: true, message: 'Tidak diizinkan.' }
  return { error: false }
}

function parseItems(formData: FormData) {
  try {
    return JSON.parse(formData.get('items') as string)
  } catch {
    return []
  }
}

function resolvePaymentStatus(method: string, status: string): PaymentStatus {
  if (method === 'Hutang') return 'Belum Lunas'
  return status as PaymentStatus
}

export async function createPurchase(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const paymentMethod = formData.get('paymentMethod') as string
  const raw = {
    supplierId: formData.get('supplierId'),
    purchaseDate: formData.get('purchaseDate'),
    paymentMethod,
    paymentStatus: resolvePaymentStatus(paymentMethod, formData.get('paymentStatus') as string),
    items: parseItems(formData),
  }

  const result = purchaseSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { supplierId, purchaseDate, paymentStatus, items } = result.data

  const supplierRow = await db.select({ isActive: suppliers.isActive }).from(suppliers).where(eq(suppliers.id, supplierId)).limit(1)
  if (!supplierRow[0]?.isActive) {
    return { errors: { supplierId: ['Pemasok tidak aktif. Pilih pemasok yang aktif.'] } }
  }

  for (const item of items) {
    const product = await db.select({ isActive: products.isActive }).from(products).where(eq(products.id, item.productId)).limit(1)
    if (!product[0]?.isActive) {
      return { errors: { items: ['Salah satu produk tidak aktif. Pilih produk yang aktif.'] } }
    }
  }

  try {
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        supplierId,
        purchaseDate,
        paymentMethod: result.data.paymentMethod,
        paymentStatus,
      })
      .returning({ id: purchases.id })

    const itemValues = items.map((item) => ({
      purchaseId: newPurchase.id,
      productId: item.productId,
      unit: item.unit,
      qty: item.qty.toString(),
      unitPrice: item.unitPrice.toString(),
      subtotal: calculateSubtotal(item.qty, item.unitPrice).toString(),
    }))

    try {
      await db.insert(purchaseItems).values(itemValues)
    } catch (itemError) {
      await db.delete(purchases).where(eq(purchases.id, newPurchase.id))
      throw itemError
    }
  } catch (error) {
    console.error('Error creating purchase:', error)
    return { message: 'Gagal menyimpan pembelian. Silakan coba lagi.' }
  }

  revalidatePath('/pembelian')
  redirect('/pembelian')
}

export async function updatePurchase(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const paymentMethod = formData.get('paymentMethod') as string
  const raw = {
    supplierId: formData.get('supplierId'),
    purchaseDate: formData.get('purchaseDate'),
    paymentMethod,
    paymentStatus: resolvePaymentStatus(paymentMethod, formData.get('paymentStatus') as string),
    items: parseItems(formData),
  }

  const result = purchaseSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { supplierId, purchaseDate, paymentStatus, items } = result.data

  const supplierRow = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, supplierId)).limit(1)
  if (!supplierRow[0]) {
    return { errors: { supplierId: ['Pemasok tidak ditemukan.'] } }
  }

  for (const item of items) {
    const product = await db.select({ isActive: products.isActive }).from(products).where(eq(products.id, item.productId)).limit(1)
    if (!product[0]?.isActive) {
      return { errors: { items: ['Salah satu produk tidak aktif. Pilih produk yang aktif.'] } }
    }
  }

  try {
    await db
      .update(purchases)
      .set({
        supplierId,
        purchaseDate,
        paymentMethod: result.data.paymentMethod,
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, id))

    await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, id))

    const itemValues = items.map((item) => ({
      purchaseId: id,
      productId: item.productId,
      unit: item.unit,
      qty: item.qty.toString(),
      unitPrice: item.unitPrice.toString(),
      subtotal: calculateSubtotal(item.qty, item.unitPrice).toString(),
    }))

    await db.insert(purchaseItems).values(itemValues)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return { message: 'Gagal memperbarui pembelian. Silakan coba lagi.' }
  }

  revalidatePath('/pembelian')
  revalidatePath(`/pembelian/${id}`)
  redirect(`/pembelian/${id}`)
}

export async function updatePurchasePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const purchase = await db.select({ id: purchases.id }).from(purchases).where(eq(purchases.id, id)).limit(1)
  if (!purchase[0]) return { message: 'Pembelian tidak ditemukan.' }

  try {
    await db.update(purchases).set({ paymentStatus, updatedAt: new Date() }).where(eq(purchases.id, id))
  } catch {
    return { message: 'Gagal memperbarui status pembayaran.' }
  }

  revalidatePath('/pembelian')
  revalidatePath(`/pembelian/${id}`)
  return {}
}

export async function deletePurchase(id: string): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  try {
    await db.delete(purchases).where(eq(purchases.id, id))
  } catch {
    return { message: 'Gagal menghapus pembelian.' }
  }

  revalidatePath('/pembelian')
  redirect('/pembelian')
}
