import { auth } from '@/lib/auth'
import { getSalesExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sales = await getSalesExport()

  const headers = [
    'sale_id',
    'tanggal',
    'customer',
    'desa',
    'dukuh',
    'produk',
    'qty',
    'unit',
    'unit_price',
    'subtotal',
    'payment_method',
    'payment_status',
  ]

  const rows = sales.map((s) => [
    s.saleId,
    s.tanggal,
    s.customer || '',
    s.desa || '',
    s.dukuh || '',
    s.produk || '',
    s.qty,
    s.unit,
    s.unitPrice,
    s.subtotal,
    s.paymentMethod,
    s.paymentStatus,
  ])

  const filename = `penjualan-${getTodayWIB()}.csv`
  return generateCsvResponse(filename, headers, rows)
}
