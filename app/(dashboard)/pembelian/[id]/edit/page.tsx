import { notFound } from 'next/navigation'
import { getPurchaseById } from '@/lib/queries/purchases'
import { getActiveProducts } from '@/lib/queries/products'
import { getActiveSuppliers } from '@/lib/queries/suppliers'
import { updatePurchase } from '@/lib/actions/purchases'
import { PurchaseForm } from '@/components/transactions/purchase-form'
import { PageHeader } from '@/components/layout/page-header'
import type { PaymentMethod, PaymentStatus } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPembelianPage({ params }: Props) {
  const { id } = await params

  const [purchase, products, suppliers] = await Promise.all([
    getPurchaseById(id),
    getActiveProducts(),
    getActiveSuppliers(),
  ])

  if (!purchase) notFound()

  const action = updatePurchase.bind(null, id)

  const defaultValues = {
    supplierId: purchase.supplierId,
    purchaseDate: purchase.purchaseDate,
    paymentMethod: purchase.paymentMethod as PaymentMethod,
    paymentStatus: purchase.paymentStatus as PaymentStatus,
    items: purchase.items.map((item) => ({
      productId: item.productId,
      unit: item.unit,
      qty: item.qty,
      unitPrice: parseFloat(item.unitPrice),
    })),
  }

  return (
    <div>
      <PageHeader
        title="Edit Pembelian"
        breadcrumbs={[
          { label: 'Pembelian', href: '/pembelian' },
          { label: 'Detail', href: `/pembelian/${id}` },
          { label: 'Edit' },
        ]}
      />
      <PurchaseForm
        action={action}
        products={products}
        suppliers={suppliers}
        defaultValues={defaultValues}
        submitLabel="Simpan Perubahan"
      />
    </div>
  )
}
