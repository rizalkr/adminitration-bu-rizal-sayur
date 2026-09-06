'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  PackageOpen,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/penjualan', label: 'Penjualan', icon: ShoppingCart },
  { href: '/pembelian', label: 'Pembelian', icon: PackageOpen },
  { href: '/produk', label: 'Produk', icon: Package },
  { href: '/pelanggan', label: 'Pelanggan', icon: Users },
  { href: '/pemasok', label: 'Pemasok', icon: Truck },
]

export function AppSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-card px-3 py-4 shrink-0">
      {/* Brand */}
      <div className="px-2 mb-6">
        <h1 className="font-bold text-lg tracking-tight">Bu Rizal Sayur</h1>
        <p className="text-xs text-muted-foreground">Sistem Manajemen</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="my-3" />

      {/* Sign out */}
      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-3 text-muted-foreground hover:text-foreground"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>
    </aside>
  )
}
