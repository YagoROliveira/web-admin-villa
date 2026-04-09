import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Percent,
  Phone,
  Power,
  Star,
  Store,
  Tag,
  Truck,
  Users,
  XCircle,
  ShoppingCart,
  Banknote,
  Settings2,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useStore,
  useToggleStoreActive,
  useToggleStoreApproved,
  useToggleStoreFeatured,
  useStoreSchedules,
  useAddStoreSchedule,
  useDeleteStoreSchedule,
  useUpdateStoreDiscount,
  useStoreOrders,
  useStoreWithdraws,
  useUpdateWithdrawStatus,
} from '../hooks/use-stores'

// ─── Types ───────────────────────────────────────────────────────────

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const scheduleFormSchema = z.object({
  day: z.coerce.number().min(0).max(6),
  opening_time: z.string().min(1, 'Obrigatório'),
  closing_time: z.string().min(1, 'Obrigatório'),
})

const discountFormSchema = z.object({
  discount: z.coerce.number().min(0, 'Obrigatório'),
  discount_type: z.enum(['percent', 'amount']),
  min_purchase: z.coerce.number().min(0).optional(),
  max_discount: z.coerce.number().min(0).optional(),
  start_date: z.string().min(1, 'Obrigatório'),
  end_date: z.string().min(1, 'Obrigatório'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
})

// ─── Helpers ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className='flex items-start justify-between py-2 text-sm'>
      <span className='text-muted-foreground min-w-[140px]'>{label}</span>
      <span className='text-right font-medium'>{value ?? '—'}</span>
    </div>
  )
}

