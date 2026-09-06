import { getDashboardStats } from '@/lib/queries/dashboard'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatRupiah, getTodayWIB, formatDate } from '@/lib/utils'
import {
  ShoppingCart,
  PackageOpen,
  Bird,
  AlertCircle,
} from 'lucide-react'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const today = getTodayWIB()

  const totalUnpaid = stats.unpaidSalesCount + stats.unpaidPurchasesCount

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan operasional hari ini — {formatDate(today)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 mb-6">
        <StatCard
          title="Total Penjualan Hari Ini"
          value={formatRupiah(stats.salesTodayAmount)}
          subtitle={`${stats.salesTodayQty} ekor terjual`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Pembelian Hari Ini"
          value={formatRupiah(stats.purchasesTodayAmount)}
          subtitle={`${stats.purchasesTodayQty} ekor dibeli`}
          icon={PackageOpen}
        />
        <StatCard
          title="Ekor Dijual Hari Ini"
          value={stats.salesTodayQty.toString()}
          subtitle="jumlah ekor"
          icon={Bird}
          className="col-span-2 md:col-span-1"
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
