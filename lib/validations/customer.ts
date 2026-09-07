import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama terlalu panjang'),
  desa: z.string().min(1, 'Desa wajib diisi').max(255, 'Desa terlalu panjang'),
  dukuh: z.string().min(1, 'Dukuh wajib diisi').max(255, 'Dukuh terlalu panjang'),
  contact: z.string().max(100, 'Kontak terlalu panjang').optional().or(z.literal('')),
})

export type CustomerFormData = z.infer<typeof customerSchema>