function StatusBadge({ active, activeLabel = 'Ativo', inactiveLabel = 'Inativo' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <Badge variant={active ? 'default' : 'secondary'} className='gap-1'>
      {active ? <CheckCircle2 className='h-3 w-3' /> : <XCircle className='h-3 w-3' />}
      {active ? activeLabel : inactiveLabel}
    </Badge>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-primary' }: { icon: React.ElementType; label: string; value?: number | null; color?: string }) {
  return (
    <Card>
      <CardContent className='p-4 flex items-center gap-3'>
        <div className={`rounded-lg bg-primary/10 p-2 ${color}`}>
          <Icon className='h-5 w-5' />
        </div>
        <div>
          <p className='text-muted-foreground text-xs'>{label}</p>
          <p className='text-2xl font-bold'>{value ?? '—'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────

function OverviewTab({ storeId }: { storeId: string }) {
  const { data: store, isLoading } = useStore(storeId)
  const toggleActive = useToggleStoreActive()
  const toggleApproved = useToggleStoreApproved()
  const toggleFeatured = useToggleStoreFeatured()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    )
  }
  if (!store) return <p className='text-muted-foreground text-sm'>Loja não encontrada.</p>

  const features = store.features as Record<string, any> | null

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={ShoppingCart} label='Total de Pedidos' value={store.totalOrders ?? store._count?.orders} />
        <StatCard icon={Package} label='Itens Cadastrados' value={store._count?.items} color='text-blue-500' />
        <StatCard icon={Star} label='Avaliação Média' value={store.avgRating ?? undefined} color='text-yellow-500' />
        <StatCard icon={Users} label='Avaliações' value={store.totalReviews ?? store._count?.reviews} color='text-purple-500' />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Informações Gerais */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Store className='h-4 w-4' /> Informações da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className='divide-y'>
            <InfoRow label='Nome' value={store.name} />
            <InfoRow label='Endereço' value={store.address} />
            <InfoRow label='Telefone' value={store.phone} />
            <InfoRow label='E-mail' value={store.email} />
            <InfoRow label='Módulo' value={store.module?.name} />
            <InfoRow label='Zona' value={store.zone?.displayName || store.zone?.name} />
            <InfoRow label='Pedido mínimo' value={store.minOrder != null ? `R$ ${Number(store.minOrder).toFixed(2)}` : null} />
            <InfoRow label='Comissão' value={store.commissionRate != null ? `${store.commissionRate}%` : null} />
            <InfoRow label='Imposto' value={store.taxRate != null ? `${store.taxRate}%` : null} />
            {store.latitude && store.longitude && (
              <div className='py-2'>
                <a
                  href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-sm text-blue-500 hover:underline'
                >
                  <MapPin className='h-3.5 w-3.5' /> Ver no mapa
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lojista */}
        <div className='space-y-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Users className='h-4 w-4' /> Lojista
              </CardTitle>
            </CardHeader>
            <CardContent className='divide-y'>
              <InfoRow label='Nome' value={store.vendor?.name} />
              <InfoRow label='E-mail' value={store.vendor?.email} />
              <InfoRow label='Telefone' value={store.vendor?.phone} />
            </CardContent>
          </Card>

          {/* Status & Toggles */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Settings2 className='h-4 w-4' /> Status
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-medium'>Ativa</Label>
                  <p className='text-muted-foreground text-xs'>Loja visível para clientes</p>
                </div>
                <Switch
                  checked={store.isActive}
                  disabled={toggleActive.isPending}
                  onCheckedChange={() => toggleActive.mutate({ id: store.id, value: !store.isActive })}
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-medium'>Aprovada</Label>
                  <p className='text-muted-foreground text-xs'>Aprovação pela plataforma</p>
                </div>
                <Switch
                  checked={store.isApproved}
                  disabled={toggleApproved.isPending}
                  onCheckedChange={() => toggleApproved.mutate({ id: store.id, value: !store.isApproved })}
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-medium'>Destaque</Label>
                  <p className='text-muted-foreground text-xs'>Aparecer como destaque</p>
                </div>
                <Switch
                  checked={store.isFeatured}
                  disabled={toggleFeatured.isPending}
                  onCheckedChange={() => toggleFeatured.mutate({ id: store.id, value: !store.isFeatured })}
                />
              </div>

              {features && (
                <>
                  <Separator />
                  <div className='space-y-2 pt-1'>
                    {[
                      { key: 'selfDelivery', label: 'Entrega Própria' },
                      { key: 'freeDelivery', label: 'Entrega Grátis' },
                      { key: 'posSystem', label: 'Sistema POS' },
                      { key: 'veg', label: 'Aceita Vegetariano' },
                      { key: 'nonVeg', label: 'Aceita Não-Vegetariano' },
                    ].map(({ key, label }) => (
                      features[key] != null && (
                        <div key={key} className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>{label}</span>
                          <StatusBadge
                            active={!!features[key]}
                            activeLabel='Sim'
                            inactiveLabel='Não'
                          />
                        </div>
                      )
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discount info */}
      {store.discount && (
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Tag className='h-4 w-4' /> Desconto Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className='grid gap-2 sm:grid-cols-3'>
            <InfoRow
              label='Desconto'
              value={store.discount.type === 'percent'
                ? `${store.discount.discount}%`
                : `R$ ${Number(store.discount.discount).toFixed(2)}`}
            />
            <InfoRow
              label='Compra mínima'
              value={store.discount.minPurchase ? `R$ ${Number(store.discount.minPurchase).toFixed(2)}` : null}
            />
            <InfoRow
              label='Validade'
              value={store.discount.startDate && store.discount.endDate
                ? `${store.discount.startDate} → ${store.discount.endDate}`
                : null}
            />
          </CardContent>
        </Card>
      )}

      {/* Logo & Cover */}
      {(store.logoUrl || store.coverUrl) && (
        <div className='flex flex-wrap gap-4'>
          {store.logoUrl && (
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>Logo</p>
              <img src={store.logoUrl} alt='Logo' className='h-20 w-20 rounded-lg object-cover ring-2 ring-border' />
            </div>
          )}
          {store.coverUrl && (
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>Capa</p>
              <img src={store.coverUrl} alt='Capa' className='h-20 w-40 rounded-lg object-cover ring-2 ring-border' />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Schedule Tab ─────────────────────────────────────────────────────

function ScheduleTab({ storeId }: { storeId: string }) {
  const { data: schedules, isLoading } = useStoreSchedules(storeId)
  const addSchedule = useAddStoreSchedule(storeId)
  const deleteSchedule = useDeleteStoreSchedule(storeId)
  const [showForm, setShowForm] = useState(false)

  const form = useForm<z.input<typeof scheduleFormSchema>, unknown, z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { day: 1, opening_time: '08:00', closing_time: '22:00' },
  })

  const onSubmit = (values: z.infer<typeof scheduleFormSchema>) => {
    addSchedule.mutate(values, {
      onSuccess: () => { form.reset(); setShowForm(false) },
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>Horários de Funcionamento</h3>
        <Button size='sm' onClick={() => setShowForm(!showForm)}>
          <Plus className='mr-1 h-4 w-4' /> Adicionar
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className='pt-4'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-wrap items-end gap-4'>
                <FormField
                  control={form.control}
                  name='day'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger className='w-36'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS.map((d, i) => (
                            <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='opening_time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abertura</FormLabel>
                      <FormControl>
                        <Input type='time' className='w-32' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='closing_time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fechamento</FormLabel>
                      <FormControl>
                        <Input type='time' className='w-32' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2'>
                  <Button type='submit' size='sm' disabled={addSchedule.isPending}>
                    {addSchedule.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type='button' variant='outline' size='sm' onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className='h-40' />
      ) : !schedules?.length ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <Calendar className='text-muted-foreground mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>Nenhum horário cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead className='w-16'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((s) => (
                  <TableRow key={s.id ?? `${s.day}-${s.openTime}`}>
                    <TableCell className='font-medium'>{DAYS[s.day]}</TableCell>
                    <TableCell>{s.openTime}</TableCell>
                    <TableCell>{s.closeTime}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0 text-destructive hover:text-destructive'
                        disabled={deleteSchedule.isPending}
                        onClick={() => {
                          if (s.id) deleteSchedule.mutate(s.id)
                          else toast.error('ID do horário não disponível')
                        }}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

// ─── Discount Tab ─────────────────────────────────────────────────────

function DiscountTab({ storeId }: { storeId: string }) {
  const { data: store } = useStore(storeId)
  const updateDiscount = useUpdateStoreDiscount(storeId)

  const form = useForm<z.input<typeof discountFormSchema>, unknown, z.infer<typeof discountFormSchema>>({
    resolver: zodResolver(discountFormSchema),
    values: {
      discount: store?.discount?.discount ?? 0,
      discount_type: (store?.discount?.type as 'percent' | 'amount') ?? 'percent',
      min_purchase: store?.discount?.minPurchase ?? undefined,
      max_discount: store?.discount?.maxDiscount ?? undefined,
      start_date: store?.discount?.startDate?.slice(0, 10) ?? '',
      end_date: store?.discount?.endDate?.slice(0, 10) ?? '',
    },
  })

  const onSubmit = (values: z.infer<typeof discountFormSchema>) => {
    updateDiscount.mutate(values)
  }

  return (
    <div className='max-w-xl'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Tag className='h-4 w-4' /> Configurar Desconto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='discount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Desconto</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' min='0' {...field} value={field.value as string | number | undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='discount_type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='percent'>Percentual (%)</SelectItem>
                          <SelectItem value='amount'>Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='min_purchase'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compra Mínima (R$)</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' min='0' placeholder='0' {...field} value={field.value as string | number | undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='max_discount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Máximo (R$)</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' min='0' placeholder='Sem limite' {...field} value={field.value as string | number | undefined} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='start_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Início</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='end_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='start_time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Início (opcional)</FormLabel>
                      <FormControl>
                        <Input type='time' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='end_time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Fim (opcional)</FormLabel>
                      <FormControl>
                        <Input type='time' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' disabled={updateDiscount.isPending}>
                {updateDiscount.isPending ? 'Salvando...' : 'Salvar Desconto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────

function OrdersTab({ storeId }: { storeId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStoreOrders(storeId, page)
  const navigate = useNavigate()
  const orders = data?.orders ?? []
  const total = data?.total ?? 0

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>Pedidos da Loja</h3>
        <span className='text-muted-foreground text-sm'>{total} pedidos</span>
      </div>

      {isLoading ? (
        <Skeleton className='h-48' />
      ) : !orders.length ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <ShoppingCart className='text-muted-foreground mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido #</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className='text-right'>Total</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o: any) => (
                <TableRow
                  key={o.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => navigate({ to: '/admin/orders/$orderId', params: { orderId: String(o.id) } })}
                >
                  <TableCell className='font-mono font-medium'>#{o.id}</TableCell>
                  <TableCell>{o.customer_name ?? o.customer?.f_name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className='capitalize'>{o.order_status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {o.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    R$ {Number(o.order_amount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {total > 20 && (
            <div className='flex items-center justify-between p-4 border-t'>
              <span className='text-muted-foreground text-sm'>
                Página {page} de {Math.ceil(total / 20)}
              </span>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <Button variant='outline' size='sm' disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Withdraws Tab ────────────────────────────────────────────────────

function WithdrawsTab({ storeId }: { storeId: string }) {
  const { data: withdraws, isLoading } = useStoreWithdraws(storeId)
  const updateWithdraw = useUpdateWithdrawStatus()
  const [notes, setNotes] = useState<Record<string, string>>({})

  const list = Array.isArray(withdraws) ? withdraws : (withdraws as any)?.data ?? []

  return (
    <div className='space-y-4'>
      <h3 className='font-medium'>Saques da Loja</h3>
      {isLoading ? (
        <Skeleton className='h-40' />
      ) : !list.length ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Banknote className='text-muted-foreground mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>Nenhum saque encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell className='font-mono'>#{w.id}</TableCell>
                  <TableCell className='font-medium'>R$ {Number(w.amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{w.payment_method ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      w.status === 'approved' ? 'default' :
                      w.status === 'denied' ? 'destructive' : 'secondary'
                    }>
                      {w.status === 'approved' ? 'Aprovado' : w.status === 'denied' ? 'Negado' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {w.created_at ? new Date(w.created_at).toLocaleDateString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell>
                    {w.status === 'pending' && (
                      <Input
                        placeholder='Observação...'
                        className='h-7 text-xs w-36'
                        value={notes[w.id] ?? ''}
                        onChange={e => setNotes(n => ({ ...n, [w.id]: e.target.value }))}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {w.status === 'pending' && (
                      <div className='flex gap-1'>
                        <Button
                          size='sm'
                          className='h-7 text-xs'
                          disabled={updateWithdraw.isPending}
                          onClick={() => updateWithdraw.mutate({ id: w.id, status: 'approved', transaction_note: notes[w.id] })}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='h-7 text-xs'
                          disabled={updateWithdraw.isPending}
                          onClick={() => updateWithdraw.mutate({ id: w.id, status: 'denied', transaction_note: notes[w.id] })}
                        >
                          Negar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

// ─── Main Detail Page ─────────────────────────────────────────────────

interface StoreDetailPageProps {
  storeId: string
  defaultTab?: string
}

export function StoreDetailPage({ storeId, defaultTab = 'overview' }: StoreDetailPageProps) {
  const navigate = useNavigate()
  const { data: store, isLoading } = useStore(storeId)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/admin/stores' })}
            className='gap-1'
          >
            <ArrowLeft className='h-4 w-4' /> Lojas
          </Button>
          <Separator orientation='vertical' className='h-5' />
          {isLoading ? (
            <Skeleton className='h-7 w-48' />
          ) : (
            <div className='flex items-center gap-2'>
              {store?.logoUrl && (
                <img src={store.logoUrl} alt={store?.name} className='h-8 w-8 rounded-full object-cover' />
              )}
              <h1 className='text-xl font-bold'>{store?.name}</h1>
              {store && <StatusBadge active={store.isActive} />}
              {store?.isApproved && (
                <Badge variant='outline' className='gap-1 text-green-600 border-green-600'>
                  <CheckCircle2 className='h-3 w-3' /> Aprovada
                </Badge>
              )}
              {store?.isFeatured && (
                <Badge variant='outline' className='gap-1 text-yellow-600 border-yellow-600'>
                  <Star className='h-3 w-3' /> Destaque
                </Badge>
              )}
            </div>
          )}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => navigate({ to: '/admin/stores/$storeId/edit', params: { storeId } })}
          className='gap-1.5'
        >
          <Edit className='h-4 w-4' /> Editar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className='flex-wrap h-auto gap-1'>
          <TabsTrigger value='overview' className='gap-1.5'>
            <Store className='h-3.5 w-3.5' /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value='orders' className='gap-1.5'>
            <ShoppingCart className='h-3.5 w-3.5' /> Pedidos
          </TabsTrigger>
          <TabsTrigger value='schedule' className='gap-1.5'>
            <Clock className='h-3.5 w-3.5' /> Horários
          </TabsTrigger>
          <TabsTrigger value='discount' className='gap-1.5'>
            <Percent className='h-3.5 w-3.5' /> Desconto
          </TabsTrigger>
          <TabsTrigger value='withdraws' className='gap-1.5'>
            <Banknote className='h-3.5 w-3.5' /> Saques
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-6'>
          <OverviewTab storeId={storeId} />
        </TabsContent>

        <TabsContent value='orders' className='mt-6'>
          <OrdersTab storeId={storeId} />
        </TabsContent>

        <TabsContent value='schedule' className='mt-6'>
          <ScheduleTab storeId={storeId} />
        </TabsContent>

        <TabsContent value='discount' className='mt-6'>
          <DiscountTab storeId={storeId} />
        </TabsContent>

        <TabsContent value='withdraws' className='mt-6'>
          <WithdrawsTab storeId={storeId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
