import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255, 'Nama terlalu panjang'),
  desa: z.string().min(1, 'Desa wajib diisi').max(255, 'Desa terlalu panjang'),
  dukuh: z.string().min(1, 'Dukuh wajib diisi').max(255, 'Dukuh terlalu panjang'),
})

export type CustomerFormData = z.infer<typeof customerSchema>
