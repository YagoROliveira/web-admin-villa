import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Save, Send, Info, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { storePaymentService } from '../services/store-payment-service'
import { paymentBatchService } from '../services/payment-batch-service'
import { formatMoney } from '../utils/format'
import type { PaymentItem, PaymentItemType, PeriodType } from '../types'
import type { CreatePaymentBatchRequest } from '../types/payment-batch'

interface CreatePaymentBatchProps {
  storeId: number
  storeName: string
  onBack: () => void
  onSuccess: (batchId: number) => void
}

export function CreatePaymentBatch({
  storeId,
  storeName,
  onBack,
  onSuccess,
}: CreatePaymentBatchProps) {
  const [period, setPeriod] = useState<PeriodType>('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [items, setItems] = useState<Omit<PaymentItem, 'id' | 'created_at'>[]>([])
  const [notes, setNotes] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(false)

  const queryClient = useQueryClient()

  // Buscar pedidos do período
  const loadOrdersFromPeriod = async () => {
    if (!startDate || !endDate) {
      alert('Preencha as datas de início e fim')
      return
    }

    setLoadingOrders(true)
    try {
      console.log('[CreatePaymentBatch] Loading orders with dates:', { startDate, endDate, period })
      const ordersData = await storePaymentService.getOrdersWithCosts({
        store_id: storeId,
        period,
        start_date: startDate,
        end_date: endDate,
      })

      const orderItems: Omit<PaymentItem, 'id' | 'created_at'>[] = ordersData.orders.map(
        (order) => {
          // Parse todos os valores
          const orderAmount = typeof order.order_amount === 'string' ? parseFloat(order.order_amount) : order.order_amount
          const couponDiscount = typeof order.coupon_discount_amount === 'string' ? parseFloat(order.coupon_discount_amount) : (order.coupon_discount_amount || 0)
          const storeDiscount = typeof order.store_discount_amount === 'string' ? parseFloat(order.store_discount_amount) : (order.store_discount_amount || 0)
          const flashAdminDiscount = typeof order.flash_admin_discount_amount === 'string' ? parseFloat(order.flash_admin_discount_amount) : (order.flash_admin_discount_amount || 0)
          const flashStoreDiscount = typeof order.flash_store_discount_amount === 'string' ? parseFloat(order.flash_store_discount_amount) : (order.flash_store_discount_amount || 0)
          const deliveryCharge = typeof order.delivery_charge === 'string' ? parseFloat(order.delivery_charge) : (order.delivery_charge || 0)
          const originalDeliveryCharge = typeof order.original_delivery_charge === 'string' ? parseFloat(order.original_delivery_charge) : (order.original_delivery_charge || 0)
          const totalTax = typeof order.total_tax_amount === 'string' ? parseFloat(order.total_tax_amount) : (order.total_tax_amount || 0)
          const dmTips = typeof order.dm_tips === 'string' ? parseFloat(order.dm_tips) : (order.dm_tips || 0)
          const additionalCharge = typeof order.additional_charge === 'string' ? parseFloat(order.additional_charge) : (order.additional_charge || 0)
          const extraPackaging = typeof order.extra_packaging_amount === 'string' ? parseFloat(order.extra_packaging_amount) : (order.extra_packaging_amount || 0)

          const totalDiscounts = couponDiscount + storeDiscount + flashAdminDiscount + flashStoreDiscount
          const finalAmount = orderAmount - totalDiscounts

          // Montar descrição com cupom se houver
          let description = `Pedido #${order.id || order.order_id}`
          if (order.coupon_code && couponDiscount > 0) {
            description += ` | Cupom: ${order.coupon_code}`
          }

          // Informações legíveis para observações
          const readableNotes = `Cliente: ${order.customer_name || 'N/A'} | Status: ${order.order_status} | Pgto: ${order.payment_method}`

          return {
            type: 'order' as PaymentItemType,
            reference_id: String(order.id || order.order_id),
            description: description,
            amount: finalAmount,
            notes: JSON.stringify({
              readable: readableNotes,
              customer_name: order.customer_name || 'N/A',
              order_status: order.order_status,
              payment_method: order.payment_method,
              payment_status: order.payment_status,
              breakdown: {
                order_amount: orderAmount,
                delivery_charge: deliveryCharge,
                original_delivery_charge: originalDeliveryCharge,
                total_tax_amount: totalTax,
                coupon_discount: couponDiscount,
                store_discount: storeDiscount,
                flash_admin_discount: flashAdminDiscount,
                flash_store_discount: flashStoreDiscount,
                dm_tips: dmTips,
                additional_charge: additionalCharge,
                extra_packaging_amount: extraPackaging,
                total_discounts: totalDiscounts,
                final_amount: finalAmount,
              }
            }),
          }
        }
      )

      setItems(orderItems)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Mutation para criar lote
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentBatchRequest) =>
      paymentBatchService.createPaymentBatch(storeId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches', storeId] })
      onSuccess(data.id!)
    },
  })

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        type: 'adjustment',
        description: '',
        amount: 0,
        notes: '',
      },
    ])
  }

  const handleAddCouponAdjustment = (index: number) => {
    const item = items[index]

    // Verificar se já existe um ajuste de cupom para este pedido
    const pedidoRef = item.reference_id
    const alreadyHasAdjustment = items.some(
      (i) => i.type === 'adjustment' && i.notes?.includes(`Pedido #${pedidoRef}`)
    )

    if (alreadyHasAdjustment) {
      alert('Já existe um ajuste de cupom para este pedido')
      return
    }

    // Extrair informações do cupom do metadata
    try {
      const metadata = JSON.parse(item.notes || '{}')
      const couponDiscount = metadata.breakdown?.coupon_discount || 0

      if (couponDiscount <= 0) {
        alert('Este pedido não tem desconto de cupom')
        return
      }

      // Extrair código do cupom da descrição
      const couponCodeMatch = item.description.match(/Cupom: ([A-Za-z0-9]+)/)
      const couponCode = couponCodeMatch ? couponCodeMatch[1] : 'CUPOM'

      // Criar linha de ajuste
      const adjustmentItem: Omit<PaymentItem, 'id' | 'created_at'> = {
        type: 'adjustment',
        reference_id: couponCode,
        description: `Ressarcimento Cupom ${couponCode}`,
        amount: couponDiscount,
        notes: `Ressarcimento de cupom da plataforma - Pedido #${item.reference_id}`,
      }

      // Inserir logo após o item atual
      const newItems = [...items]
      newItems.splice(index + 1, 0, adjustmentItem)
      setItems(newItems)
    } catch (error) {
      console.error('Erro ao adicionar ajuste de cupom:', error)
      alert('Erro ao processar informações do cupom')
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (
    index: number,
    field: keyof Omit<PaymentItem, 'id' | 'created_at'>,
    value: any
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  const handleSave = () => {
    if (!startDate || !endDate || items.length === 0) {
      alert('Preencha todos os campos obrigatórios: datas e items')
      return
    }

    console.log('[CreatePaymentBatch] Saving batch:', {
      period_type: period,
      start_date: startDate,
      end_date: endDate,
      items_count: items.length,
      total_amount: totalAmount,
    })

    createMutation.mutate({
      store_id: storeId,
      period_type: period,
      start_date: startDate,
      end_date: endDate,
      items,
      notes,
    })
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={onBack}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div className='flex-1'>
          <h2 className='text-2xl font-bold'>Novo Lote de Pagamento</h2>
          <p className='text-muted-foreground'>{storeName}</p>
        </div>
        <Button onClick={handleSave} disabled={createMutation.isPending} className='gap-2'>
          <Save className='h-4 w-4' />
          Salvar Rascunho
        </Button>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Apuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-end gap-3 flex-wrap'>
            <div className='min-w-[180px]'>
              <Label className='mb-2 block'>Tipo de Período</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Diário</SelectItem>
                  <SelectItem value='weekly'>Semanal</SelectItem>
                  <SelectItem value='biweekly'>Quinzenal</SelectItem>
                  <SelectItem value='monthly'>Mensal</SelectItem>
                  <SelectItem value='annual'>Anual</SelectItem>
                  <SelectItem value='custom'>Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='w-[160px]'>
              <Label className='mb-2 block'>Data Início</Label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className='w-[160px]'>
              <Label className='mb-2 block'>Data Fim</Label>
              <Input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <Button onClick={loadOrdersFromPeriod} disabled={loadingOrders} variant='outline' className='ml-auto'>
              {loadingOrders ? 'Carregando...' : 'Carregar Pedidos do Período'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Items do Pagamento ({items.length})</CardTitle>
          <Button onClick={handleAddItem} size='sm' variant='outline' className='gap-2'>
            <Plus className='h-4 w-4' />
            Adicionar Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className='w-[50px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                    Nenhum item adicionado. Carregue os pedidos ou adicione items manualmente.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.type}
                        onValueChange={(v) => handleUpdateItem(index, 'type', v)}
                      >
                        <SelectTrigger className='w-[140px]'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='order'>Pedido</SelectItem>
                          <SelectItem value='adjustment'>Ajuste</SelectItem>
                          <SelectItem value='bonus'>Bônus</SelectItem>
                          <SelectItem value='discount'>Desconto</SelectItem>
                          <SelectItem value='other'>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.reference_id || ''}
                        onChange={(e) => handleUpdateItem(index, 'reference_id', e.target.value)}
                        placeholder='#123'
                        disabled={item.type === 'order'}
                        className='w-[100px]'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        placeholder='Descrição'
                        disabled={item.type === 'order'}
                      />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        {item.type === 'order' && item.notes && (() => {
                          try {
                            const metadata = JSON.parse(item.notes)
                            if (metadata.breakdown) {
                              // Verificar se já tem ajuste de cupom para este pedido
                              const pedidoRef = item.reference_id
                              const hasAdjustment = items.some(
                                (i) => i.type === 'adjustment' && i.notes?.includes(`Pedido #${pedidoRef}`)
                              )

                              return (
                                <>
                                  {/* Botão de adicionar ressarcimento de cupom */}
                                  {metadata.breakdown.coupon_discount > 0 && !hasAdjustment && (
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8'
                                      onClick={() => handleAddCouponAdjustment(index)}
                                      title='Adicionar ressarcimento de cupom da plataforma'
                                    >
                                      <DollarSign className='h-4 w-4 text-green-600 dark:text-green-400' />
                                    </Button>
                                  )}

                                  {/* Botão de detalhamento */}
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                                        <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                      <div className='space-y-2'>
                                        <h4 className='font-semibold text-sm'>Detalhamento Completo do Pedido</h4>
                                        <div className='space-y-1 text-sm'>
                                          <div className='flex justify-between font-semibold text-blue-600 dark:text-blue-400'>
                                            <span>Valor do Pedido:</span>
                                            <span>{formatMoney(metadata.breakdown.order_amount)}</span>
                                          </div>

                                          {metadata.breakdown.delivery_charge > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Taxa de Entrega:</span>
                                              <span className='font-medium'>{formatMoney(metadata.breakdown.delivery_charge)}</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.original_delivery_charge > 0 && metadata.breakdown.original_delivery_charge !== metadata.breakdown.delivery_charge && (
                                            <div className='flex justify-between text-xs text-muted-foreground'>
                                              <span>(Taxa Original:</span>
                                              <span>{formatMoney(metadata.breakdown.original_delivery_charge)})</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.total_tax_amount > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Impostos:</span>
                                              <span className='font-medium'>{formatMoney(metadata.breakdown.total_tax_amount)}</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.additional_charge > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Taxas Adicionais:</span>
                                              <span className='font-medium'>{formatMoney(metadata.breakdown.additional_charge)}</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.extra_packaging_amount > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Embalagem Extra:</span>
                                              <span className='font-medium'>{formatMoney(metadata.breakdown.extra_packaging_amount)}</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.dm_tips > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Gorjeta Entregador:</span>
                                              <span className='font-medium'>{formatMoney(metadata.breakdown.dm_tips)}</span>
                                            </div>
                                          )}

                                          {metadata.breakdown.total_discounts > 0 && (
                                            <div className='border-t pt-2 mt-2 space-y-1'>
                                              <div className='font-semibold text-xs text-muted-foreground mb-1'>Descontos:</div>
                                              {metadata.breakdown.coupon_discount > 0 && (
                                                <div className='flex justify-between text-red-600 dark:text-red-400'>
                                                  <span>• Cupom:</span>
                                                  <span>-{formatMoney(metadata.breakdown.coupon_discount)}</span>
                                                </div>
                                              )}
                                              {metadata.breakdown.store_discount > 0 && (
                                                <div className='flex justify-between text-red-600 dark:text-red-400'>
                                                  <span>• Loja:</span>
                                                  <span>-{formatMoney(metadata.breakdown.store_discount)}</span>
                                                </div>
                                              )}
                                              {metadata.breakdown.flash_admin_discount > 0 && (
                                                <div className='flex justify-between text-red-600 dark:text-red-400'>
                                                  <span>• Flash Admin:</span>
                                                  <span>-{formatMoney(metadata.breakdown.flash_admin_discount)}</span>
                                                </div>
                                              )}
                                              {metadata.breakdown.flash_store_discount > 0 && (
                                                <div className='flex justify-between text-red-600 dark:text-red-400'>
                                                  <span>• Flash Loja:</span>
                                                  <span>-{formatMoney(metadata.breakdown.flash_store_discount)}</span>
                                                </div>
                                              )}
                                              <div className='flex justify-between font-semibold text-red-600 dark:text-red-400 pt-1 border-t'>
                                                <span>Total Descontos:</span>
                                                <span>-{formatMoney(metadata.breakdown.total_discounts)}</span>
                                              </div>
                                            </div>
                                          )}

                                          <div className='flex justify-between border-t-2 pt-2 mt-2 font-bold text-green-600 dark:text-green-400 text-base'>
                                            <span>Valor a Receber:</span>
                                            <span>{formatMoney(metadata.breakdown.final_amount)}</span>
                                          </div>

                                          <div className='border-t pt-2 mt-2 text-xs text-muted-foreground space-y-0.5'>
                                            <div>Cliente: {metadata.customer_name}</div>
                                            <div>Status: {metadata.order_status}</div>
                                            <div>Pagamento: {metadata.payment_method} ({metadata.payment_status})</div>
                                          </div>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </>
                              )
                            }
                          } catch (e) {
                            return null
                          }
                          return null
                        })()}

                        <div className='relative w-[140px]'>
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'>
                            R$
                          </span>
                          <Input
                            type='text'
                            value={item.amount.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.')
                              handleUpdateItem(index, 'amount', parseFloat(value) || 0)
                            }}
                            className='text-right pl-10 font-semibold'
                            disabled={item.type === 'order'}
                            placeholder='0,00'
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={(() => {
                          if (item.type === 'order' && item.notes) {
                            try {
                              const metadata = JSON.parse(item.notes)
                              return metadata.readable || item.notes
                            } catch (e) {
                              return item.notes || ''
                            }
                          }
                          return item.notes || ''
                        })()}
                        onChange={(e) => handleUpdateItem(index, 'notes', e.target.value)}
                        placeholder='Observações'
                        disabled={item.type === 'order'}
                        className='font-mono text-xs'
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Total */}
          {items.length > 0 && (
            <div className='mt-4 flex justify-end'>
              <Card className='w-64'>
                <CardContent className='pt-4'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>Total:</span>
                    <span className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                      {formatMoney(totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Observações sobre este lote de pagamento...'
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  )
}
