import {
  ShoppingCart,
  Clock,
  CheckCircle,
  ChefHat,
  Bike,
  XCircle,
  CalendarClock,
  RefreshCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OrdersStatsCardsProps {
  counts?: Record<string, number>
  isLoading?: boolean
}

export function OrdersStatsCards({ counts, isLoading }: OrdersStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Pedidos',
      value: counts?.all ?? 0,
      icon: ShoppingCart,
      description: 'Todos os pedidos',
    },
    {
      title: 'Agendados',
      value: counts?.scheduled ?? 0,
      icon: CalendarClock,
      description: 'Pedidos agendados',
    },
    {
      title: 'Pendentes',
      value: counts?.pending ?? 0,
      icon: Clock,
      description: 'Aguardando confirmação',
    },
    {
      title: 'Em Preparo',
      value: counts?.processing ?? 0,
      icon: ChefHat,
      description: 'Em preparação',
    },
    {
      title: 'Entregues',
      value: counts?.delivered ?? 0,
      icon: Bike,
      description: 'Entregues com sucesso',
    },
    {
      title: 'Cancelados',
      value: counts?.canceled ?? 0,
      icon: XCircle,
      description: 'Pedidos cancelados',
    },
    {
      title: 'Reembolsos Solicit.',
      value: counts?.requested ?? 0,
      icon: RefreshCcw,
      description: 'Aguardando reembolso',
    },
  ]

  return (
    <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3'>
            <CardTitle className='text-xs font-medium leading-tight'>{card.title}</CardTitle>
            <card.icon className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
          </CardHeader>
          <CardContent className='px-3 pb-3'>
            {isLoading ? (
              <Skeleton className='h-7 w-12' />
            ) : (
              <>
                <div className='text-xl font-bold'>{card.value.toLocaleString('pt-BR')}</div>
                <p className='text-muted-foreground text-[10px] leading-tight'>
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

