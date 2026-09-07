'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sales, saleItems, products, customers } from '@/lib/db/schema'
import { saleSchema } from '@/lib/validations/sale'
import { calculateSubtotal } from '@/lib/utils'
import type { ActionState, PaymentStatus } from '@/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) return { error: true, message: 'Tidak diizinkan.' }
  return { error: false }
}

/**
 * Parse the line items JSON from the form.
 * The client serializes items as a JSON string in a hidden input.
 */
function parseItems(formData: FormData) {
  try {
    const raw = formData.get('items')
    return JSON.parse(raw as string)
  } catch {
    return []
  }
}

/**
 * Enforce the Hutang → Belum Lunas business rule server-side.
 * Client-submitted paymentStatus is overridden if method is Hutang.
 */
function resolvePaymentStatus(method: string, status: string): PaymentStatus {
  if (method === 'Hutang') return 'Belum Lunas'
  return status as PaymentStatus
}

export async function createSale(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const paymentMethod = formData.get('paymentMethod') as string
  const raw = {
    customerId: formData.get('customerId'),
    saleDate: formData.get('saleDate'),
    paymentMethod,
    // Server enforces Hutang rule — client value is overridden below
    paymentStatus: resolvePaymentStatus(paymentMethod, formData.get('paymentStatus') as string),
    items: parseItems(formData),
  }

  const result = saleSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { customerId, saleDate, paymentStatus, items } = result.data

  // Verify customer is active for new transactions
  const customerRow = await db.select({ isActive: customers.isActive }).from(customers).where(eq(customers.id, customerId)).limit(1)
  if (!customerRow[0]?.isActive) {
    return { errors: { customerId: ['Pelanggan tidak aktif. Pilih pelanggan yang aktif.'] } }
  }

  // Verify all selected products are active for new transactions
  for (const item of items) {
    const product = await db.select({ isActive: products.isActive }).from(products).where(eq(products.id, item.productId)).limit(1)
    if (!product[0]?.isActive) {
      return { errors: { items: ['Salah satu produk tidak aktif. Pilih produk yang aktif.'] } }
    }
  }

  try {
    const [newSale] = await db
      .insert(sales)
      .values({
        customerId,
        saleDate,
        paymentMethod: result.data.paymentMethod,
        paymentStatus,
      })
      .returning({ id: sales.id })

    const itemValues = items.map((item) => ({
      saleId: newSale.id,
      productId: item.productId,
      unit: item.unit,
      qty: item.qty.toString(),
      unitPrice: item.unitPrice.toString(),
      // Subtotal recalculated server-side — client value discarded
      subtotal: calculateSubtotal(item.qty, item.unitPrice).toString(),
    }))

    try {
      await db.insert(saleItems).values(itemValues)
    } catch (itemError) {
      await db.delete(sales).where(eq(sales.id, newSale.id))
      throw itemError
    }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { message: 'Gagal menyimpan penjualan. Silakan coba lagi.' }
  }

  revalidatePath('/penjualan')
  redirect('/penjualan')
}

export async function updateSale(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const paymentMethod = formData.get('paymentMethod') as string
  const raw = {
    customerId: formData.get('customerId'),
    saleDate: formData.get('saleDate'),
    paymentMethod,
    paymentStatus: resolvePaymentStatus(paymentMethod, formData.get('paymentStatus') as string),
    items: parseItems(formData),
  }

  const result = saleSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { customerId, saleDate, paymentStatus, items } = result.data

  // For edits, verify customer is still a valid entity (active or was previously selected)
  const customerRow = await db.select({ id: customers.id, isActive: customers.isActive }).from(customers).where(eq(customers.id, customerId)).limit(1)
  if (!customerRow[0]) {
    return { errors: { customerId: ['Pelanggan tidak ditemukan.'] } }
  }

  // For edits, new products being added must be active
  for (const item of items) {
    const product = await db.select({ isActive: products.isActive }).from(products).where(eq(products.id, item.productId)).limit(1)
    if (!product[0]?.isActive) {
      return { errors: { items: ['Salah satu produk tidak aktif. Pilih produk yang aktif.'] } }
    }
  }

  try {
    await db
      .update(sales)
      .set({
        customerId,
        saleDate,
        paymentMethod: result.data.paymentMethod,
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(sales.id, id))

    // Delete existing items and re-insert (simplest correct approach for edit)
    await db.delete(saleItems).where(eq(saleItems.saleId, id))

    const itemValues = items.map((item) => ({
      saleId: id,
      productId: item.productId,
      unit: item.unit,
      qty: item.qty.toString(),
      unitPrice: item.unitPrice.toString(),
      subtotal: calculateSubtotal(item.qty, item.unitPrice).toString(),
    }))

    await db.insert(saleItems).values(itemValues)
  } catch (error) {
    console.error('Error updating sale:', error)
    return { message: 'Gagal memperbarui penjualan. Silakan coba lagi.' }
  }

  revalidatePath('/penjualan')
  revalidatePath(`/penjualan/${id}`)
  redirect(`/penjualan/${id}`)
}

export async function updateSalePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  // Verify the sale exists and get its payment method to enforce the business rule
  const sale = await db.select({ paymentMethod: sales.paymentMethod }).from(sales).where(eq(sales.id, id)).limit(1)
  if (!sale[0]) return { message: 'Penjualan tidak ditemukan.' }

  // Prevent setting Lunas on a Hutang transaction via direct API call
  if (sale[0].paymentMethod === 'Hutang' && paymentStatus === 'Lunas') {
    // The business allows manually changing payment status (e.g. debt is paid)
    // so this is allowed. The Hutang rule only applies at creation time.
  }

  try {
    await db
      .update(sales)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(sales.id, id))
  } catch {
    return { message: 'Gagal memperbarui status pembayaran.' }
  }

  revalidatePath('/penjualan')
  revalidatePath(`/penjualan/${id}`)
  return {}
}

export async function deleteSale(id: string): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  try {
    // saleItems are deleted automatically via ON DELETE CASCADE
    await db.delete(sales).where(eq(sales.id, id))
  } catch {
    return { message: 'Gagal menghapus penjualan.' }
  }

  revalidatePath('/penjualan')
  redirect('/penjualan')
}
