import Link from 'next/link'
import { getSales } from '@/lib/queries/sales'
import { PageHeader } from '@/components/layout/page-header'
import { PaymentStatusBadge } from '@/components/transactions/payment-status-badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRupiah, formatDate } from '@/lib/utils'
import type { PaymentMethod, PaymentStatus } from '@/types'

export default async function PenjualanPage() {
  const sales = await getSales()

  return (
    <div>
      <PageHeader
        title="Penjualan"
        description="Daftar seluruh transaksi penjualan"
        action={{ label: '+ Penjualan Baru', href: '/penjualan/baru' }}
        exportHref="/api/export/penjualan"
        exportLabel="Export CSV"
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Belum ada transaksi penjualan.
                </TableCell>
              </TableRow>
            )}
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDate(sale.saleDate)}
                </TableCell>
                <TableCell className="font-medium">
                  {sale.customerName ?? '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatRupiah(sale.totalAmount)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {sale.totalQty} ekor
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge
                    status={sale.paymentStatus as PaymentStatus}
                    method={sale.paymentMethod as PaymentMethod}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/penjualan/${sale.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Detail
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
