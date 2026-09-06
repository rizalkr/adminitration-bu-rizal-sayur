import { notFound } from 'next/navigation'
import { getCustomerById } from '@/lib/queries/customers'
import { updateCustomer } from '@/lib/actions/customers'
import { CustomerForm } from '@/components/master-data/customer-form'
import { PageHeader } from '@/components/layout/page-header'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPelangganPage({ params }: Props) {
  const { id } = await params
  const customer = await getCustomerById(id)
  if (!customer) notFound()

  const action = updateCustomer.bind(null, id)

  return (
    <div>
      <PageHeader
        title="Edit Pelanggan"
        breadcrumbs={[
          { label: 'Pelanggan', href: '/pelanggan' },
          { label: customer.name },
        ]}
      />
      <CustomerForm action={action} defaultValues={customer} submitLabel="Simpan Perubahan" />
    </div>
  )
}
