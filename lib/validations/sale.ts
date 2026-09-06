import { z } from 'zod'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/types'

export const saleItemSchema = z.object({
  productId: z.string().uuid('ID produk tidak valid'),
  qty: z.coerce
    .number({ message: 'Jumlah harus berupa angka' })
    .int('Jumlah harus bilangan bulat')
    .positive('Jumlah harus lebih dari 0'),
  unitPrice: z.coerce
    .number({ message: 'Harga harus berupa angka' })
    .nonnegative('Harga tidak boleh negatif'),
})

export const saleSchema = z
  .object({
    customerId: z.string().uuid('Pelanggan tidak valid'),
    saleDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
    paymentMethod: z.enum(PAYMENT_METHODS, {
      message: 'Metode pembayaran tidak valid',
    }),
    paymentStatus: z.enum(PAYMENT_STATUSES, {
      message: 'Status pembayaran tidak valid',
    }),
    items: z
      .array(saleItemSchema)
      .min(1, 'Minimal satu item produk harus diisi'),
  })
  .superRefine((data, ctx) => {
    // Server-side enforcement of the Hutang → Belum Lunas business rule.
    // Even if the client sends a manipulated paymentStatus, this will catch it.
    if (data.paymentMethod === 'Hutang' && data.paymentStatus !== 'Belum Lunas') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Metode Hutang otomatis berstatus Belum Lunas',
        path: ['paymentStatus'],
      })
    }
  })

export type SaleFormData = z.infer<typeof saleSchema>
export type SaleItemFormData = z.infer<typeof saleItemSchema>
