import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah, formatTotalQty } from '@/lib/utils'
import { Coins, Bird, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TransactionSummary } from '@/types'

interface TransactionSummaryCardsProps {
  summary: TransactionSummary
  type: 'sale' | 'purchase'
}

export function TransactionSummaryCards({
  summary,
  type,
}: TransactionSummaryCardsProps) {
  const isSale = type === 'sale'
  const titleTotal = isSale ? 'Total Penjualan' : 'Total Pembelian'
  const titleVolume = isSale ? 'Volume Terjual' : 'Volume Dibeli'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* 1. Total Nominal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {titleTotal}
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(summary.totalAmount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.transactionCount} transaksi
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Volume */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {titleVolume}
          </CardTitle>
          <Bird className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold whitespace-nowrap">
            {formatTotalQty(summary.totalQtyEkor, summary.totalQtyKg)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Satuan ekor dan kg terpisah
          </p>
        </CardContent>
      </Card>

      {/* 3. Belum Lunas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Belum Lunas
          </CardTitle>
          <AlertCircle className={`h-4 w-4 ${summary.unpaidCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.unpaidCount > 0 ? 'text-destructive' : ''}`}>
            {formatRupiah(summary.unpaidAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.unpaidCount} transaksi belum lunas
          </p>
        </CardContent>
      </Card>

      {/* 4. Sudah Lunas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sudah Lunas
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatRupiah(summary.paidAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.transactionCount - summary.unpaidCount} transaksi lunas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

