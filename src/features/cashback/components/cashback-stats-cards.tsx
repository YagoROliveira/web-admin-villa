import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CashbackStats } from '../types'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react'

interface CashbackStatsCardsProps {
  stats: CashbackStats | null
  isLoading: boolean
}

export function CashbackStatsCards({
  stats,
  isLoading,
}: CashbackStatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-24' />
              <Skeleton className='mt-2 h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: 'Total Cashback',
      value: stats.totalAmountReais.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: `${stats.total} transações`,
      icon: DollarSign,
      iconColor: 'text-green-600',
    },
    {
      title: 'Concluídos',
      value: stats.completed.toString(),
      description: `${((stats.completed / stats.total) * 100).toFixed(1)}% do total`,
      icon: CheckCircle,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pendentes',
      value: stats.pending.toString(),
      description: 'Aguardando processamento',
      icon: Clock,
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
      description: `${stats.failed} falhas`,
      icon: TrendingUp,
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{card.value}</div>
            <p className='text-xs text-muted-foreground'>{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
