import Link from 'next/link'
import { getPurchases } from '@/lib/queries/purchases'
import { PageHeader } from '@/components/layout/page-header'
import { PaymentStatusBadge } from '@/components/transactions/payment-status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
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

export default async function PembelianPage() {
  const purchases = await getPurchases()

  return (
    <div>
      <PageHeader
        title="Pembelian"
        description="Daftar seluruh transaksi pembelian"
        action={{ label: '+ Pembelian Baru', href: '/pembelian/baru' }}
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pemasok</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Belum ada transaksi pembelian.
                </TableCell>
              </TableRow>
            )}
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDate(purchase.purchaseDate)}
                </TableCell>
                <TableCell className="font-medium">{purchase.supplierName ?? '-'}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatRupiah(purchase.totalAmount)}
                </TableCell>
                <TableCell className="text-right text-sm">{purchase.totalQty} ekor</TableCell>
                <TableCell>
                  <PaymentStatusBadge
                    status={purchase.paymentStatus as PaymentStatus}
                    method={purchase.paymentMethod as PaymentMethod}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/pembelian/${purchase.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
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
