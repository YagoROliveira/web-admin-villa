import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  User,
  Store,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useOrder,
  useOrderDetail,
  useUpdateOrderStatus,
  useCancelOrder,
  useAddPaymentRef,
  useDeliveryManById,
} from '../hooks/use-orders'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_TYPE_LABELS,
  type Order,
} from '../data/schema'

const PHP_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['accepted', 'processing', 'handover', 'picked_up', 'delivered', 'canceled'],
  accepted: ['processing', 'handover', 'picked_up', 'delivered', 'canceled'],
  processing: ['handover', 'picked_up', 'delivered', 'canceled'],
  handover: ['picked_up', 'delivered', 'canceled'],
  picked_up: ['delivered', 'canceled'],
  item_on_the_way: ['delivered', 'canceled'],
  delivered: [],
  canceled: [],
  failed: [],
  requested: ['refunded', 'rejected'],
  refunded: [],
  rejected: [],
  scheduled: ['pending', 'canceled'],
}

const STATUS_TRANSITION_LABELS: Record<string, string> = {
  accepted: 'Aceito',
  processing: 'Em Preparo',
  handover: 'Pronto p/ Entrega',
  picked_up: 'Coletado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
  refunded: 'Reembolsado',
  rejected: 'Rejeitado',
  pending: 'Pendente',
}

function fmt(value: number | undefined | null) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function PaymentRefInline({ orderId }: { orderId: string }) {
  const addRef = useAddPaymentRef()
  const [editing, setEditing] = useState(false)
  const [code, setCode] = useState('')
  if (!editing) {
    return (
      <button
        className='rounded border border-dashed px-2 py-0.5 text-xs hover:bg-muted'
        onClick={() => setEditing(true)}
      >
        adicionar
      </button>
    )
  }
  return (
    <span className='flex items-center gap-1'>
      <input
        className='rounded border px-1.5 py-0.5 text-xs w-36 font-mono'
        maxLength={30}
        placeholder='Codigo...'
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
      />
      <button
        className='text-primary text-xs underline disabled:opacity-50'
        disabled={!code || addRef.isPending}
        onClick={() =>
          addRef.mutate({ orderId, transactionReference: code }, {
            onSuccess: () => { setEditing(false); setCode('') },
          })
        }
      >
        Salvar
      </button>
      <button className='text-muted-foreground text-xs' onClick={() => setEditing(false)}>x</button>
    </span>
  )
}

