import { auth } from '@/lib/auth'
import { getSalesExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dari = searchParams.get('dari')?.trim() || undefined
  const sampai = searchParams.get('sampai')?.trim() || undefined

  const sales = await getSalesExport({ startDate: dari, endDate: sampai })

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

  let filename = `penjualan-${getTodayWIB()}.csv`
  if (dari && sampai) {
    filename = `penjualan-${dari}-sd-${sampai}.csv`
  } else if (dari) {
    filename = `penjualan-sejak-${dari}.csv`
  } else if (sampai) {
    filename = `penjualan-hingga-${sampai}.csv`
  }

  return generateCsvResponse(filename, headers, rows)
}
