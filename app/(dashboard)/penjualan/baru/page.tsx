import { getActiveProducts } from '@/lib/queries/products'
import { getActiveCustomers } from '@/lib/queries/customers'
import { createSale } from '@/lib/actions/sales'
import { SaleForm } from '@/components/transactions/sale-form'
import { PageHeader } from '@/components/layout/page-header'

export default async function PenjualanBaruPage() {
  const [products, customers] = await Promise.all([
    getActiveProducts(),
    getActiveCustomers(),
  ])

  return (
    <div>
      <PageHeader
        title="Penjualan Baru"
        breadcrumbs={[
          { label: 'Penjualan', href: '/penjualan' },
          { label: 'Baru' },
        ]}
      />
      <SaleForm
        action={createSale}
        products={products}
        customers={customers}
        submitLabel="Simpan Penjualan"
      />
    </div>
  )
}
