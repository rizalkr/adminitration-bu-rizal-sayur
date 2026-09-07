import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama terlalu panjang'),
  contact: z.string().max(100, 'Kontak terlalu panjang').optional().or(z.literal('')),
  address: z.string().max(500, 'Alamat terlalu panjang').optional().or(z.literal('')),
})

export type SupplierFormData = z.infer<typeof supplierSchema>
