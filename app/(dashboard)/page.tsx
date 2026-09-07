import { getDashboardStats } from '@/lib/queries/dashboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatRupiah, getTodayWIB, formatDate, formatTotalQty } from '@/lib/utils'
import {
  ShoppingCart,
  PackageOpen,
  Bird,
  AlertCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const today = getTodayWIB()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan operasional hari ini — {formatDate(today)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Total Penjualan Hari Ini"
          value={formatRupiah(stats.salesTodayAmount)}
          subtitle={
            stats.salesTodayQtyEkor > 0 || parseFloat(stats.salesTodayQtyKg) > 0
              ? `Terjual: ${formatTotalQty(stats.salesTodayQtyEkor, stats.salesTodayQtyKg)}`
              : 'Belum ada transaksi'
          }
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Pembelian Hari Ini"
          value={formatRupiah(stats.purchasesTodayAmount)}
          subtitle={
            stats.purchasesTodayQtyEkor > 0 || parseFloat(stats.purchasesTodayQtyKg) > 0
              ? `Dibeli: ${formatTotalQty(stats.purchasesTodayQtyEkor, stats.purchasesTodayQtyKg)}`
              : 'Belum ada transaksi'
          }
          icon={PackageOpen}
        />
        <StatCard
          title="Terjual Hari Ini"
          value={formatTotalQty(stats.salesTodayQtyEkor, stats.salesTodayQtyKg)}
          subtitle="Volume penjualan"
          icon={Bird}
        />
        <StatCard
          title="Dibeli Hari Ini"
          value={formatTotalQty(stats.purchasesTodayQtyEkor, stats.purchasesTodayQtyKg)}
          subtitle="Volume pembelian"
          icon={PackageOpen}
        />
      </div>

      {/* Unpaid transactions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          title="Penjualan Belum Lunas"
          value={stats.unpaidSalesCount.toString()}
          subtitle="transaksi penjualan"
          icon={AlertCircle}
          valueClassName={stats.unpaidSalesCount > 0 ? 'text-destructive' : ''}
        />
        <StatCard
          title="Pembelian Belum Lunas"
          value={stats.unpaidPurchasesCount.toString()}
          subtitle="transaksi pembelian"
          icon={AlertCircle}
          valueClassName={stats.unpaidPurchasesCount > 0 ? 'text-destructive' : ''}
        />
      </div>
    </div>
  )
}
