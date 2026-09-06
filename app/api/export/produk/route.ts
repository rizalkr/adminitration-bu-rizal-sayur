import { auth } from '@/lib/auth'
import { getProductsExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const products = await getProductsExport()

  const headers = ['id', 'name', 'is_active', 'created_at', 'updated_at']
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.isActive ? 'true' : 'false',
    p.createdAt ? new Date(p.createdAt).toISOString() : '',
    p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
  ])

  const filename = `produk-${getTodayWIB()}.csv`
  return generateCsvResponse(filename, headers, rows)
}
