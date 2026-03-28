import {
  ShoppingCart,
  Clock,
  CheckCircle,
  ChefHat,
  Bike,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderStats } from '../data/schema'

interface OrdersStatsCardsProps {
  stats?: OrderStats
  isLoading?: boolean
}

export function OrdersStatsCards({ stats, isLoading }: OrdersStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Pedidos',
      value: stats?.total ?? 0,
      icon: ShoppingCart,
      description: 'Todos os pedidos',
    },
    {
      title: 'Pendentes',
      value: stats?.pending ?? 0,
      icon: Clock,
      description: 'Aguardando confirmação',
    },
    {
      title: 'Confirmados',
      value: stats?.confirmed ?? 0,
      icon: CheckCircle,
      description: 'Confirmados pela loja',
    },
    {
      title: 'Preparando',
      value: stats?.processing ?? 0,
      icon: ChefHat,
      description: 'Em preparação',
    },
    {
      title: 'Entregues',
      value: stats?.delivered ?? 0,
      icon: Bike,
      description: 'Entregues com sucesso',
    },
    {
      title: 'Cancelados',
      value: stats?.canceled ?? 0,
      icon: XCircle,
      description: 'Pedidos cancelados',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{card.value}</div>
                <p className='text-muted-foreground text-xs'>
                  {card.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
