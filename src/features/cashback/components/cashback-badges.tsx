import { Badge } from '@/components/ui/badge'
import { CashbackStatus, CashbackType } from '../types'
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Ban,
  RotateCcw,
} from 'lucide-react'

interface StatusBadgeProps {
  status: CashbackStatus
}

const statusConfig = {
  [CashbackStatus.PENDING]: {
    label: 'Pendente',
    variant: 'secondary' as const,
    icon: Clock,
  },
  [CashbackStatus.PROCESSING]: {
    label: 'Processando',
    variant: 'default' as const,
    icon: Loader2,
  },
  [CashbackStatus.COMPLETED]: {
    label: 'Concluído',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
  [CashbackStatus.FAILED]: {
    label: 'Falhou',
    variant: 'destructive' as const,
    icon: XCircle,
  },
  [CashbackStatus.CANCELLED]: {
    label: 'Cancelado',
    variant: 'outline' as const,
    icon: Ban,
  },
  [CashbackStatus.REVERSED]: {
    label: 'Revertido',
    variant: 'outline' as const,
    icon: RotateCcw,
  },
}

export function CashbackStatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className='gap-1'>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

interface TypeBadgeProps {
  type: CashbackType
}

const typeConfig = {
  [CashbackType.PERCENTAGE]: {
    label: 'Percentual',
    variant: 'default' as const,
  },
  [CashbackType.FIXED]: {
    label: 'Valor Fixo',
    variant: 'secondary' as const,
  },
  [CashbackType.PROMOTIONAL]: {
    label: 'Promocional',
    variant: 'success' as const,
  },
  [CashbackType.LOYALTY]: {
    label: 'Fidelidade',
    variant: 'outline' as const,
  },
}

export function CashbackTypeBadge({ type }: TypeBadgeProps) {
  const config = typeConfig[type]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
