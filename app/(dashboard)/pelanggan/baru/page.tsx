import { createCustomer } from '@/lib/actions/customers'
import { CustomerForm } from '@/components/master-data/customer-form'
import { PageHeader } from '@/components/layout/page-header'

export default function PelangganBaruPage() {
  return (
    <div>
      <PageHeader
        title="Pelanggan Baru"
        breadcrumbs={[
          { label: 'Pelanggan', href: '/pelanggan' },
          { label: 'Baru' },
        ]}
      />
      <CustomerForm action={createCustomer} submitLabel="Simpan Pelanggan" />
    </div>
  )
}
