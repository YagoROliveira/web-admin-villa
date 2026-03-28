import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useOrdersContext } from './orders-provider'
import {
  useUpdateOrderStatus,
  useAssignDeliveryMan,
  useCancelOrder,
} from '../hooks/use-orders'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_TYPE_LABELS,
} from '../data/schema'

// ─── Status transitions allowed (simplified for frontend) ────────────
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['HANDOVER', 'CANCELED'],
  HANDOVER: ['PICKED_UP', 'CANCELED'],
  PICKED_UP: ['DELIVERED', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
  FAILED: [],
  REFUND_REQUESTED: ['REFUNDED'],
  REFUNDED: [],
}

// ─── Change Status Dialog ────────────────────────────────────────────

export function ChangeStatusDialog() {
  const { selectedOrder, dialogOpen, setDialogOpen, setSelectedOrder } =
    useOrdersContext()
  const updateStatus = useUpdateOrderStatus()
  const [newStatus, setNewStatus] = useState('')

  const isOpen = dialogOpen === 'status' && !!selectedOrder
  const allowedStatuses = selectedOrder
    ? STATUS_TRANSITIONS[selectedOrder.status] ?? []
    : []

  function handleClose() {
    setDialogOpen(null)
    setNewStatus('')
    setTimeout(() => setSelectedOrder(null), 300)
  }

  function handleConfirm() {
    if (!selectedOrder || !newStatus) return
    updateStatus.mutate(
      { orderId: selectedOrder.id, status: newStatus },
      { onSuccess: handleClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Alterar Status do Pedido</DialogTitle>
          <DialogDescription>
            Pedido #{selectedOrder?.trackingId?.substring(0, 8).toUpperCase()}
            {' — Status atual: '}
            <Badge
              className={`${ORDER_STATUS_LABELS[selectedOrder?.status ?? '']?.color ?? ''} border-0`}
            >
              {ORDER_STATUS_LABELS[selectedOrder?.status ?? '']?.label ??
                selectedOrder?.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='new-status'>Novo Status</Label>
            {allowedStatuses.length > 0 ? (
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id='new-status'>
                  <SelectValue placeholder='Selecione o novo status' />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((status) => {
                    const info = ORDER_STATUS_LABELS[status]
                    return (
                      <SelectItem key={status} value={status}>
                        {info?.label ?? status}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Não há transições disponíveis para este status.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!newStatus || updateStatus.isPending}
          >
            {updateStatus.isPending ? 'Atualizando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Cancel Order Dialog ─────────────────────────────────────────────

export function CancelOrderDialog() {
  const { selectedOrder, dialogOpen, setDialogOpen, setSelectedOrder } =
    useOrdersContext()
  const cancelOrder = useCancelOrder()
  const [reason, setReason] = useState('')

  const isOpen = dialogOpen === 'cancel' && !!selectedOrder

  function handleClose() {
    setDialogOpen(null)
    setReason('')
    setTimeout(() => setSelectedOrder(null), 300)
  }

  function handleConfirm() {
    if (!selectedOrder) return
    cancelOrder.mutate(
      { orderId: selectedOrder.id, reason },
      { onSuccess: handleClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Cancelar Pedido</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar o pedido{' '}
            <strong>#{selectedOrder?.trackingId?.substring(0, 8).toUpperCase()}</strong>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='cancel-reason'>Motivo do cancelamento</Label>
            <Textarea
              id='cancel-reason'
              placeholder='Informe o motivo do cancelamento...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Voltar
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Delivery Man Dialog ──────────────────────────────────────

export function AssignDeliveryManDialog() {
  const { selectedOrder, dialogOpen, setDialogOpen, setSelectedOrder } =
    useOrdersContext()
  const assignDM = useAssignDeliveryMan()
  const [deliveryManId, setDeliveryManId] = useState('')

  const isOpen = dialogOpen === 'assign' && !!selectedOrder

  function handleClose() {
    setDialogOpen(null)
    setDeliveryManId('')
    setTimeout(() => setSelectedOrder(null), 300)
  }

  function handleConfirm() {
    if (!selectedOrder || !deliveryManId) return
    assignDM.mutate(
      { orderId: selectedOrder.id, deliveryManId },
      { onSuccess: handleClose }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Atribuir Entregador</DialogTitle>
          <DialogDescription>
            Pedido #{selectedOrder?.trackingId?.substring(0, 8).toUpperCase()}
            {selectedOrder?.deliveryMan && (
              <>
                {' — Entregador atual: '}
                <strong>{selectedOrder.deliveryMan.name}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='dm-id'>ID do Entregador</Label>
            <Input
              id='dm-id'
              placeholder='Cole o ID do entregador'
              value={deliveryManId}
              onChange={(e) => setDeliveryManId(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>
              Em breve: seleção por lista de entregadores disponíveis.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!deliveryManId || assignDM.isPending}
          >
            {assignDM.isPending ? 'Atribuindo...' : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Order Detail Dialog ─────────────────────────────────────────────

export function OrderDetailDialog() {
  const { selectedOrder, dialogOpen, setDialogOpen, setSelectedOrder } =
    useOrdersContext()

  const isOpen = dialogOpen === 'detail' && !!selectedOrder

  function handleClose() {
    setDialogOpen(null)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  if (!selectedOrder) return null

  const statusInfo = ORDER_STATUS_LABELS[selectedOrder.status] ?? {
    label: selectedOrder.status,
    color: 'bg-gray-100 text-gray-800',
  }
  const paymentInfo = PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus] ?? {
    label: selectedOrder.paymentStatus,
    color: 'bg-gray-100 text-gray-800',
  }

  function formatCurrency(val: number | undefined | null) {
    if (val == null) return '-'
    return `R$ ${val.toFixed(2)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            Pedido #{selectedOrder.trackingId?.substring(0, 8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Criado em{' '}
            {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {/* Status & Payment */}
          <div className='flex flex-wrap gap-2'>
            <Badge className={`${statusInfo.color} border-0`}>
              {statusInfo.label}
            </Badge>
            <Badge className={`${paymentInfo.color} border-0`}>
              {paymentInfo.label}
            </Badge>
            <Badge variant='outline'>
              {ORDER_TYPE_LABELS[selectedOrder.orderType] ?? selectedOrder.orderType}
            </Badge>
            <Badge variant='outline'>
              {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] ??
                selectedOrder.paymentMethod}
            </Badge>
          </div>

          {/* Store & Customer */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-muted-foreground text-xs'>Loja</Label>
              <p className='text-sm font-medium'>
                {selectedOrder.store?.name ?? '-'}
              </p>
              {selectedOrder.store?.phone && (
                <p className='text-muted-foreground text-xs'>
                  {selectedOrder.store.phone}
                </p>
              )}
            </div>
            <div>
              <Label className='text-muted-foreground text-xs'>Cliente</Label>
              <p className='text-sm font-medium'>
                {selectedOrder.user?.name ?? 'Convidado'}
              </p>
              {selectedOrder.user?.phone && (
                <p className='text-muted-foreground text-xs'>
                  {selectedOrder.user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Man */}
          {selectedOrder.deliveryMan && (
            <div>
              <Label className='text-muted-foreground text-xs'>
                Entregador
              </Label>
              <p className='text-sm font-medium'>
                {selectedOrder.deliveryMan.name}
              </p>
              {selectedOrder.deliveryMan.phone && (
                <p className='text-muted-foreground text-xs'>
                  {selectedOrder.deliveryMan.phone}
                </p>
              )}
            </div>
          )}

          {/* Amounts */}
          {selectedOrder.amounts && (
            <div className='rounded-lg border p-3'>
              <Label className='text-muted-foreground mb-2 block text-xs'>
                Valores
              </Label>
              <div className='grid grid-cols-2 gap-1 text-sm'>
                <span>Subtotal:</span>
                <span className='text-right'>
                  {formatCurrency(selectedOrder.amounts.subtotal)}
                </span>
                <span>Taxa de entrega:</span>
                <span className='text-right'>
                  {formatCurrency(selectedOrder.amounts.deliveryFee)}
                </span>
                {selectedOrder.amounts.discount > 0 && (
                  <>
                    <span>Desconto:</span>
                    <span className='text-right text-red-600'>
                      -{formatCurrency(selectedOrder.amounts.discount)}
                    </span>
                  </>
                )}
                {selectedOrder.amounts.tax > 0 && (
                  <>
                    <span>Impostos:</span>
                    <span className='text-right'>
                      {formatCurrency(selectedOrder.amounts.tax)}
                    </span>
                  </>
                )}
                <span className='font-bold'>Total:</span>
                <span className='text-right font-bold'>
                  {formatCurrency(selectedOrder.amounts.total)}
                </span>
              </div>
            </div>
          )}

          {/* Note */}
          {selectedOrder.note && (
            <div>
              <Label className='text-muted-foreground text-xs'>
                Observação
              </Label>
              <p className='text-sm'>{selectedOrder.note}</p>
            </div>
          )}

          {/* Cancel reason */}
          {selectedOrder.cancelReason && (
            <div>
              <Label className='text-muted-foreground text-xs'>
                Motivo do cancelamento
              </Label>
              <p className='text-destructive text-sm'>
                {selectedOrder.cancelReason}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── All Dialogs ─────────────────────────────────────────────────────

export function OrdersDialogs() {
  return (
    <>
      <ChangeStatusDialog />
      <CancelOrderDialog />
      <AssignDeliveryManDialog />
      <OrderDetailDialog />
    </>
  )
}
