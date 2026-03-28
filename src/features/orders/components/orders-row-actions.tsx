import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Eye, RefreshCw, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Order } from '../data/schema'
import { useOrdersContext } from './orders-provider'

interface OrdersRowActionsProps {
  row: Row<Order>
}

export function OrdersRowActions({ row }: OrdersRowActionsProps) {
  const order = row.original
  const navigate = useNavigate()
  const { setSelectedOrder, setDialogOpen } = useOrdersContext()

  const isCancelable = !['DELIVERED', 'CANCELED', 'FAILED', 'REFUNDED'].includes(
    order.status
  )

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuItem
          onClick={() => {
            navigate({
              to: '/admin/orders/$orderId',
              params: { orderId: order.id },
            })
          }}
        >
          <Eye className='mr-2 h-4 w-4' />
          Ver detalhes
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setSelectedOrder(order)
            setDialogOpen('status')
          }}
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          Alterar status
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setSelectedOrder(order)
            setDialogOpen('assign')
          }}
        >
          <Truck className='mr-2 h-4 w-4' />
          Atribuir entregador
        </DropdownMenuItem>

        {isCancelable && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrder(order)
                setDialogOpen('cancel')
              }}
              className='text-destructive focus:text-destructive'
            >
              <XCircle className='mr-2 h-4 w-4' />
              Cancelar pedido
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
