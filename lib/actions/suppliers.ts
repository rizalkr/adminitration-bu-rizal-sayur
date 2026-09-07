'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { suppliers } from '@/lib/db/schema'
import { supplierSchema } from '@/lib/validations/supplier'
import { supplierHasTransactions } from '@/lib/queries/suppliers'
import type { ActionState } from '@/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) return { error: true, message: 'Tidak diizinkan.' }
  return { error: false }
}

export async function createSupplier(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const raw = {
    name: formData.get('name'),
    contact: formData.get('contact') || undefined,
    address: formData.get('address') || undefined,
  }

  const result = supplierSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const contact = result.data.contact?.trim() || null
  const address = result.data.address || null

  try {
    await db.insert(suppliers).values({ name: result.data.name, contact, address })
  } catch {
    return { message: 'Gagal menyimpan data pemasok. Silakan coba lagi.' }
  }

  revalidatePath('/pemasok')
  revalidatePath('/pembelian/baru')
  redirect('/pemasok')
}

export async function updateSupplier(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const raw = {
    name: formData.get('name'),
    contact: formData.get('contact') || undefined,
    address: formData.get('address') || undefined,
  }

  const result = supplierSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const contact = result.data.contact?.trim() || null
  const address = result.data.address || null

  try {
    await db
      .update(suppliers)
      .set({ name: result.data.name, contact, address, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
  } catch {
    return { message: 'Gagal memperbarui data pemasok. Silakan coba lagi.' }
  }

  revalidatePath('/pemasok')
  revalidatePath('/pembelian/baru')
  revalidatePath('/pembelian')
  redirect('/pemasok')
}

export async function toggleSupplierActive(id: string, isActive: boolean): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  try {
    await db.update(suppliers).set({ isActive, updatedAt: new Date() }).where(eq(suppliers.id, id))
  } catch {
    return { message: 'Gagal mengubah status pemasok.' }
  }

  revalidatePath('/pemasok')
  revalidatePath('/pembelian/baru')
  revalidatePath('/pembelian')
  return {}
}

export async function deleteSupplier(id: string): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const hasTransactions = await supplierHasTransactions(id)
  if (hasTransactions) {
    return {
      message: 'Pemasok ini memiliki transaksi. Gunakan "Non-aktifkan" sebagai pengganti hapus.',
    }
  }

  try {
    await db.delete(suppliers).where(eq(suppliers.id, id))
  } catch {
    return { message: 'Gagal menghapus pemasok.' }
  }

  revalidatePath('/pemasok')
  revalidatePath('/pembelian/baru')
  revalidatePath('/pembelian')
  return {}
}
