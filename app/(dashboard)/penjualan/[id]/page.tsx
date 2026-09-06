import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSaleById } from '@/lib/queries/sales'
import { updateSalePaymentStatus, deleteSale } from '@/lib/actions/sales'
import { PageHeader } from '@/components/layout/page-header'
import { PaymentStatusBadge } from '@/components/transactions/payment-status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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

interface Props {
  params: Promise<{ id: string }>
}

export default async function PenjualanDetailPage({ params }: Props) {
  const { id } = await params
  const sale = await getSaleById(id)
  if (!sale) notFound()

  const totalAmount = sale.items.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0,
  )
  const totalQty = sale.items.reduce((sum, item) => sum + item.qty, 0)
  const isLunas = sale.paymentStatus === 'Lunas'

  return (
    <div>
      <PageHeader
        title="Detail Penjualan"
        breadcrumbs={[
          { label: 'Penjualan', href: '/penjualan' },
          { label: formatDate(sale.saleDate) },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span>{formatDate(sale.saleDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan</span>
              <span className="font-medium">{sale.customerName ?? '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pembayaran</span>
              <PaymentStatusBadge
                status={sale.paymentStatus as PaymentStatus}
                method={sale.paymentMethod as PaymentMethod}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Item</span>
              <span>{sale.items.length} item</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Ekor</span>
              <span>{totalQty} ekor</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatRupiah(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Item Produk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Harga / Ekor</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName ?? '-'}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">{formatRupiah(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatRupiah(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/penjualan/${id}/edit`} className={buttonVariants({ variant: 'outline' })}>
          Edit Transaksi
        </Link>

        {/* Toggle payment status */}
        <form
          action={async () => {
            'use server'
            await updateSalePaymentStatus(
              id,
              isLunas ? 'Belum Lunas' : 'Lunas',
            )
          }}
        >
          <Button variant="outline" type="submit">
            Tandai {isLunas ? 'Belum Lunas' : 'Lunas'}
          </Button>
        </form>

        {/* Delete */}
        <form
          action={async () => {
            'use server'
            await deleteSale(id)
          }}
        >
          <Button variant="outline" type="submit" className="text-destructive hover:text-destructive">
            Hapus Transaksi
          </Button>
        </form>
      </div>
    </div>
  )
}
