import { getActiveProducts } from '@/lib/queries/products'
import { getActiveSuppliers } from '@/lib/queries/suppliers'
import { createPurchase } from '@/lib/actions/purchases'
import { PurchaseForm } from '@/components/transactions/purchase-form'
import { PageHeader } from '@/components/layout/page-header'

export default async function PembelianBaruPage() {
  const [products, suppliers] = await Promise.all([
    getActiveProducts(),
    getActiveSuppliers(),
  ])

  return (
    <div>
      <PageHeader
        title="Pembelian Baru"
        breadcrumbs={[
          { label: 'Pembelian', href: '/pembelian' },
          { label: 'Baru' },
        ]}
      />
      <PurchaseForm
        action={createPurchase}
        products={products}
        suppliers={suppliers}
        submitLabel="Simpan Pembelian"
      />
    </div>
  )
}
