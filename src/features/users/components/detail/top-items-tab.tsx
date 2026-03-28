import { Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserTopItems } from '../../hooks/use-user-detail'

interface TopItemsTabProps {
  userId: string
}

export function TopItemsTab({ userId }: TopItemsTabProps) {
  const { data: topItems, isLoading } = useUserTopItems(userId)

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    )
  }

  if (!topItems || topItems.length === 0) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='flex flex-col items-center justify-center space-y-3'>
            <Package className='text-muted-foreground h-12 w-12' />
            <p className='text-muted-foreground'>
              Nenhum item comprado ainda
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxQty = Math.max(...topItems.map((item) => item.totalQuantity), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Produtos Mais Comprados
        </CardTitle>
        <CardDescription>
          Top 10 produtos por quantidade total comprada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {topItems.map((topItem, index) => (
            <div key={topItem.itemId ?? index} className='flex items-center gap-4'>
              {/* Rank */}
              <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold'>
                {index + 1}
              </div>

              {/* Product Image */}
              <Avatar className='h-10 w-10 rounded-md'>
                <AvatarImage
                  src={topItem.item?.imageUrl ?? undefined}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-md'>
                  <Package className='h-5 w-5' />
                </AvatarFallback>
              </Avatar>

              {/* Product Info */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between'>
                  <p className='truncate text-sm font-medium'>
                    {topItem.name}
                  </p>
                  <div className='ml-2 flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs whitespace-nowrap'>
                      <ShoppingCart className='mr-1 h-3 w-3' />
                      {topItem.orderCount} pedidos
                    </Badge>
                    <Badge className='text-xs whitespace-nowrap'>
                      {topItem.totalQuantity} un.
                    </Badge>
                  </div>
                </div>
                <div className='mt-1 flex items-center gap-2'>
                  <Progress
                    value={(topItem.totalQuantity / maxQty) * 100}
                    className='h-2 flex-1'
                  />
                  {topItem.item?.price && (
                    <span className='text-muted-foreground text-xs whitespace-nowrap'>
                      R$ {Number(topItem.item.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
