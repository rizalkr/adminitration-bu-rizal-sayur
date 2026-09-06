import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(255, 'Nama produk terlalu panjang'),
})

export type ProductFormData = z.infer<typeof productSchema>
