import { auth } from '@/lib/auth'
import { getPurchasesExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const purchases = await getPurchasesExport()

  const headers = [
    'purchase_id',
    'tanggal',
    'supplier',
    'produk',
    'qty',
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
    p.unitPrice,
    p.subtotal,
    p.paymentMethod,
    p.paymentStatus,
  ])

  const filename = `pembelian-${getTodayWIB()}.csv`
  return generateCsvResponse(filename, headers, rows)
}
