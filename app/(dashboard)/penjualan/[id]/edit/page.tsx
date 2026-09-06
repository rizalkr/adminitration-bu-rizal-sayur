import { notFound } from 'next/navigation'
import { getSaleById } from '@/lib/queries/sales'
import { getActiveProducts } from '@/lib/queries/products'
import { getActiveCustomers } from '@/lib/queries/customers'
import { updateSale } from '@/lib/actions/sales'
import { SaleForm } from '@/components/transactions/sale-form'
import { PageHeader } from '@/components/layout/page-header'
import type { PaymentMethod, PaymentStatus } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPenjualanPage({ params }: Props) {
  const { id } = await params

  const [sale, products, customers] = await Promise.all([
    getSaleById(id),
    getActiveProducts(),
    getActiveCustomers(),
  ])

  if (!sale) notFound()

  const action = updateSale.bind(null, id)

  const defaultValues = {
    customerId: sale.customerId,
    saleDate: sale.saleDate,
    paymentMethod: sale.paymentMethod as PaymentMethod,
    paymentStatus: sale.paymentStatus as PaymentStatus,
    items: sale.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
      unitPrice: parseFloat(item.unitPrice),
    })),
  }

  return (
    <div>
      <PageHeader
        title="Edit Penjualan"
        breadcrumbs={[
          { label: 'Penjualan', href: '/penjualan' },
          { label: 'Detail', href: `/penjualan/${id}` },
          { label: 'Edit' },
        ]}
      />
      <SaleForm
        action={action}
        products={products}
        customers={customers}
        defaultValues={defaultValues}
        submitLabel="Simpan Perubahan"
      />
    </div>
  )
}