function StatusChangePanel({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const cancelOrder = useCancelOrder()
  const [selected, setSelected] = useState(order.order_status)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const transitions = STATUS_TRANSITIONS[order.order_status] ?? []
  if (transitions.length === 0) return null

  function handleChange() {
    if (!selected || selected === order.order_status) return
    if (selected === 'canceled') { setShowCancel(true); return }
    updateStatus.mutate({ orderId: String(order.id), orderStatus: selected })
  }

  return (
    <>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium'>Alterar Status do Pedido</CardTitle>
        </CardHeader>
        <CardContent className='flex gap-2'>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className='flex-1 text-sm'><SelectValue /></SelectTrigger>
            <SelectContent>
              {transitions.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_TRANSITION_LABELS[s] ?? s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size='sm'
            disabled={!selected || selected === order.order_status || updateStatus.isPending}
            onClick={handleChange}
          >
            {updateStatus.isPending ? '...' : 'Confirmar'}
          </Button>
        </CardContent>
      </Card>
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido #{order.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              <textarea
                className='mt-2 w-full rounded border p-2 text-sm'
                rows={3}
                placeholder='Motivo do cancelamento...'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground'
              onClick={() =>
                cancelOrder.mutate({ orderId: String(order.id), reason: cancelReason }, {
                  onSuccess: () => setShowCancel(false),
                })
              }
            >
              Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PersonCard({
  title,
  icon: Icon,
  name,
  count,
  phone,
  email,
  image,
}: {
  title: string
  icon: React.ElementType
  name?: string | null
  count?: number | null
  phone?: string | null
  email?: string | null
  image?: string | null
}) {
  const displayName = name || '—'
  return (
    <Card>
      <CardHeader className='pb-2 pt-4 px-4'>
        <CardTitle className='flex items-center gap-1.5 text-sm font-medium'>
          <Icon className='h-4 w-4' /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='flex items-start gap-3'>
          {image ? (
            <img src={image} alt={displayName} className='h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-border' />
          ) : (
            <div className='bg-muted text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-bold text-lg'>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 space-y-1'>
            <p className='truncate font-semibold text-sm'>{displayName}</p>
            {count != null && (
              <p className='text-muted-foreground text-xs flex items-center gap-1'>
                <span className='inline-block'>📦</span> {count} Pedidos
              </p>
            )}
            {phone && (
              <p className='text-muted-foreground text-xs flex items-center gap-1'>
                <span className='inline-block'>📞</span> {phone}
              </p>
            )}
            {email && (
              <p className='text-muted-foreground truncate text-xs flex items-center gap-1'>
                <span className='inline-block'>✉</span> {email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between py-1 text-sm'>
      <span className='text-muted-foreground shrink-0 pr-4'>{label}</span>
      <span className='text-right font-medium'>{children}</span>
    </div>
  )
}

function DeliveryManCard({
  deliveryMan,
  fallbackId,
}: {
  deliveryMan?: any
  fallbackId?: number | string | null
}) {
  const displayName = deliveryMan
    ? [deliveryMan.f_name, deliveryMan.l_name].filter(Boolean).join(' ') || deliveryMan.name || '—'
    : fallbackId
      ? 'Carregando...'
      : '—'
  const count = deliveryMan?.delivered_order ?? deliveryMan?.orders_count ?? deliveryMan?.order_count
  return (
    <Card>
      <CardHeader className='pb-2 pt-4 px-4'>
        <CardTitle className='flex items-center gap-1.5 text-sm font-medium'>
          <Truck className='h-4 w-4' /> Entregador
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='flex items-start gap-3'>
          {deliveryMan?.image ? (
            <img
              src={deliveryMan.image}
              alt={displayName}
              className='h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-border'
            />
          ) : (
            <div className='bg-muted text-muted-foreground flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-bold text-lg'>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className='min-w-0 space-y-1'>
            <p className='truncate font-semibold text-sm'>{displayName}</p>
            {count != null && (
              <p className='text-muted-foreground text-xs flex items-center gap-1'>
                <span>📦</span> {count} Pedidos Entregues
              </p>
            )}
            {deliveryMan?.phone && (
              <p className='text-muted-foreground text-xs flex items-center gap-1'>
                <span>📞</span> {deliveryMan.phone}
              </p>
            )}
            {deliveryMan?.email && (
              <p className='text-muted-foreground truncate text-xs flex items-center gap-1'>
                <span>✉</span> {deliveryMan.email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PageSkeleton() {
  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
      <div className='space-y-4'>
        <Skeleton className='h-40 w-full rounded-xl' />
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-32 w-full rounded-xl' />
      </div>
      <div className='space-y-4'>
        <Skeleton className='h-36 w-full rounded-xl' />
        <Skeleton className='h-36 w-full rounded-xl' />
        <Skeleton className='h-36 w-full rounded-xl' />
      </div>
    </div>
  )
}

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch, isFetching } = useOrder(orderId)
  const { data: detail, isLoading: detailLoading } = useOrderDetail(
    orderId,
    order?.store_id ? String(order.store_id) : undefined
  )
  const { data: fetchedDeliveryMan } = useDeliveryManById(
    !detail?.delivery_man && order?.delivery_man_id ? order.delivery_man_id : undefined
  )

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ProfileDropdown /></div>
        </Header>
        <Main><PageSkeleton /></Main>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ProfileDropdown /></div>
        </Header>
        <Main>
          <div className='flex min-h-[400px] flex-col items-center justify-center gap-4'>
            <AlertCircle className='text-destructive h-12 w-12' />
            <p className='text-destructive'>{error?.message || 'Pedido nao encontrado'}</p>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link to='/admin/orders' search={{ status: 'all' }}><ArrowLeft className='mr-2 h-4 w-4' />Voltar</Link>
              </Button>
              <Button variant='outline' onClick={() => refetch()}>
                <RefreshCw className='mr-2 h-4 w-4' />Tentar novamente
              </Button>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const statusInfo = ORDER_STATUS_LABELS[order.order_status] ?? { label: order.order_status, color: 'bg-gray-100 text-gray-800' }
  const paymentInfo = PAYMENT_STATUS_LABELS[order.payment_status] ?? { label: order.payment_status, color: 'bg-gray-100 text-gray-800' }
  const items = detail?.details ?? []

  const deliveryAddr: Record<string, string> | null = (() => {
    if (!order.delivery_address) return null
    if (typeof order.delivery_address === 'string') {
      try { return JSON.parse(order.delivery_address) } catch { return null }
    }
    return order.delivery_address as Record<string, string>
  })()

  const proofImages: Array<{ img: string; storage: string }> = (() => {
    if (!order.order_proof) return []
    const raw =
      typeof order.order_proof === 'string'
        ? (() => { try { return JSON.parse(order.order_proof) } catch { return [] } })()
        : order.order_proof
    return Array.isArray(raw) ? raw : []
  })()

  const productPrice =
    items.length > 0
      ? items.reduce((acc, item) => acc + Number(item.price ?? 0) * (item.quantity ?? 1), 0)
      : null
  const addonTotal =
    items.length > 0
      ? items.reduce((acc, item) => acc + Number(item.total_add_on_price ?? 0), 0)
      : null
  const storeDiscount =
    (order.store_discount_amount ?? 0) +
    (order.flash_store_discount_amount ?? 0) +
    (order.flash_admin_discount_amount ?? 0)
  const coupon = order.coupon_discount_amount ?? 0
  const refBonus = order.ref_bonus_amount ?? 0
  const tax = order.total_tax_amount ?? 0
  const delivery = order.delivery_charge ?? 0
  const tips = order.dm_tips ?? 0
  const packaging = order.extra_packaging_amount ?? order.extra_packaging_charge ?? 0
  const additionalCharge = order.additional_charge ?? 0
  const total = order.order_amount ?? 0

  const customer = detail?.customer
  const deliveryMan = detail?.delivery_man ?? fetchedDeliveryMan ?? null
  const store = detail?.store

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ProfileDropdown /></div>
      </Header>

      <Main>
        {/* Top bar */}
        <div className='mb-5 flex items-center gap-3'>
          <Button asChild variant='ghost' size='icon'>
            <Link to='/admin/orders' search={{ status: 'all' }}><ArrowLeft className='h-4 w-4' /></Link>
          </Button>
          <h2 className='flex-1 text-xl font-bold'>Detalhes Do Pedido</h2>
          <Button
            variant='ghost'
            size='icon'
            disabled={isFetching}
            onClick={() => refetch()}
            title='Atualizar'
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 2-column layout */}
        <div className='grid gap-5 xl:grid-cols-[1fr_300px]'>

          {/* LEFT COLUMN */}
          <div className='space-y-5'>

            {/* Header card */}
            <Card>
              <CardContent className='pt-5 pb-5'>
                {/* 2-column: order info | status grid + print */}
                <div className='flex flex-wrap items-start gap-4'>

                  {/* Left: order identity */}
                  <div className='min-w-[200px] flex-1'>
                    <h3 className='text-2xl font-bold tracking-tight'>Ordem #{order.id}</h3>
                    <p className='text-muted-foreground text-sm mt-1 flex items-center gap-1'>
                      <span>📅</span> {fmtDate(order.created_at)}
                    </p>
                    {(order.store_name ?? order.store?.name) && (
                      <div className='mt-2 flex items-center gap-2'>
                        <span className='text-muted-foreground text-sm'>🏪 loja :</span>
                        <Badge className='bg-cyan-500 hover:bg-cyan-600 text-white border-0 font-medium'>
                          {order.store_name ?? order.store?.name}
                        </Badge>
                      </div>
                    )}
                    {deliveryAddr?.address && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-3 gap-2 text-xs'
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${deliveryAddr.latitude ?? ''},${deliveryAddr.longitude ?? ''}`,
                            '_blank'
                          )
                        }
                      >
                        <MapPin className='h-3 w-3' /> Mostrar Locais No Mapa
                      </Button>
                    )}
                  </div>

                  {/* Right: print button at top, then status grid below */}
                  <div className='min-w-[260px] space-y-3'>
                    {/* Print button — top-right corner, above status */}
                    <div className='flex justify-end'>
                      <Button
                        size='default'
                        className='gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md'
                        onClick={() => window.open(`${PHP_BASE_URL}/order/generate-invoice/${orderId}`, '_blank')}
                      >
                        <Printer className='h-4 w-4' />
                        Imprima Fatura
                      </Button>
                    </div>

                    {/* Status info grid */}
                    <div className='space-y-0.5'>
                    <InfoRow label='Status :'>
                      <Badge className={`${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
                    </InfoRow>
                    <InfoRow label='Método De Pagamento :'>
                      {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                    </InfoRow>
                    <InfoRow label='Código De Referência :'>
                      {order.transaction_reference ? (
                        <span className='font-mono text-xs'>{order.transaction_reference}</span>
                      ) : (
                        <PaymentRefInline orderId={String(order.id)} />
                      )}
                    </InfoRow>
                    <InfoRow label='Tipo De Pedido :'>
                      <Badge variant='outline' className='text-primary border-primary'>
                        {ORDER_TYPE_LABELS[order.order_type] ?? order.order_type}
                      </Badge>
                    </InfoRow>
                    <InfoRow label='Status De Pagamento :'>
                      <Badge className={`${paymentInfo.color} border-0`}>{paymentInfo.label}</Badge>
                    </InfoRow>
                    {order.cutlery !== undefined && (
                      <InfoRow label='Talheres :'>
                        <Badge
                          className={
                            order.cutlery
                              ? 'bg-green-100 text-green-700 border-0'
                              : 'bg-red-100 text-red-700 border-0'
                          }
                        >
                          {order.cutlery ? 'Sim' : 'Não'}
                        </Badge>
                      </InfoRow>
                    )}
                    {order.schedule_at && (
                      <InfoRow label='Agendado Para :'>
                        <span className='text-xs'>{fmtDate(order.schedule_at)}</span>
                      </InfoRow>
                    )}
                    {order.coupon_code && (
                      <InfoRow label='Cupom :'>
                        <span className='font-mono text-xs'>{order.coupon_code}</span>
                      </InfoRow>
                    )}
                    {!!order.edited && (
                      <InfoRow label='Pedido :'>
                        <Badge variant='outline' className='border-blue-400 text-blue-600'>
                          <Edit3 className='mr-1 h-3 w-3' />Editado
                        </Badge>
                      </InfoRow>
                    )}
                    {order.cancellation_reason && (
                      <InfoRow label='Cancelamento :'>
                        <span className='text-xs text-red-600'>{order.cancellation_reason}</span>
                      </InfoRow>
                    )}
                    {order.delivery_instruction && (
                      <InfoRow label='Instrução :'>
                        <span className='text-xs'>{order.delivery_instruction}</span>
                      </InfoRow>
                    )}
                    {order.order_note && (
                      <InfoRow label='Nota :'>
                        <span className='text-xs'>{order.order_note}</span>
                      </InfoRow>
                    )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status change panel */}
            <StatusChangePanel order={order} />

            {/* Items table */}
            <Card>
              <CardContent className='p-0'>
                {detailLoading ? (
                  <div className='p-6 space-y-3'>
                    {[1, 2].map((i) => <Skeleton key={i} className='h-20 w-full rounded-lg' />)}
                  </div>
                ) : items.length > 0 ? (
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b bg-muted/40'>
                        <th className='px-4 py-2.5 text-center font-medium text-xs w-8'>#</th>
                        <th className='px-4 py-2.5 text-left font-medium text-xs'>Detalhes Do Item</th>
                        <th className='px-4 py-2.5 text-left font-medium text-xs'>Addons</th>
                        <th className='px-4 py-2.5 text-right font-medium text-xs'>Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const name = item.item_details?.name ?? item.food_details?.name ?? `Item #${idx + 1}`
                        const img = item.item_details?.image ?? item.food_details?.image
                        const qty = item.quantity ?? 1
                        const unitPrice = Number(item.price ?? 0)
                        const addonRowTotal = Number(item.total_add_on_price ?? 0)
                        const lineTotal = unitPrice * qty + addonRowTotal
                        const addons = item.add_ons ?? []
                        let variations: Array<{
                          name?: string
                          values?: Array<{ label?: string; optionPrice?: string | number }>
                        }> = []
                        try {
                          const raw =
                            typeof item.variation === 'string'
                              ? JSON.parse(item.variation)
                              : item.variation
                          if (Array.isArray(raw)) variations = raw
                        } catch { /* ignore */ }
                        return (
                          <tr key={String(item.id ?? idx)} className='border-b last:border-0'>
                            <td className='px-4 py-4 align-top text-center text-muted-foreground text-xs'>{idx + 1}</td>
                            <td className='px-4 py-4'>
                              <div className='flex gap-3'>
                                {img ? (
                                  <img
                                    src={img}
                                    alt={name}
                                    className='h-16 w-16 shrink-0 rounded-lg object-cover border'
                                  />
                                ) : (
                                  <div className='bg-muted h-16 w-16 shrink-0 rounded-lg' />
                                )}
                                <div className='min-w-0'>
                                  <p className='font-medium'>{name}</p>
                                  <p className='text-muted-foreground text-xs'>{qty} x {fmt(unitPrice)}</p>
                                  {variations.map((v, vi) => (
                                    <div key={vi} className='mt-1 text-xs'>
                                      <span className='font-semibold uppercase tracking-wide'>{v.name} -</span>
                                      {v.values?.map((val, vj) => (
                                        <div key={vj} className='ml-2 text-muted-foreground'>
                                          {val.label} : {fmt(Number(val.optionPrice ?? 0))}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                  {variations.length === 0 && item.variant && (
                                    <p className='mt-1 text-xs text-muted-foreground'>
                                      Variacao: {item.variant}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className='px-4 py-4 align-top'>
                              {addons.length > 0 ? (
                                <div className='space-y-1 text-xs'>
                                  {addons.map((addon, ai) => (
                                    <div key={ai}>
                                      <span className='font-semibold uppercase'>{addon.name} :</span>
                                      <span className='text-muted-foreground ml-1'>
                                        {fmt(Number(addon.price))}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className='text-muted-foreground text-xs'>—</span>
                              )}
                            </td>
                            <td className='px-4 py-4 text-right align-top font-semibold'>{fmt(lineTotal)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className='p-6 text-center text-sm text-muted-foreground space-y-2'>
                    <p>Itens do pedido não disponíveis via API.</p>
                    <button
                      className='text-primary text-xs underline'
                      onClick={() => window.open(`${PHP_BASE_URL}/order/generate-invoice/${orderId}`, '_blank')}
                    >
                      Ver fatura completa com itens →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial summary */}
            <Card>
              <CardContent className='pt-5'>
                <div className='ml-auto max-w-sm space-y-1.5 text-sm'>
                  {productPrice != null && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Preço dos itens:</span>
                      <span className='font-medium'>{fmt(productPrice)}</span>
                    </div>
                  )}
                  {addonTotal != null && addonTotal > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Custo do adicional:</span>
                      <span className='font-medium'>{fmt(addonTotal)}</span>
                    </div>
                  )}
                  {productPrice != null && (
                    <>
                      <Separator className='my-1' />
                      <div className='flex justify-between font-medium'>
                        <span>subtotal :</span>
                        <span>{fmt((productPrice ?? 0) + (addonTotal ?? 0))}</span>
                      </div>
                    </>
                  )}
                  {storeDiscount > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>desconto:</span>
                      <span className='text-green-600 font-medium'>- {fmt(storeDiscount)}</span>
                    </div>
                  )}
                  {coupon > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Cupom {order.coupon_code ? `(${order.coupon_code})` : ''}:
                      </span>
                      <span className='text-green-600 font-medium'>- {fmt(coupon)}</span>
                    </div>
                  )}
                  {refBonus > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Bônus de indicação:</span>
                      <span className='text-green-600 font-medium'>- {fmt(refBonus)}</span>
                    </div>
                  )}
                  {tax > 0 && order.tax_status !== 'included' && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>IVA/Taxa:</span>
                      <span className='font-medium'>+ {fmt(tax)}</span>
                    </div>
                  )}
                  {delivery > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Taxa de Entrega:</span>
                      <span className='font-medium'>+ {fmt(delivery)}</span>
                    </div>
                  )}
                  {tips > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Gorjeta do entregador:</span>
                      <span className='font-medium'>+ {fmt(tips)}</span>
                    </div>
                  )}
                  {additionalCharge > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Cobrança adicional:</span>
                      <span className='font-medium'>+ {fmt(additionalCharge)}</span>
                    </div>
                  )}
                  {packaging > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Embalagem extra:</span>
                      <span className='font-medium'>+ {fmt(packaging)}</span>
                    </div>
                  )}
                  <Separator className='my-1' />
                  <div className='flex justify-between text-base font-bold'>
                    <span>Total :</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className='space-y-4'>

            {(deliveryMan || order.delivery_man_id) && order.order_type !== 'take_away' && (
              <DeliveryManCard
                deliveryMan={deliveryMan}
                fallbackId={order.delivery_man_id}
              />
            )}

            {(() => {
              const loc = order.dm_last_location as any
              if (!loc) return null
              return (
                <Card>
                  <CardContent className='px-4 pt-3 pb-3'>
                    <p className='text-sm font-medium mb-1'>Última localização</p>
                    <a
                      href={`https://maps.google.com/?q=${loc.latitude ?? ''},${loc.longitude ?? ''}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary text-xs flex items-center gap-1 hover:underline'
                    >
                      <MapPin className='h-3 w-3' />
                      {loc.location ?? `${loc.latitude}, ${loc.longitude}`}
                    </a>
                  </CardContent>
                </Card>
              )
            })()}

            <PersonCard
              title='Informações Do Cliente'
              icon={User}
              name={
                customer
                  ? [customer.f_name, customer.l_name].filter(Boolean).join(' ') || customer.name
                  : order.customer_name
              }
              count={customer?.order_count}
              phone={customer?.phone ?? order.customer_phone}
              email={customer?.email ?? order.customer_email}
              image={customer?.image}
            />

            {deliveryAddr && (
              <Card>
                <CardHeader className='pb-2 pt-4 px-4'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-medium'>
                    <MapPin className='h-4 w-4' /> Informações De Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className='px-4 pb-4 space-y-1 text-sm'>
                  {deliveryAddr.contact_person_name && (
                    <div className='flex gap-2'>
                      <span className='text-muted-foreground w-16 shrink-0'>Name</span>
                      <span className='font-medium'>{deliveryAddr.contact_person_name}</span>
                    </div>
                  )}
                  {(deliveryAddr.contact_person_number ?? deliveryAddr.contact_person_phone) && (
                    <div className='flex gap-2'>
                      <span className='text-muted-foreground w-16 shrink-0'>contato</span>
                      <span className='font-medium'>
                        {deliveryAddr.contact_person_number ?? deliveryAddr.contact_person_phone}
                      </span>
                    </div>
                  )}
                  {deliveryAddr.address && (
                    <a
                      href={
                        deliveryAddr.latitude
                          ? `https://maps.google.com/?q=${deliveryAddr.latitude},${deliveryAddr.longitude}`
                          : undefined
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary text-xs flex items-start gap-1 mt-1 hover:underline'
                    >
                      <MapPin className='h-3 w-3 mt-0.5 shrink-0' />
                      {[deliveryAddr.address, deliveryAddr.road, deliveryAddr.city]
                        .filter(Boolean)
                        .join(', ')}
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className='pb-2 pt-4 px-4'>
                <CardTitle className='flex items-center justify-between text-sm font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <CheckCircle2 className='h-4 w-4' /> prova de entrega
                  </span>
                  <button className='text-xs text-primary underline'>adicionar</button>
                </CardTitle>
              </CardHeader>
              <CardContent className='px-4 pb-4'>
                {proofImages.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {proofImages.map((p, i) => (
                      <img
                        key={i}
                        src={p.img}
                        alt={`Prova ${i + 1}`}
                        className='h-16 w-16 rounded-lg object-cover border'
                      />
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-xs'>Nenhuma prova adicionada</p>
                )}
              </CardContent>
            </Card>

            <PersonCard
              title='Armazenar Informações'
              icon={Store}
              name={store?.name ?? order.store_name}
              count={store?.order_count}
              phone={store?.phone}
              email={store?.email}
              image={store?.logo ?? store?.image}
            />

          </div>
        </div>
      </Main>
    </>
  )
}
