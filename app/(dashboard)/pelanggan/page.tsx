import Link from 'next/link'
import { getCustomers } from '@/lib/queries/customers'
import { toggleCustomerActive, deleteCustomer } from '@/lib/actions/customers'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function PelangganPage() {
  const customers = await getCustomers(true)

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        description="Kelola daftar pelanggan"
        action={{ label: '+ Pelanggan Baru', href: '/pelanggan/baru' }}
        exportHref="/api/export/pelanggan"
        exportLabel="Export CSV"
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Dukuh</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada pelanggan.
                </TableCell>
              </TableRow>
            )}
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.desa}</TableCell>
                <TableCell>{c.dukuh}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? 'default' : 'secondary'}>
                    {c.isActive ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/pelanggan/${c.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await toggleCustomerActive(c.id, !c.isActive)
                      }}
                    >
                      <Button variant="outline" size="sm" type="submit">
                        {c.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await deleteCustomer(c.id)
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        type="submit"
                        className="text-destructive hover:text-destructive"
                      >
                        Hapus
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
