'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { productSchema } from '@/lib/validations/product'
import { productHasTransactions } from '@/lib/queries/products'
import type { ActionState } from '@/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user) return { error: true, message: 'Tidak diizinkan.' }
  return { error: false }
}

export async function createProduct(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const result = productSchema.safeParse({ name: formData.get('name') })
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await db.insert(products).values(result.data)
  } catch {
    return { message: 'Gagal menyimpan produk. Silakan coba lagi.' }
  }

  revalidatePath('/produk')
  redirect('/produk')
}

export async function updateProduct(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const result = productSchema.safeParse({ name: formData.get('name') })
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await db.update(products).set({ ...result.data, updatedAt: new Date() }).where(eq(products.id, id))
  } catch {
    return { message: 'Gagal memperbarui produk. Silakan coba lagi.' }
  }

  revalidatePath('/produk')
  redirect('/produk')
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  try {
    await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, id))
  } catch {
    return { message: 'Gagal mengubah status produk.' }
  }

  revalidatePath('/produk')
  return {}
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const authResult = await requireAuth()
  if (authResult.error) return { message: authResult.message }

  const hasTransactions = await productHasTransactions(id)
  if (hasTransactions) {
    return {
      message: 'Produk ini sudah digunakan dalam transaksi. Gunakan "Non-aktifkan" sebagai pengganti hapus.',
    }
  }

  try {
    await db.delete(products).where(eq(products.id, id))
  } catch {
    return { message: 'Gagal menghapus produk.' }
  }

  revalidatePath('/produk')
  return {}
}
