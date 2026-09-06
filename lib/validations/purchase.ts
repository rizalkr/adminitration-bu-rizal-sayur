import { z } from 'zod'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/types'

export const purchaseItemSchema = z.object({
  productId: z.string().uuid('ID produk tidak valid'),
  qty: z.coerce
    .number({ message: 'Jumlah harus berupa angka' })
    .int('Jumlah harus bilangan bulat')
    .positive('Jumlah harus lebih dari 0'),
  unitPrice: z.coerce
    .number({ message: 'Harga harus berupa angka' })
    .nonnegative('Harga tidak boleh negatif'),
})

export const purchaseSchema = z
  .object({
    supplierId: z.string().uuid('Pemasok tidak valid'),
    purchaseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
    paymentMethod: z.enum(PAYMENT_METHODS, {
      message: 'Metode pembayaran tidak valid',
    }),
    paymentStatus: z.enum(PAYMENT_STATUSES, {
      message: 'Status pembayaran tidak valid',
    }),
    items: z
      .array(purchaseItemSchema)
      .min(1, 'Minimal satu item produk harus diisi'),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'Hutang' && data.paymentStatus !== 'Belum Lunas') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Metode Hutang otomatis berstatus Belum Lunas',
        path: ['paymentStatus'],
      })
    }
  })

export type PurchaseFormData = z.infer<typeof purchaseSchema>
export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>
