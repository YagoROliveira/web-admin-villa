import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  Package,
  User,
  Store,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Receipt,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdateOrderAmounts,
  useUpdateOrderNote,
  useAssignDeliveryMan,
  useCancelOrder,
} from '../hooks/use-orders'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_TYPE_LABELS,
  type Order,
  type OrderAmounts,
} from '../data/schema'

// ─── Status transitions for the frontend ─────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(value: number | undefined | null) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatShortDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copiado!')
}

// ─── Main Detail Page ────────────────────────────────────────────────

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch, isFetching } = useOrder(orderId)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <OrderDetailSkeleton />
        </Main>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4'>
            <AlertCircle className='text-destructive h-12 w-12' />
            <p className='text-destructive'>
              Erro ao carregar pedido:{' '}
              {error?.message || 'Pedido não encontrado'}
            </p>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link to='/admin/orders'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Voltar
                </Link>
              </Button>
              <Button onClick={() => refetch()} variant='outline'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Tentar novamente
              </Button>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const statusInfo = ORDER_STATUS_LABELS[order.status] ?? {
    label: order.status,
    color: 'bg-gray-100 text-gray-800',
  }
  const paymentInfo = PAYMENT_STATUS_LABELS[order.paymentStatus] ?? {
    label: order.paymentStatus,
    color: 'bg-gray-100 text-gray-800',
  }
  const amounts = order.amounts as OrderAmounts | null
  const metadata = order.metadata as Record<string, unknown> | null

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back + Title + Actions */}
        <div className='mb-6 flex items-center gap-4'>
          <Button asChild variant='outline' size='icon'>
            <Link to='/admin/orders'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Pedido #{order.trackingId}
            </h2>
            <p className='text-muted-foreground text-sm'>
              Criado em {formatDate(order.createdAt)}
            </p>
          </div>
          <div className='flex gap-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => refetch()}
                    variant='outline'
                    size='icon'
                    disabled={isFetching}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atualizar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => window.print()}
                  >
                    <Printer className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Imprimir</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Header card with status badges */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-wrap items-center gap-3'>
              <Badge className={`${statusInfo.color} border-0 text-sm`}>
                {statusInfo.label}
              </Badge>
              <Badge className={`${paymentInfo.color} border-0 text-sm`}>
                {paymentInfo.label}
              </Badge>
              <Badge variant='outline'>
                {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
              </Badge>
              <Badge variant='outline'>
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                  order.paymentMethod}
              </Badge>
              {order.isScheduled && (
                <Badge
                  variant='outline'
                  className='border-orange-500 text-orange-600'
                >
                  <Clock className='mr-1 h-3 w-3' />
                  Agendado
                </Badge>
              )}
              <div className='ml-auto flex items-center gap-2'>
                <span className='text-muted-foreground text-xs'>ID:</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 px-2 font-mono text-xs'
                  onClick={() => copyToClipboard(order.id)}
                >
                  {order.id.substring(0, 8)}...
                  <Copy className='ml-1 h-3 w-3' />
                </Button>
              </div>
            </div>

            <Separator className='my-4' />

            {/* Quick info grid */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {/* Store */}
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                  <Store className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-xs'>Loja</p>
                  <p className='truncate text-sm font-medium'>
                    {order.store?.name ?? '-'}
                  </p>
                  {order.store?.phone && (
                    <p className='text-muted-foreground truncate text-xs'>
                      {order.store.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                  <User className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-xs'>Cliente</p>
                  <p className='truncate text-sm font-medium'>
                    {order.user?.name ?? 'Convidado'}
                  </p>
                  {order.user?.phone && (
                    <p className='text-muted-foreground truncate text-xs'>
                      {order.user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery man */}
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                  <Truck className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-xs'>Entregador</p>
                  <p className='truncate text-sm font-medium'>
                    {order.deliveryMan?.name ?? 'Não atribuído'}
                  </p>
                  {order.deliveryMan?.phone && (
                    <p className='text-muted-foreground truncate text-xs'>
                      {order.deliveryMan.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                  <CreditCard className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-xs'>Total</p>
                  <p className='text-lg font-bold'>
                    {formatCurrency(amounts?.total)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList>
            <TabsTrigger value='overview'>
              <Package className='mr-2 h-4 w-4' />
              Itens
            </TabsTrigger>
            <TabsTrigger value='amounts'>
              <Receipt className='mr-2 h-4 w-4' />
              Valores
            </TabsTrigger>
            <TabsTrigger value='status'>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Status
            </TabsTrigger>
            <TabsTrigger value='delivery'>
              <MapPin className='mr-2 h-4 w-4' />
              Entrega
            </TabsTrigger>
            <TabsTrigger value='payments'>
              <CreditCard className='mr-2 h-4 w-4' />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value='notes'>
              <MessageSquare className='mr-2 h-4 w-4' />
              Observações
            </TabsTrigger>
            {metadata && (
              <TabsTrigger value='metadata'>
                <FileText className='mr-2 h-4 w-4' />
                Metadados
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Items Tab ── */}
          <TabsContent value='overview'>
            <OrderItemsTab order={order} />
          </TabsContent>

          {/* ── Amounts Tab ── */}
          <TabsContent value='amounts'>
            <OrderAmountsTab order={order} />
          </TabsContent>

          {/* ── Status Tab ── */}
          <TabsContent value='status'>
            <OrderStatusTab order={order} />
          </TabsContent>

          {/* ── Delivery Tab ── */}
          <TabsContent value='delivery'>
            <OrderDeliveryTab order={order} />
          </TabsContent>

          {/* ── Payments Tab ── */}
          <TabsContent value='payments'>
            <OrderPaymentsTab order={order} />
          </TabsContent>

          {/* ── Notes Tab ── */}
          <TabsContent value='notes'>
            <OrderNotesTab order={order} />
          </TabsContent>

          {/* ── Metadata Tab ── */}
          {metadata && (
            <TabsContent value='metadata'>
              <OrderMetadataTab order={order} />
            </TabsContent>
          )}
        </Tabs>
      </Main>
    </>
  )
}

// ═══════════════════════════════════════════════
// ITEMS TAB
// ═══════════════════════════════════════════════

// ─── Variation / Addon types ──────────────────────────────────────────

interface VariationValue {
  label: string
  optionPrice?: string | number
}

interface VariationGroup {
  name: string
  type: 'single' | 'multi' | string
  values: VariationValue[]
  required?: string
  min?: string | number
  max?: string | number
}

function parseVariations(raw: unknown): VariationGroup[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as VariationGroup[]
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as VariationGroup[]
    } catch { /* ignore */ }
  }
  return []
}

// ─── Expandable variation display ─────────────────────────────────────

function ItemVariationBadges({
  groups,
  expanded,
  onToggle,
}: {
  groups: VariationGroup[]
  expanded: boolean
  onToggle: () => void
}) {
  if (groups.length === 0) return null

  // Collapsed: show summary chips
  if (!expanded) {
    return (
      <button
        type='button'
        onClick={onToggle}
        className='mt-1 flex flex-wrap items-center gap-1'
      >
        <ChevronRight className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
        {groups.map((g) => (
          <span
            key={g.name}
            className='bg-muted text-muted-foreground inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium'
          >
            {g.name}: {g.values.map((v) => v.label).join(', ')}
          </span>
        ))}
      </button>
    )
  }

  // Expanded: show full detail
  return (
    <div className='mt-1.5 space-y-2'>
      <button
        type='button'
        onClick={onToggle}
        className='text-muted-foreground flex items-center gap-1 text-xs hover:underline'
      >
        <ChevronDown className='h-3.5 w-3.5' />
        Ocultar detalhes
      </button>
      {groups.map((g) => (
        <div
          key={g.name}
          className='bg-muted/50 rounded-md border px-3 py-2'
        >
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold uppercase tracking-wide'>
              {g.name}
            </span>
            <Badge variant='outline' className='h-4 px-1 text-[10px]'>
              {g.type === 'single' ? 'Escolha única' : 'Múltipla'}
            </Badge>
            {g.required === 'on' && (
              <Badge
                variant='outline'
                className='h-4 border-orange-300 px-1 text-[10px] text-orange-600'
              >
                Obrigatório
              </Badge>
            )}
          </div>
          <div className='mt-1.5 flex flex-wrap gap-1.5'>
            {g.values.map((v, idx) => {
              const price = Number(v.optionPrice ?? 0)
              return (
                <span
                  key={`${v.label}-${idx}`}
                  className='bg-background inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs'
                >
                  <span className='font-medium'>{v.label}</span>
                  {price > 0 && (
                    <span className='text-muted-foreground'>
                      +{formatCurrency(price)}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function OrderItemsTab({ order }: { order: Order }) {
  const items = order.items ?? []
  const amounts = order.amounts as OrderAmounts | null
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const hasAnyVariation = items.some(
    (i) => parseVariations(i.variation).length > 0 || parseVariations(i.addons).length > 0
  )
  const allExpanded = hasAnyVariation && items.every((i) => expandedItems.has(i.id))

  function toggleItem(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allExpanded) {
      setExpandedItems(new Set())
    } else {
      setExpandedItems(new Set(items.map((i) => i.id)))
    }
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-lg'>
            Itens do Pedido ({items.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os itens incluídos neste pedido
          </CardDescription>
        </div>
        {hasAnyVariation && (
          <Button variant='outline' size='sm' onClick={toggleAll}>
            <ChevronsUpDown className='mr-2 h-4 w-4' />
            {allExpanded ? 'Recolher tudo' : 'Expandir tudo'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhum item registrado neste pedido.
          </p>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[60px]'></TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className='text-right'>Preço Unit.</TableHead>
                  <TableHead className='text-center'>Qtd</TableHead>
                  <TableHead className='text-right'>Desconto</TableHead>
                  <TableHead className='text-right'>Imposto</TableHead>
                  <TableHead className='text-right'>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const price = Number(item.price ?? 0)
                  const disc = Number(item.discount ?? 0)
                  const tax = Number(item.tax ?? 0)
                  const lineTotal = price * item.quantity - disc + tax
                  const variations = parseVariations(item.variation)
                  const addons = parseVariations(item.addons)
                  const isExpanded = expandedItems.has(item.id)
                  return (
                    <TableRow key={item.id} className='align-top'>
                      <TableCell>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className='h-10 w-10 rounded object-cover'
                          />
                        ) : (
                          <div className='bg-muted flex h-10 w-10 items-center justify-center rounded text-xs font-bold'>
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{item.name}</p>
                          {variations.length > 0 && (
                            <ItemVariationBadges
                              groups={variations}
                              expanded={isExpanded}
                              onToggle={() => toggleItem(item.id)}
                            />
                          )}
                          {addons.length > 0 && (
                            <>
                              {variations.length === 0 && !isExpanded && (
                                <button
                                  type='button'
                                  onClick={() => toggleItem(item.id)}
                                  className='mt-1 flex items-center gap-1'
                                >
                                  <ChevronRight className='text-muted-foreground h-3.5 w-3.5' />
                                  <span className='bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-medium'>
                                    {addons.length} complemento(s)
                                  </span>
                                </button>
                              )}
                              {isExpanded && (
                                <div className='mt-1.5 space-y-2'>
                                  <span className='text-muted-foreground text-[11px] font-semibold uppercase'>
                                    Complementos
                                  </span>
                                  {addons.map((g) => (
                                    <div
                                      key={g.name}
                                      className='bg-muted/50 rounded-md border px-3 py-2'
                                    >
                                      <span className='text-xs font-semibold uppercase tracking-wide'>
                                        {g.name}
                                      </span>
                                      <div className='mt-1.5 flex flex-wrap gap-1.5'>
                                        {g.values.map((v, idx) => {
                                          const p = Number(v.optionPrice ?? 0)
                                          return (
                                            <span
                                              key={`${v.label}-${idx}`}
                                              className='bg-background inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs'
                                            >
                                              <span className='font-medium'>
                                                {v.label}
                                              </span>
                                              {p > 0 && (
                                                <span className='text-muted-foreground'>
                                                  +{formatCurrency(p)}
                                                </span>
                                              )}
                                            </span>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item.quantity}
                      </TableCell>
                      <TableCell className='text-right'>
                        {disc > 0 ? (
                          <span className='text-red-600'>
                            -{formatCurrency(disc)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {tax > 0 ? formatCurrency(tax) : '-'}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(lineTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Totals summary */}
        {amounts && (
          <>
            <Separator className='my-4' />
            <div className='ml-auto w-full max-w-xs space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{formatCurrency(amounts.subtotal)}</span>
              </div>
              {amounts.deliveryFee > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Taxa de entrega
                  </span>
                  <span>{formatCurrency(amounts.deliveryFee)}</span>
                </div>
              )}
              {amounts.tax > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Impostos</span>
                  <span>{formatCurrency(amounts.tax)}</span>
                </div>
              )}
              {amounts.discount > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Desconto</span>
                  <span className='text-red-600'>
                    -{formatCurrency(amounts.discount)}
                  </span>
                </div>
              )}
              {amounts.couponDiscount > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Cupom</span>
                  <span className='text-red-600'>
                    -{formatCurrency(amounts.couponDiscount)}
                  </span>
                </div>
              )}
              {(amounts.tips ?? 0) > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Gorjeta</span>
                  <span>{formatCurrency(amounts.tips)}</span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between text-base font-bold'>
                <span>Total</span>
                <span>{formatCurrency(amounts.total)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════
// AMOUNTS TAB (editable)
// ═══════════════════════════════════════════════

function OrderAmountsTab({ order }: { order: Order }) {
  const amounts = (order.amounts ?? {}) as OrderAmounts
  const updateAmounts = useUpdateOrderAmounts()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    subtotal: amounts.subtotal ?? 0,
    tax: amounts.tax ?? 0,
    deliveryFee: amounts.deliveryFee ?? 0,
    discount: amounts.discount ?? 0,
    couponDiscount: amounts.couponDiscount ?? 0,
    tips: amounts.tips ?? 0,
    extraPackaging: amounts.extraPackaging ?? 0,
  })

  const calculatedTotal =
    form.subtotal +
    form.tax +
    form.deliveryFee -
    form.discount -
    form.couponDiscount +
    form.tips +
    form.extraPackaging

  function handleSave() {
    updateAmounts.mutate(
      {
        orderId: order.id,
        amounts: { ...form, total: Math.round(calculatedTotal * 100) / 100 },
      },
      {
        onSuccess: () => setEditing(false),
      }
    )
  }

  const isTerminal = ['DELIVERED', 'CANCELED', 'FAILED', 'REFUNDED'].includes(
    order.status
  )

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-lg'>Valores do Pedido</CardTitle>
          <CardDescription>
            Visualize e edite os valores financeiros do pedido
          </CardDescription>
        </div>
        {!isTerminal && !editing && (
          <Button variant='outline' size='sm' onClick={() => setEditing(true)}>
            <Edit3 className='mr-2 h-4 w-4' />
            Editar
          </Button>
        )}
        {editing && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditing(false)}
            >
              <X className='mr-2 h-4 w-4' />
              Cancelar
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={updateAmounts.isPending}
            >
              <Save className='mr-2 h-4 w-4' />
              {updateAmounts.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 sm:grid-cols-2'>
          <AmountField
            label='Subtotal'
            value={editing ? form.subtotal : (amounts.subtotal ?? 0)}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, subtotal: v }))}
          />
          <AmountField
            label='Taxa de Entrega'
            value={editing ? form.deliveryFee : (amounts.deliveryFee ?? 0)}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, deliveryFee: v }))}
          />
          <AmountField
            label='Impostos'
            value={editing ? form.tax : (amounts.tax ?? 0)}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, tax: v }))}
          />
          <AmountField
            label='Desconto'
            value={editing ? form.discount : (amounts.discount ?? 0)}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, discount: v }))}
            negative
          />
          <AmountField
            label='Desconto de Cupom'
            value={
              editing ? form.couponDiscount : (amounts.couponDiscount ?? 0)
            }
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, couponDiscount: v }))}
            negative
          />
          <AmountField
            label='Gorjeta'
            value={editing ? form.tips : (amounts.tips ?? 0)}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, tips: v }))}
          />
          <AmountField
            label='Embalagem Extra'
            value={
              editing ? form.extraPackaging : (amounts.extraPackaging ?? 0)
            }
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, extraPackaging: v }))}
          />
        </div>

        <Separator className='my-4' />

        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold'>Total</span>
          <span className='text-2xl font-bold'>
            {formatCurrency(editing ? calculatedTotal : (amounts.total ?? 0))}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function AmountField({
  label,
  value,
  editing,
  onChange,
  negative,
}: {
  label: string
  value: number
  editing: boolean
  onChange: (v: number) => void
  negative?: boolean
}) {
  if (!editing) {
    return (
      <div className='space-y-1'>
        <Label className='text-muted-foreground text-xs'>{label}</Label>
        <p className={`text-sm font-medium ${negative && value > 0 ? 'text-red-600' : ''}`}>
          {negative && value > 0 ? '-' : ''}
          {formatCurrency(value)}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-1'>
      <Label className='text-xs'>{label}</Label>
      <CurrencyInput
        value={value}
        onChange={(v) => onChange(v ?? 0)}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════
// STATUS TAB
// ═══════════════════════════════════════════════

function OrderStatusTab({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const cancelOrder = useCancelOrder()
  const [newStatus, setNewStatus] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const allowedStatuses = STATUS_TRANSITIONS[order.status] ?? []
  const metadata = order.metadata as Record<string, unknown> | null
  const timestamps = (metadata?.timestamps as Record<string, string | null>) ?? {}

  function handleUpdateStatus() {
    if (!newStatus) return
    if (newStatus === 'CANCELED') {
      setShowCancelDialog(true)
      return
    }
    updateStatus.mutate(
      { orderId: order.id, status: newStatus },
      { onSuccess: () => setNewStatus('') }
    )
  }

  function handleCancel() {
    cancelOrder.mutate(
      { orderId: order.id, reason: cancelReason },
      {
        onSuccess: () => {
          setShowCancelDialog(false)
          setCancelReason('')
          setNewStatus('')
        },
      }
    )
  }

  // Status timeline
  const statusTimeline = [
    { key: 'pending', label: 'Pendente', time: timestamps.pending || order.createdAt },
    { key: 'confirmed', label: 'Confirmado', time: timestamps.confirmed },
    { key: 'processing', label: 'Preparando', time: timestamps.processing },
    { key: 'handover', label: 'Pronto', time: timestamps.handover },
    { key: 'pickedUp', label: 'Retirado', time: timestamps.pickedUp },
    { key: 'delivered', label: 'Entregue', time: timestamps.delivered },
  ]

  const cancelledAt = timestamps.canceled
  const refundedAt = timestamps.refunded

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Linha do Tempo</CardTitle>
          <CardDescription>
            Histórico de status do pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className='relative border-l border-gray-200 dark:border-gray-700'>
            {statusTimeline.map((step, idx) => {
              const isDone = !!step.time
              const isCurrent =
                step.key.toUpperCase() === order.status.toLowerCase() ||
                (step.key === 'pickedUp' && order.status === 'PICKED_UP')
              return (
                <li key={step.key} className='mb-6 ml-6'>
                  <span
                    className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className='h-3 w-3' />
                    ) : (
                      <span className='text-[10px]'>{idx + 1}</span>
                    )}
                  </span>
                  <div className='flex items-center gap-2'>
                    <h3
                      className={`text-sm font-medium ${isCurrent ? 'text-primary' : isDone ? '' : 'text-muted-foreground'}`}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <Badge variant='default' className='text-[10px]'>
                        Atual
                      </Badge>
                    )}
                  </div>
                  {step.time && (
                    <time className='text-muted-foreground text-xs'>
                      {formatDate(step.time as string)}
                    </time>
                  )}
                </li>
              )
            })}

            {/* Canceled */}
            {(order.status === 'CANCELED' || cancelledAt) && (
              <li className='mb-6 ml-6'>
                <span className='absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white ring-4 ring-white dark:ring-gray-900'>
                  <XCircle className='h-3 w-3' />
                </span>
                <h3 className='text-sm font-medium text-red-600'>Cancelado</h3>
                {cancelledAt && (
                  <time className='text-muted-foreground text-xs'>
                    {formatDate(cancelledAt as string)}
                  </time>
                )}
                {order.cancelReason && (
                  <p className='text-destructive mt-1 text-xs'>
                    Motivo: {order.cancelReason}
                  </p>
                )}
              </li>
            )}

            {/* Refunded */}
            {(order.status === 'REFUNDED' || refundedAt) && (
              <li className='mb-6 ml-6'>
                <span className='absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-white dark:ring-gray-900'>
                  <AlertCircle className='h-3 w-3' />
                </span>
                <h3 className='text-sm font-medium text-amber-600'>
                  Reembolsado
                </h3>
                {refundedAt && (
                  <time className='text-muted-foreground text-xs'>
                    {formatDate(refundedAt as string)}
                  </time>
                )}
              </li>
            )}
          </ol>
        </CardContent>
      </Card>

      {/* Change Status */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Alterar Status</CardTitle>
          <CardDescription>
            Status atual:{' '}
            <Badge
              className={`${ORDER_STATUS_LABELS[order.status]?.color ?? ''} border-0`}
            >
              {ORDER_STATUS_LABELS[order.status]?.label ?? order.status}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allowedStatuses.length > 0 ? (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Novo Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
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
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatus.isPending}
                className='w-full'
              >
                {updateStatus.isPending
                  ? 'Atualizando...'
                  : 'Confirmar Alteração'}
              </Button>
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              Este pedido está em um status final. Não há transições disponíveis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o pedido #{order.trackingId}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <Label htmlFor='cancel-reason'>Motivo do cancelamento</Label>
            <Textarea
              id='cancel-reason'
              placeholder='Informe o motivo...'
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className='mt-2'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ═══════════════════════════════════════════════
// DELIVERY TAB
// ═══════════════════════════════════════════════

function OrderDeliveryTab({ order }: { order: Order }) {
  const assignDM = useAssignDeliveryMan()
  const [dmId, setDmId] = useState('')
  const deliveryAddress = order.deliveryAddress as Record<string, string | number | null> | null

  function handleAssign() {
    if (!dmId) return
    assignDM.mutate(
      { orderId: order.id, deliveryManId: dmId },
      { onSuccess: () => setDmId('') }
    )
  }

  const isTerminal = ['DELIVERED', 'CANCELED', 'FAILED', 'REFUNDED'].includes(
    order.status
  )

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            <MapPin className='mr-2 inline h-5 w-5' />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveryAddress ? (
            <div className='space-y-2 text-sm'>
              {deliveryAddress.address && (
                <p className='font-medium'>
                  {String(deliveryAddress.address)}
                </p>
              )}
              {deliveryAddress.road && (
                <p>{String(deliveryAddress.road)}</p>
              )}
              {deliveryAddress.floor && (
                <p>Andar/Apto: {String(deliveryAddress.floor)}</p>
              )}
              {deliveryAddress.house && (
                <p>Casa/Bloco: {String(deliveryAddress.house)}</p>
              )}
              {(deliveryAddress.latitude || deliveryAddress.longitude) && (
                <p className='text-muted-foreground text-xs'>
                  Lat: {String(deliveryAddress.latitude)}, Lng:{' '}
                  {String(deliveryAddress.longitude)}
                </p>
              )}
              {deliveryAddress.contact_person_name && (
                <div className='mt-3 border-t pt-3'>
                  <p className='text-muted-foreground text-xs'>
                    Contato na entrega
                  </p>
                  <p className='font-medium'>
                    {String(deliveryAddress.contact_person_name)}
                  </p>
                  {deliveryAddress.contact_person_number && (
                    <p className='text-muted-foreground'>
                      {String(deliveryAddress.contact_person_number)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              {order.orderType === 'TAKEAWAY'
                ? 'Pedido para retirada — sem endereço de entrega.'
                : 'Endereço não disponível.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delivery Man Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            <Truck className='mr-2 inline h-5 w-5' />
            Entregador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.deliveryMan ? (
            <div className='mb-4 flex items-center gap-3'>
              {order.deliveryMan.avatarUrl ? (
                <img
                  src={order.deliveryMan.avatarUrl}
                  alt={order.deliveryMan.name}
                  className='h-12 w-12 rounded-full object-cover'
                />
              ) : (
                <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold'>
                  {order.deliveryMan.name.charAt(0)}
                </div>
              )}
              <div>
                <p className='font-medium'>{order.deliveryMan.name}</p>
                {order.deliveryMan.phone && (
                  <p className='text-muted-foreground text-sm'>
                    {order.deliveryMan.phone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground mb-4 text-sm'>
              Nenhum entregador atribuído.
            </p>
          )}

          {!isTerminal && (
            <div className='space-y-3'>
              <Separator />
              <Label>
                {order.deliveryMan
                  ? 'Reatribuir entregador'
                  : 'Atribuir entregador'}
              </Label>
              <div className='flex gap-2'>
                <Input
                  placeholder='ID do entregador'
                  value={dmId}
                  onChange={(e) => setDmId(e.target.value)}
                />
                <Button
                  onClick={handleAssign}
                  disabled={!dmId || assignDM.isPending}
                >
                  {assignDM.isPending ? 'Atribuindo...' : 'Atribuir'}
                </Button>
              </div>
              <p className='text-muted-foreground text-xs'>
                Em breve: seleção por lista de entregadores disponíveis.
              </p>
            </div>
          )}

          {order.otp && (
            <>
              <Separator className='my-4' />
              <div>
                <Label className='text-muted-foreground text-xs'>
                  Código OTP de entrega
                </Label>
                <p className='font-mono text-2xl font-bold tracking-widest'>
                  {order.otp}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════
// PAYMENTS TAB
// ═══════════════════════════════════════════════

function OrderPaymentsTab({ order }: { order: Order }) {
  const payments = order.payments ?? []
  const transaction = order.transaction as Record<string, unknown> | null

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Pagamentos</CardTitle>
          <CardDescription>
            Registros de pagamento deste pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              Nenhum pagamento registrado.
            </p>
          ) : (
            <div className='space-y-3'>
              {payments.map((p) => (
                <div
                  key={p.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <p className='text-sm font-medium'>
                      {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {formatShortDate(p.createdAt)}
                    </p>
                    {p.transactionId && (
                      <p className='font-mono text-xs'>
                        TX: {p.transactionId}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {formatCurrency(Number(p.amount))}
                    </p>
                    <Badge
                      className={`${PAYMENT_STATUS_LABELS[p.status]?.color ?? 'bg-gray-100 text-gray-800'} border-0 text-xs`}
                    >
                      {PAYMENT_STATUS_LABELS[p.status]?.label ?? p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction (financial split) */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Transação Financeira</CardTitle>
          <CardDescription>
            Divisão de valores entre admin, loja e entregador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transaction ? (
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Valor do Pedido
                </span>
                <span className='font-medium'>
                  {formatCurrency(Number(transaction.orderAmount))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Comissão Admin
                </span>
                <span className='font-medium'>
                  {formatCurrency(Number(transaction.adminCommission))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Valor Loja</span>
                <span className='font-medium'>
                  {formatCurrency(Number(transaction.storeAmount))}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Entrega (Admin)
                </span>
                <span>
                  {formatCurrency(Number(transaction.deliveryFeeAdmin))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Entrega (Motoboy)
                </span>
                <span>
                  {formatCurrency(Number(transaction.deliveryFeeDM))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Impostos</span>
                <span>{formatCurrency(Number(transaction.tax))}</span>
              </div>
              {Number(transaction.dmTips) > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Gorjeta Motoboy
                  </span>
                  <span>{formatCurrency(Number(transaction.dmTips))}</span>
                </div>
              )}
              {Boolean(transaction.isRefunded) && (
                <div className='mt-2'>
                  <Badge variant='destructive'>Reembolsado</Badge>
                </div>
              )}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              Transação financeira ainda não gerada. Será criada quando o
              pedido for entregue.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════
// NOTES TAB
// ═══════════════════════════════════════════════

function OrderNotesTab({ order }: { order: Order }) {
  const updateNote = useUpdateOrderNote()
  const [editing, setEditing] = useState(false)
  const [noteText, setNoteText] = useState(order.note ?? '')

  function handleSave() {
    updateNote.mutate(
      { orderId: order.id, note: noteText },
      { onSuccess: () => setEditing(false) }
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-lg'>Observações</CardTitle>
          <CardDescription>
            Notas e observações do pedido
          </CardDescription>
        </div>
        {!editing && (
          <Button variant='outline' size='sm' onClick={() => setEditing(true)}>
            <Edit3 className='mr-2 h-4 w-4' />
            Editar
          </Button>
        )}
        {editing && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditing(false)
                setNoteText(order.note ?? '')
              }}
            >
              <X className='mr-2 h-4 w-4' />
              Cancelar
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={updateNote.isPending}
            >
              <Save className='mr-2 h-4 w-4' />
              {updateNote.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder='Adicione observações sobre o pedido...'
            rows={5}
          />
        ) : (
          <div className='space-y-4'>
            {order.note ? (
              <div className='rounded-lg border p-4'>
                <p className='whitespace-pre-wrap text-sm'>{order.note}</p>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Nenhuma observação adicionada.
              </p>
            )}

            {order.cancelReason && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20'>
                <p className='text-destructive mb-1 text-xs font-medium uppercase'>
                  Motivo do Cancelamento
                </p>
                <p className='text-sm'>{order.cancelReason}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════
// METADATA TAB
// ═══════════════════════════════════════════════

function OrderMetadataTab({ order }: { order: Order }) {
  const metadata = order.metadata as Record<string, unknown> | null

  if (!metadata) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Metadados do Pedido</CardTitle>
        <CardDescription>
          Dados adicionais do sistema legado e informações internas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
          <pre className='overflow-auto whitespace-pre-wrap text-xs'>
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════

function OrderDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-10 w-10' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48' />
        </div>
      </div>
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-10 w-96' />
      <Skeleton className='h-64 w-full' />
    </div>
  )
}
