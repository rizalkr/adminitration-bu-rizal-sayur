import Link from 'next/link'
import { getSuppliers } from '@/lib/queries/suppliers'
import { toggleSupplierActive, deleteSupplier } from '@/lib/actions/suppliers'
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

export default async function PemasokPage() {
  const suppliers = await getSuppliers(true)

  return (
    <div>
      <PageHeader
        title="Pemasok"
        description="Kelola daftar pemasok"
        action={{ label: '+ Pemasok Baru', href: '/pemasok/baru' }}
        exportHref="/api/export/pemasok"
        exportLabel="Export CSV"
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada pemasok.
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.contact ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-48 truncate">
                  {s.address ?? '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? 'default' : 'secondary'}>
                    {s.isActive ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/pemasok/${s.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await toggleSupplierActive(s.id, !s.isActive)
                      }}
                    >
                      <Button variant="outline" size="sm" type="submit">
                        {s.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await deleteSupplier(s.id)
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
