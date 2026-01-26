import { ArrowLeft, User, MapPin, DollarSign, Package, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { OrderWithCosts } from './types'
import { formatMoney, formatNumber, formatPaymentMethod } from './utils/format'

interface OrderDetailsProps {
  order: OrderWithCosts
  onBack: () => void
}

export function OrderDetails({ order, onBack }: OrderDetailsProps) {
  // Parse do delivery_address se vier como string JSON
  const parseDeliveryAddress = () => {
    if (!order.delivery_address) return {}
    if (typeof order.delivery_address === 'string') {
      try {
        return JSON.parse(order.delivery_address)
      } catch {
        return {}
      }
    }
    return order.delivery_address
  }

  const deliveryAddress = parseDeliveryAddress()
  const customerName = deliveryAddress.contact_person_name || order.customer_name || 'N/A'
  const customerPhone = deliveryAddress.contact_person_number || order.customer_phone || 'N/A'
  const customerEmail = deliveryAddress.contact_person_email || 'N/A'

  // Formatar endereço completo
  const fullAddress = [
    deliveryAddress.address,
    deliveryAddress.road,
    deliveryAddress.house,
    deliveryAddress.floor && `Andar ${deliveryAddress.floor}`,
  ].filter(Boolean).join(', ') || 'N/A'

  const formatDate = (date: any): string => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(date)
    }
  }

  // Calcular valores financeiros
  const orderAmount = typeof order.order_amount === 'string'
    ? parseFloat(order.order_amount)
    : order.order_amount || 0

  const couponDiscount = parseFloat(order.coupon_discount_amount as any) || 0
  const storeDiscount = parseFloat(order.store_discount_amount as any) || 0
  const flashDiscount = parseFloat(order.flash_store_discount_amount as any) || 0
  const flashAdminDiscount = parseFloat(order.flash_admin_discount_amount as any) || 0
  const totalDiscounts = order.total_discounts || (couponDiscount + storeDiscount + flashDiscount + flashAdminDiscount)
  const totalTax = parseFloat(order.total_tax_amount as any) || 0
  const deliveryCharge = parseFloat(order.delivery_charge as any) || 0
  const originalDeliveryCharge = parseFloat(order.original_delivery_charge as any) || 0
  const platformCommission = parseFloat(order.platform_commission_amount as any) || 0
  const cardFee = parseFloat(order.card_fee_amount as any) || 0
  const netAmount = order.net_amount || (orderAmount - totalDiscounts - totalTax)

  // Tradução de status
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'accepted': 'Aceito',
      'confirmed': 'Confirmado',
      'processing': 'Processando',
      'handover': 'Pronto para Entrega',
      'picked_up': 'Saiu para Entrega',
      'delivered': 'Entregue',
      'canceled': 'Cancelado',
      'failed': 'Falhou',
      'paid': 'Pago',
      'unpaid': 'Não Pago',
      'refunded': 'Reembolsado',
      'delivery': 'Entrega',
      'take_away': 'Retirada',
    }
    return statusMap[status?.toLowerCase()] || status || 'N/A'
  }

  // Status com cores
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'paid': { label: 'Pago', variant: 'default' },
      'pending': { label: 'Pendente', variant: 'secondary' },
      'failed': { label: 'Falhou', variant: 'destructive' },
      'completed': { label: 'Concluído', variant: 'default' },
      'delivered': { label: 'Entregue', variant: 'default' },
      'canceled': { label: 'Cancelado', variant: 'destructive' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' },
      'processing': { label: 'Processando', variant: 'secondary' },
      'accepted': { label: 'Aceito', variant: 'secondary' },
      'confirmed': { label: 'Confirmado', variant: 'secondary' },
      'handover': { label: 'Pronto', variant: 'secondary' },
      'picked_up': { label: 'Saiu p/ Entrega', variant: 'secondary' },
      'unpaid': { label: 'Não Pago', variant: 'destructive' },
    }
    const config = statusMap[statusLower] || { label: translateStatus(status), variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Pedido #{order.id || order.order_id}
            </h1>
            <p className='text-muted-foreground'>
              Cliente: {customerName}
            </p>
          </div>
        </div>
        <div className='text-right'>
          {getStatusBadge(order.payment_status)}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Package className='h-4 w-4' />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatMoney(orderAmount)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Valor bruto do pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Descontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              - {formatMoney(totalDiscounts)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Total de descontos aplicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Taxas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              - {formatMoney(totalTax)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Impostos e taxas
            </p>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Valor Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatMoney(netAmount)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Valor a repassar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhes */}
      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='general' className='gap-2'>
            <Package className='h-4 w-4' />
            <span className='hidden sm:inline'>Geral</span>
          </TabsTrigger>
          <TabsTrigger value='customer' className='gap-2'>
            <User className='h-4 w-4' />
            <span className='hidden sm:inline'>Cliente</span>
          </TabsTrigger>
          <TabsTrigger value='delivery' className='gap-2'>
            <MapPin className='h-4 w-4' />
            <span className='hidden sm:inline'>Entrega</span>
          </TabsTrigger>
          <TabsTrigger value='financial' className='gap-2'>
            <DollarSign className='h-4 w-4' />
            <span className='hidden sm:inline'>Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value='timeline' className='gap-2'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>Histórico</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>ID do Pedido</p>
                    <p className='text-lg font-semibold'>#{order.id || order.order_id}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Tipo de Pedido</p>
                    <p className='font-medium capitalize'>{translateStatus(order.order_type || 'N/A')}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Status do Pedido</p>
                    {getStatusBadge(order.order_status || 'N/A')}
                  </div>
                  {order.otp && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Código OTP</p>
                      <p className='text-lg font-mono font-bold text-primary'>{order.otp}</p>
                    </div>
                  )}
                </div>

                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Loja</p>
                    <p className='text-lg font-semibold'>{order.store_name || 'N/A'}</p>
                    <p className='text-sm text-muted-foreground'>ID: {order.store_id}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Data do Pedido</p>
                    <p className='font-medium'>{formatDate(order.created_at)}</p>
                  </div>
                  {order.schedule_at && order.schedule_at !== order.created_at && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Agendado Para</p>
                      <p className='font-medium'>{formatDate(order.schedule_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {order.order_note && (
                <>
                  <Separator className='my-4' />
                  <div>
                    <p className='text-sm text-muted-foreground mb-2'>Observações do Cliente</p>
                    <p className='text-sm bg-muted p-3 rounded-md'>{order.order_note}</p>
                  </div>
                </>
              )}

              {order.cancellation_note && (
                <>
                  <Separator className='my-4' />
                  <div>
                    <p className='text-sm text-muted-foreground mb-2'>Motivo do Cancelamento</p>
                    <p className='text-sm bg-destructive/10 text-destructive p-3 rounded-md border border-destructive'>
                      {order.cancellation_note}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Status</p>
                  <div className='mt-2'>{getStatusBadge(order.payment_status)}</div>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Método de Pagamento</p>
                  <p className='font-medium mt-2 capitalize'>
                    {formatPaymentMethod(order.payment_method)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>ID do Usuário</p>
                  <p className='font-medium mt-2'>#{order.user_id}</p>
                </div>
              </div>

              {order.transaction_reference && (
                <>
                  <Separator className='my-4' />
                  <div>
                    <p className='text-sm text-muted-foreground mb-2'>Referência da Transação</p>
                    <p className='text-sm font-mono bg-muted p-3 rounded-md break-all'>
                      {order.transaction_reference}
                    </p>
                  </div>
                </>
              )}

              {(order.coupon_code || order.coupon_discount_title) && (
                <>
                  <Separator className='my-4' />
                  <div className='bg-green-50 dark:bg-green-950/20 p-4 rounded-md border border-green-200'>
                    <p className='text-sm font-semibold text-green-900 dark:text-green-100 mb-2'>
                      Cupom Aplicado
                    </p>
                    {order.coupon_code && (
                      <p className='font-mono font-bold text-green-700 dark:text-green-300'>
                        {order.coupon_code}
                      </p>
                    )}
                    {order.coupon_discount_title && (
                      <p className='text-sm text-green-600 dark:text-green-400 mt-1'>
                        {order.coupon_discount_title}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Cliente */}
        <TabsContent value='customer' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Nome Completo</p>
                    <p className='text-lg font-semibold'>{customerName}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Telefone de Contato</p>
                    <p className='font-medium text-lg'>{customerPhone}</p>
                  </div>
                  {customerEmail !== 'N/A' && (
                    <div>
                      <p className='text-sm text-muted-foreground'>E-mail</p>
                      <p className='font-medium'>{customerEmail}</p>
                    </div>
                  )}
                </div>

                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>ID do Cliente</p>
                    <p className='font-medium'>#{order.user_id}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Tipo de Endereço</p>
                    <Badge variant='outline' className='capitalize'>
                      {deliveryAddress.address_type || 'N/A'}
                    </Badge>
                  </div>
                  {order.is_guest === 1 && (
                    <div>
                      <Badge variant='secondary'>Cliente Convidado</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Entrega */}
        <TabsContent value='delivery' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Endereço Completo</p>
                  <p className='text-lg font-medium mt-1'>{fullAddress}</p>
                </div>

                <Separator />

                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Rua</p>
                    <p className='font-medium'>{deliveryAddress.road || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Número/Casa</p>
                    <p className='font-medium'>{deliveryAddress.house || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Andar/Complemento</p>
                    <p className='font-medium'>{deliveryAddress.floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Tipo</p>
                    <Badge variant='outline' className='capitalize'>
                      {deliveryAddress.address_type || 'N/A'}
                    </Badge>
                  </div>
                </div>

                {(deliveryAddress.latitude || deliveryAddress.longitude) && (
                  <>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground mb-2'>Coordenadas GPS</p>
                      <div className='grid gap-2 md:grid-cols-2'>
                        <div className='bg-muted p-3 rounded-md'>
                          <p className='text-xs text-muted-foreground'>Latitude</p>
                          <p className='font-mono text-sm'>{deliveryAddress.latitude}</p>
                        </div>
                        <div className='bg-muted p-3 rounded-md'>
                          <p className='text-xs text-muted-foreground'>Longitude</p>
                          <p className='font-mono text-sm'>{deliveryAddress.longitude}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className='grid gap-4 md:grid-cols-3'>
                  {order.distance !== undefined && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Distância</p>
                      <p className='font-medium'>{formatNumber(order.distance, 2)} km</p>
                    </div>
                  )}
                  {deliveryCharge > 0 && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Taxa de Entrega</p>
                      <p className='font-medium'>{formatMoney(deliveryCharge)}</p>
                    </div>
                  )}
                  {order.free_delivery_by && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Entrega Grátis por</p>
                      <Badge variant='secondary' className='capitalize'>{order.free_delivery_by}</Badge>
                    </div>
                  )}
                </div>

                {order.delivery_man_id && (
                  <>
                    <Separator />
                    <div className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md'>
                      <p className='text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                        Informações do Entregador
                      </p>
                      <div className='grid gap-2 md:grid-cols-2'>
                        <div>
                          <p className='text-xs text-muted-foreground'>ID do Entregador</p>
                          <p className='font-medium'>#{order.delivery_man_id}</p>
                        </div>
                        {order.dm_vehicle_id && (
                          <div>
                            <p className='text-xs text-muted-foreground'>Veículo</p>
                            <p className='font-medium'>#{order.dm_vehicle_id}</p>
                          </div>
                        )}
                        {order.dm_tips && order.dm_tips > 0 && (
                          <div>
                            <p className='text-xs text-muted-foreground'>Gorjeta</p>
                            <p className='font-medium text-green-600'>{formatMoney(order.dm_tips)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Financeiro */}
        <TabsContent value='financial' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center pb-2'>
                  <span className='font-medium'>Valor do Pedido</span>
                  <span className='text-lg font-bold text-green-600'>{formatMoney(orderAmount)}</span>
                </div>

                <Separator />

                <div className='space-y-2 py-2'>
                  <p className='text-sm font-semibold text-muted-foreground'>Descontos</p>
                  {couponDiscount > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Cupom de Desconto</span>
                      <span className='font-semibold text-red-600'>- {formatMoney(couponDiscount)}</span>
                    </div>
                  )}
                  {storeDiscount > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Desconto da Loja</span>
                      <span className='font-semibold text-red-600'>- {formatMoney(storeDiscount)}</span>
                    </div>
                  )}
                  {flashDiscount > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Desconto Flash (Loja)</span>
                      <span className='font-semibold text-red-600'>- {formatMoney(flashDiscount)}</span>
                    </div>
                  )}
                  {flashAdminDiscount > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Desconto Flash (Admin)</span>
                      <span className='font-semibold text-red-600'>- {formatMoney(flashAdminDiscount)}</span>
                    </div>
                  )}
                  {totalDiscounts > 0 && (
                    <div className='flex justify-between items-center pl-4 pt-1 border-t'>
                      <span className='text-sm font-medium'>Total de Descontos</span>
                      <span className='font-bold text-red-600'>- {formatMoney(totalDiscounts)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className='space-y-2 py-2'>
                  <p className='text-sm font-semibold text-muted-foreground'>Taxas e Comissões</p>
                  {totalTax > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Taxa de Impostos</span>
                      <span className='font-semibold text-orange-600'>- {formatMoney(totalTax)}</span>
                    </div>
                  )}
                  {platformCommission > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Comissão da Plataforma</span>
                      <span className='font-semibold text-orange-600'>- {formatMoney(platformCommission)}</span>
                    </div>
                  )}
                  {cardFee > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Taxa do Cartão</span>
                      <span className='font-semibold text-orange-600'>- {formatMoney(cardFee)}</span>
                    </div>
                  )}
                  {deliveryCharge > 0 && (
                    <div className='flex justify-between items-center pl-4'>
                      <span className='text-sm'>Taxa de Entrega</span>
                      <span className='font-semibold text-orange-600'>{formatMoney(deliveryCharge)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className='flex justify-between items-center pt-2 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg'>
                  <span className='text-lg font-bold'>Valor Líquido</span>
                  <span className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{formatMoney(netAmount)}</span>
                </div>

                <div className='grid gap-3 mt-4'>
                  {order.store_commission_rate && (
                    <div className='p-3 bg-muted rounded-md'>
                      <p className='text-xs text-muted-foreground'>Taxa de Comissão da Loja</p>
                      <p className='font-semibold'>{order.store_commission_rate}%</p>
                    </div>
                  )}
                  {originalDeliveryCharge > 0 && originalDeliveryCharge !== deliveryCharge && (
                    <div className='p-3 bg-muted rounded-md'>
                      <p className='text-xs text-muted-foreground'>Taxa de Entrega Original</p>
                      <p className='font-semibold'>{formatMoney(originalDeliveryCharge)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Histórico */}
        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Linha do Tempo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Pedido Criado */}
                {order.created_at && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      </div>
                      {(order.pending || order.accepted || order.confirmed || order.processing || order.handover || order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Pedido Criado</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.created_at)}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Pedido #{order.id} foi criado no sistema
                      </p>
                    </div>
                  </div>
                )}

                {/* Pendente */}
                {order.pending && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center'>
                        <Calendar className='h-5 w-5 text-yellow-600' />
                      </div>
                      {(order.accepted || order.confirmed || order.processing || order.handover || order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Aguardando Confirmação</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.pending)}</p>
                    </div>
                  </div>
                )}

                {/* Confirmado */}
                {order.confirmed && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center'>
                        <FileText className='h-5 w-5 text-purple-600' />
                      </div>
                      {(order.accepted || order.processing || order.handover || order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Pedido Confirmado</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.confirmed)}</p>
                    </div>
                  </div>
                )}

                {/* Aceito */}
                {order.accepted && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-green-600' />
                      </div>
                      {(order.processing || order.handover || order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Aceito pela Loja</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.accepted)}</p>
                    </div>
                  </div>
                )}

                {/* Processando */}
                {order.processing && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-orange-600' />
                      </div>
                      {(order.handover || order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Em Preparação</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.processing)}</p>
                      {order.processing_time && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Tempo estimado: {order.processing_time} min
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Pronto para Entrega */}
                {order.handover && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-teal-600' />
                      </div>
                      {(order.picked_up || order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Pronto para Entrega</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.handover)}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Aguardando retirada pelo entregador
                      </p>
                    </div>
                  </div>
                )}

                {/* Saiu para Entrega */}
                {order.picked_up && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center'>
                        <MapPin className='h-5 w-5 text-indigo-600' />
                      </div>
                      {(order.delivered || order.canceled) && (
                        <div className='w-px h-full bg-border mt-2' />
                      )}
                    </div>
                    <div className='flex-1 pb-8'>
                      <p className='font-semibold'>Saiu para Entrega</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.picked_up)}</p>
                      {order.delivery_man_id && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Entregador #{order.delivery_man_id}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Entregue */}
                {order.delivered && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-green-600' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-green-600'>Pedido Entregue</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.delivered)}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Pedido concluído com sucesso
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancelado */}
                {order.canceled && (
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center'>
                        <Package className='h-5 w-5 text-red-600' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-red-600'>Pedido Cancelado</p>
                      <p className='text-sm text-muted-foreground'>{formatDate(order.canceled)}</p>
                      {order.canceled_by && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Cancelado por: {order.canceled_by}
                        </p>
                      )}
                      {order.cancellation_reason && order.cancellation_reason !== 'null' && (
                        <p className='text-xs text-red-600 mt-1'>
                          Motivo: {order.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status de Pagamento */}
                {order.payment_status && (
                  <>
                    <Separator className='my-4' />
                    <div className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${order.payment_status === 'paid'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-orange-100 dark:bg-orange-900'
                          }`}>
                          <DollarSign className={`h-5 w-5 ${order.payment_status === 'paid'
                            ? 'text-green-600'
                            : 'text-orange-600'
                            }`} />
                        </div>
                      </div>
                      <div className='flex-1'>
                        <p className='font-semibold'>Status de Pagamento</p>
                        <div className='mt-2'>{getStatusBadge(order.payment_status)}</div>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Método: {formatPaymentMethod(order.payment_method)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
