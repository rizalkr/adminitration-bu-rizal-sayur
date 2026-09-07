import { auth } from '@/lib/auth'
import { getCustomersExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const customers = await getCustomersExport()

  const headers = ['id', 'name', 'desa', 'dukuh', 'contact', 'is_active', 'created_at', 'updated_at']
  const rows = customers.map((c) => [
    c.id,
    c.name,
    c.desa,
    c.dukuh,
    c.contact || '',
    c.isActive ? 'true' : 'false',
    c.createdAt ? new Date(c.createdAt).toISOString() : '',
    c.updatedAt ? new Date(c.updatedAt).toISOString() : '',
  ])

  const filename = `pelanggan-${getTodayWIB()}.csv`
  return generateCsvResponse(filename, headers, rows)
}
