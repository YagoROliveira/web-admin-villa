import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useCashbackByMonth } from '../hooks/use-dashboard-stats'
import { Skeleton } from '@/components/ui/skeleton'

export function Overview() {
  const { data, isLoading } = useCashbackByMonth()

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <Skeleton className='h-full w-full' />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <p className='text-muted-foreground text-sm'>
          Nenhum dado de cashback disponível
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='month'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
