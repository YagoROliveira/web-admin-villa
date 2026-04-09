import { Store, CheckCircle2, XCircle, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { StoreStats } from '../data/schema'

interface StoresStatsCardsProps {
  stats?: StoreStats
  isLoading?: boolean
}

const cards = [
  {
    key: 'total' as const,
    label: 'Total de lojas',
    icon: Store,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    key: 'active' as const,
    label: 'Lojas ativas',
    icon: CheckCircle2,
    bg: 'bg-green-50 dark:bg-green-950/40',
    iconBg: 'bg-green-100 dark:bg-green-900/60',
    iconColor: 'text-green-600 dark:text-green-400',
    valueColor: 'text-green-700 dark:text-green-300',
  },
  {
    key: 'inactive' as const,
    label: 'Lojas inativas',
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-950/40',
    iconBg: 'bg-red-100 dark:bg-red-900/60',
    iconColor: 'text-red-500 dark:text-red-400',
    valueColor: 'text-red-700 dark:text-red-300',
  },
  {
    key: 'featured' as const,
    label: 'Lojas em destaque',
    icon: Star,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-500 dark:text-amber-400',
    valueColor: 'text-amber-700 dark:text-amber-300',
  },
]

export function StoresStatsCards({ stats, isLoading }: StoresStatsCardsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <div
          key={card.key}
          className={`flex items-center gap-4 rounded-xl border p-5 ${card.bg}`}
        >
          <div className={`rounded-xl p-3 ${card.iconBg}`}>
            <card.icon className={`h-7 w-7 ${card.iconColor}`} />
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-10' />
                <Skeleton className='h-4 w-24' />
              </>
            ) : (
              <>
                <p className={`text-3xl font-bold leading-tight ${card.valueColor}`}>
                  {stats?.[card.key] ?? 0}
                </p>
                <p className='text-muted-foreground text-sm'>{card.label}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

