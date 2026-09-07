'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { customerSchema } from '@/lib/validations/customer'
import { customerHasTransactions } from '@/lib/queries/customers'
import type { ActionState } from '@/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: true, message: 'Tidak diizinkan. Silakan login ulang.' }
  }
  return { error: false, session }
}

export async function createCustomer(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const raw = {
    name: formData.get('name'),
    desa: formData.get('desa'),
    dukuh: formData.get('dukuh'),
  }

  const result = customerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await db.insert(customers).values(result.data)
  } catch {
    return { message: 'Gagal menyimpan data pelanggan. Silakan coba lagi.' }
  }

  revalidatePath('/pelanggan')
  revalidatePath('/penjualan/baru')
  redirect('/pelanggan')
}

export async function updateCustomer(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const raw = {
    name: formData.get('name'),
    desa: formData.get('desa'),
    dukuh: formData.get('dukuh'),
  }

  const result = customerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await db
      .update(customers)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(customers.id, id))
  } catch {
    return { message: 'Gagal memperbarui data pelanggan. Silakan coba lagi.' }
  }

  revalidatePath('/pelanggan')
  revalidatePath('/penjualan/baru')
  revalidatePath('/penjualan')
  redirect('/pelanggan')
}

export async function toggleCustomerActive(id: string, isActive: boolean): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  // Prevent activating a non-existent customer; just update
  try {
    await db
      .update(customers)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(customers.id, id))
  } catch {
    return { message: 'Gagal mengubah status pelanggan.' }
  }

  revalidatePath('/pelanggan')
  revalidatePath('/penjualan/baru')
  revalidatePath('/penjualan')
  return {}
}

export async function deleteCustomer(id: string): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const hasTransactions = await customerHasTransactions(id)
  if (hasTransactions) {
    return {
      message:
        'Pelanggan ini memiliki transaksi. Gunakan "Non-aktifkan" sebagai pengganti hapus.',
    }
  }

  try {
    await db.delete(customers).where(eq(customers.id, id))
  } catch {
    return { message: 'Gagal menghapus pelanggan.' }
  }

  revalidatePath('/pelanggan')
  revalidatePath('/penjualan/baru')
  revalidatePath('/penjualan')
  return {}
}
