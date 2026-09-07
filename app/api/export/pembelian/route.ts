import { auth } from '@/lib/auth'
import { getPurchasesExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dari = searchParams.get('dari')?.trim() || undefined
  const sampai = searchParams.get('sampai')?.trim() || undefined

  const purchases = await getPurchasesExport({ startDate: dari, endDate: sampai })

  const headers = [
    'purchase_id',
    'tanggal',
    'supplier',
    'produk',
    'qty',
    'unit',
    'unit_price',
    'subtotal',
    'payment_method',
    'payment_status',
  ]

  const rows = purchases.map((p) => [
    p.purchaseId,
    p.tanggal,
    p.supplier || '',
    p.produk || '',
    p.qty,
    p.unit,
    p.unitPrice,
    p.subtotal,
    p.paymentMethod,
    p.paymentStatus,
  ])

  let filename = `pembelian-${getTodayWIB()}.csv`
  if (dari && sampai) {
    filename = `pembelian-${dari}-sd-${sampai}.csv`
  } else if (dari) {
    filename = `pembelian-sejak-${dari}.csv`
  } else if (sampai) {
    filename = `pembelian-hingga-${sampai}.csv`
  }

  return generateCsvResponse(filename, headers, rows)
}
