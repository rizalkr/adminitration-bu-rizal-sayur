import { auth } from '@/lib/auth'
import { getSuppliersExport } from '@/lib/queries/export'
import { generateCsvResponse, getTodayWIB } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const suppliers = await getSuppliersExport()

  const headers = ['id', 'name', 'contact', 'address', 'is_active', 'created_at', 'updated_at']
  const rows = suppliers.map((s) => [
    s.id,
    s.name,
    s.contact || '',
    s.address || '',
    s.isActive ? 'true' : 'false',
    s.createdAt ? new Date(s.createdAt).toISOString() : '',
    s.updatedAt ? new Date(s.updatedAt).toISOString() : '',
  ])

  const filename = `pemasok-${getTodayWIB()}.csv`
  return generateCsvResponse(filename, headers, rows)
}
