import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PaymentStatus, PaymentMethod } from '@/types'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  method?: PaymentMethod
}

export function PaymentStatusBadge({ status, method }: PaymentStatusBadgeProps) {
  const isLunas = status === 'Lunas'
  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant={isLunas ? 'default' : 'destructive'}
        className={cn(
          isLunas
            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
        )}
      >
        {status}
      </Badge>
      {method && (
        <span className="text-xs text-muted-foreground">{method}</span>
      )}
    </div>
  )
}
