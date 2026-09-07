import Link from 'next/link'
import { getSales, getSalesSummary } from '@/lib/queries/sales'
import { PageHeader } from '@/components/layout/page-header'
import { PaymentStatusBadge } from '@/components/transactions/payment-status-badge'
import { TransactionDateFilter } from '@/components/transactions/transaction-date-filter'
import { TransactionSummaryCards } from '@/components/transactions/transaction-summary-cards'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRupiah, formatDate, formatTotalQty, resolveTransactionFilter, buildExportHref, cn } from '@/lib/utils'
import { Plus, Download } from 'lucide-react'
import type { PaymentMethod, PaymentStatus } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    period?: string
    dari?: string
    sampai?: string
  }>
}

export default async function PenjualanPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = resolveTransactionFilter(params)

  const [sales, summary] = await Promise.all([
    getSales(filter),
    getSalesSummary(filter),
  ])

  return (
    <div>
      <PageHeader
        title="Penjualan"
        description="Daftar dan ringkasan transaksi penjualan"
        action={{ label: '+ Penjualan Baru', href: '/penjualan/baru' }}
        exportHref={buildExportHref('/api/export/penjualan', filter)}
        exportLabel="Export CSV"
      />

      {/* Date Range Filter */}
      <TransactionDateFilter
        currentPeriod={filter.period}
        currentStartDate={filter.startDate}
        currentEndDate={filter.endDate}
        displayLabel={filter.displayLabel}
      />

      {/* Summary Cards */}
      <TransactionSummaryCards summary={summary} type="sale" />

      {/* Table Toolbar / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">Daftar Transaksi</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
            {sales.length} data
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={buildExportHref('/api/export/penjualan', filter)}
            download
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 h-9')}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <Link
            href="/penjualan/baru"
            className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 h-9')}
          >
            <Plus className="h-4 w-4" />
            Penjualan Baru
          </Link>
        </div>
      </div>

      {/* Transactions Table */}
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
                  Tidak ada transaksi penjualan pada periode {filter.displayLabel.toLowerCase()}.
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
                <TableCell className="text-right text-sm whitespace-nowrap">
                  {formatTotalQty(sale.totalQtyEkor, sale.totalQtyKg)}
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
