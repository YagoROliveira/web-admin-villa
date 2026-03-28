import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Pencil,
  ShoppingCart,
  Star,
  Heart,
  DollarSign,
  BarChart3,
  Package,
  Layers,
  PlusCircle,
  Trash2,
  RefreshCw,
  Tag,
  Clock,
  Store,
  FolderOpen,
  X,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useItem,
  useItemStats,
  useAttachItemAddon,
  useDetachItemAddon,
  useUpdateItemVariations,
  type ItemStats,
} from '../hooks/use-items'
import { useAddons, useCreateAddon, type Addon } from '../hooks/use-addons'

// ─── Main Detail Page ────────────────────────────────────────────────

export function ItemDetailPage({ itemId }: { itemId: string }) {
  const { data: item, isLoading, error, refetch, isFetching } = useItem(itemId)
  const { data: stats } = useItemStats(itemId)
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
          <ItemDetailSkeleton />
        </Main>
      </>
    )
  }

  if (error || !item) {
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
            <p className='text-destructive'>
              Erro ao carregar produto: {error?.message || 'Produto não encontrado'}
            </p>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link to='/items'>
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

  const img = item.images?.[0]

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back button + Title */}
        <div className='mb-6 flex items-center gap-4'>
          <Button asChild variant='outline' size='icon'>
            <Link to='/items'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold tracking-tight'>Detalhes do Produto</h2>
            <p className='text-muted-foreground text-sm'>
              Informações, estatísticas e configuração do produto
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => refetch()}
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button asChild size='sm'>
              <Link to='/items/$itemId/edit' params={{ itemId }}>
                <Pencil className='mr-2 h-4 w-4' />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Product Header Card */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-6 md:flex-row'>
              {/* Image + Name */}
              <div className='flex items-start gap-4'>
                {img ? (
                  <img
                    src={img}
                    alt={item.name}
                    className='h-24 w-24 rounded-lg object-cover'
                  />
                ) : (
                  <div className='bg-muted flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold'>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className='space-y-1'>
                  <h3 className='text-xl font-semibold'>{item.name}</h3>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant={item.isApproved ? 'default' : 'outline'}>
                      {item.isApproved ? 'Aprovado' : 'Pendente'}
                    </Badge>
                    {item.isVeg && <Badge variant='outline' className='border-green-500 text-green-600'>Vegetariano</Badge>}
                    {item.isHalal && <Badge variant='outline' className='border-emerald-500 text-emerald-600'>Halal</Badge>}
                    {item.isOrganic && <Badge variant='outline' className='border-lime-500 text-lime-600'>Orgânico</Badge>}
                    {item.isRecommended && <Badge variant='outline' className='border-amber-500 text-amber-600'>Recomendado</Badge>}
                  </div>
                  {item.description && (
                    <p className='text-muted-foreground text-sm max-w-md'>{item.description}</p>
                  )}
                </div>
              </div>

              <Separator orientation='vertical' className='hidden md:block' />

              {/* Info */}
              <div className='grid gap-3 text-sm md:grid-cols-2'>
                <div className='flex items-center gap-2'>
                  <Store className='text-muted-foreground h-4 w-4' />
                  <span>{item.store?.name || '—'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FolderOpen className='text-muted-foreground h-4 w-4' />
                  <span>{item.category?.name || '—'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <span>{item.module?.name || '—'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Clock className='text-muted-foreground h-4 w-4' />
                  <span>Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <Separator orientation='vertical' className='hidden md:block' />

              {/* Quick Pricing */}
              <div className='grid grid-cols-2 gap-4 md:grid-cols-1'>
                <div className='text-center md:text-left'>
                  <p className='text-muted-foreground text-xs uppercase'>Preço</p>
                  <p className='text-xl font-bold text-emerald-600'>
                    R$ {Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className='text-center md:text-left'>
                  <p className='text-muted-foreground text-xs uppercase'>Estoque</p>
                  <p className='text-xl font-bold'>
                    {item.stock !== null && item.stock !== undefined ? item.stock : '∞'}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary stats cards */}
            <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-5'>
              <MiniStatCard label='Pedidos' value={stats?.orderCount ?? item._count?.orderItems ?? 0} icon={ShoppingCart} />
              <MiniStatCard label='Avaliações' value={stats?.reviewCount ?? item._count?.reviews ?? 0} icon={Star} />
              <MiniStatCard label='Favoritos' value={stats?.wishlistCount ?? 0} icon={Heart} />
              <MiniStatCard
                label='Receita'
                value={stats?.totalRevenue ?? 0}
                icon={DollarSign}
                format='currency'
              />
              <MiniStatCard
                label='Nota Média'
                value={stats?.avgRating ?? item.avgRating ?? 0}
                icon={Star}
                format='rating'
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='flex-wrap'>
            <TabsTrigger value='overview'>
              <BarChart3 className='mr-1.5 h-4 w-4' />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value='pricing'>
              <DollarSign className='mr-1.5 h-4 w-4' />
              Preços
            </TabsTrigger>
            <TabsTrigger value='variations'>
              <Layers className='mr-1.5 h-4 w-4' />
              Variações
            </TabsTrigger>
            <TabsTrigger value='addons'>
              <PlusCircle className='mr-1.5 h-4 w-4' />
              Complementos
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <OverviewTab item={item} stats={stats} />
          </TabsContent>
          <TabsContent value='pricing'>
            <PricingTab item={item} />
          </TabsContent>
          <TabsContent value='variations'>
            <VariationsTab itemId={itemId} variations={item.variations} />
          </TabsContent>
          <TabsContent value='addons'>
            <AddonsTab itemId={itemId} storeId={item.storeId} linkedAddons={item.addons ?? []} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────

function OverviewTab({
  item,
  stats,
}: {
  item: NonNullable<ReturnType<typeof useItem>['data']>
  stats?: ItemStats
}) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-4 w-4' />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {item.tags && item.tags.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {item.tags.map((t, i) => (
                <Badge key={i} variant='secondary'>
                  {t.tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>Nenhuma tag cadastrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Disponível de:</span>
              <span>{item.availableFrom || 'Sempre'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Disponível até:</span>
              <span>{item.availableTo || 'Sempre'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Limite por carrinho:</span>
              <span>{item.maxCartQty || '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            Classificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3'>
            <FlagItem label='Vegetariano' value={item.isVeg} />
            <FlagItem label='Halal' value={item.isHalal} />
            <FlagItem label='Orgânico' value={item.isOrganic} />
            <FlagItem label='Recomendado' value={item.isRecommended} />
            <FlagItem label='Menu/Combo' value={item.isSetMenu} />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Total de pedidos:</span>
              <span className='font-medium'>{stats?.orderCount ?? item._count?.orderItems ?? 0}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Unidades vendidas:</span>
              <span className='font-medium'>{stats?.totalUnitsSold ?? 0}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Receita total:</span>
              <span className='font-medium text-emerald-600'>R$ {(stats?.totalRevenue ?? 0).toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Avaliações:</span>
              <span className='font-medium'>{stats?.reviewCount ?? item._count?.reviews ?? 0}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Nota média:</span>
              <span className='font-medium'>{(stats?.avgRating ?? item.avgRating ?? 0).toFixed(1)} ★</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Pricing Tab ─────────────────────────────────────────────────────

function PricingTab({ item }: { item: NonNullable<ReturnType<typeof useItem>['data']> }) {
  const discount = item.discount as { type?: string; amount?: number; maxDiscount?: number } | null

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4' />
            Preço e Estoque
          </CardTitle>
          <CardDescription>
            Para alterar, use o botão "Editar" no topo da página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Preço:</span>
              <span className='text-lg font-bold text-emerald-600'>R$ {Number(item.price).toFixed(2)}</span>
            </div>
            {item.minPrice != null && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Preço mínimo:</span>
                <span>R$ {Number(item.minPrice).toFixed(2)}</span>
              </div>
            )}
            {item.maxPrice != null && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Preço máximo:</span>
                <span>R$ {Number(item.maxPrice).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Taxa (tax):</span>
              <span>{item.tax != null ? `${Number(item.tax).toFixed(2)}%` : '—'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Estoque:</span>
              <span className='font-medium'>
                {item.stock !== null && item.stock !== undefined ? item.stock : '∞ (ilimitado)'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Máx. no carrinho:</span>
              <span>{item.maxCartQty || '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-4 w-4' />
            Desconto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discount && (discount.type || discount.amount) ? (
            <div className='grid gap-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Tipo:</span>
                <Badge variant='outline'>
                  {discount.type === 'percent' ? 'Percentual' : discount.type === 'amount' ? 'Valor fixo' : discount.type || '—'}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Valor:</span>
                <span className='font-medium'>
                  {discount.type === 'percent'
                    ? `${discount.amount}%`
                    : `R$ ${Number(discount.amount ?? 0).toFixed(2)}`}
                </span>
              </div>
              {discount.maxDiscount != null && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Desconto máximo:</span>
                  <span>R$ {Number(discount.maxDiscount).toFixed(2)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>Nenhum desconto configurado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Variations Tab ──────────────────────────────────────────────────

interface VariationGroup {
  name: string
  required: boolean
  min: number
  max: number
  options: { name: string; price: number }[]
}

function VariationsTab({ itemId, variations }: { itemId: string; variations: any }) {
  const updateVariations = useUpdateItemVariations()
  const [groups, setGroups] = useState<VariationGroup[]>(() => {
    if (Array.isArray(variations)) return variations as VariationGroup[]
    return []
  })
  const [dirty, setDirty] = useState(false)

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { name: '', required: false, min: 0, max: 1, options: [{ name: '', price: 0 }] },
    ])
    setDirty(true)
  }

  function removeGroup(index: number) {
    setGroups((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }

  function updateGroup(index: number, field: keyof VariationGroup, value: any) {
    setGroups((prev) => {
      const g = [...prev]
      g[index] = { ...g[index], [field]: value }
      return g
    })
    setDirty(true)
  }

  function addOption(groupIndex: number) {
    setGroups((prev) => {
      const g = [...prev]
      g[groupIndex] = {
        ...g[groupIndex],
        options: [...g[groupIndex].options, { name: '', price: 0 }],
      }
      return g
    })
    setDirty(true)
  }

  function removeOption(groupIndex: number, optionIndex: number) {
    setGroups((prev) => {
      const g = [...prev]
      g[groupIndex] = {
        ...g[groupIndex],
        options: g[groupIndex].options.filter((_, i) => i !== optionIndex),
      }
      return g
    })
    setDirty(true)
  }

  function updateOption(groupIndex: number, optionIndex: number, field: 'name' | 'price', value: string | number) {
    setGroups((prev) => {
      const g = [...prev]
      const opts = [...g[groupIndex].options]
      opts[optionIndex] = { ...opts[optionIndex], [field]: value }
      g[groupIndex] = { ...g[groupIndex], options: opts }
      return g
    })
    setDirty(true)
  }

  function handleSave() {
    updateVariations.mutate(
      { itemId, variations: groups },
      { onSuccess: () => setDirty(false) },
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Grupos de Variação</h3>
          <p className='text-muted-foreground text-sm'>
            Configure tamanhos, sabores, cores e outras variações do produto.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={addGroup} variant='outline' size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Novo Grupo
          </Button>
          {dirty && (
            <Button
              onClick={handleSave}
              size='sm'
              disabled={updateVariations.isPending}
            >
              Salvar Variações
            </Button>
          )}
        </div>
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Layers className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-sm'>
              Nenhuma variação cadastrada. Clique em "Novo Grupo" para adicionar.
            </p>
          </CardContent>
        </Card>
      )}

      {groups.map((group, gi) => (
        <Card key={gi}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>
                Grupo {gi + 1}: {group.name || '(sem nome)'}
              </CardTitle>
              <Button onClick={() => removeGroup(gi)} variant='ghost' size='icon' className='text-destructive'>
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Group fields */}
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='md:col-span-2'>
                <Label>Nome do grupo</Label>
                <Input
                  placeholder='Ex: Tamanho, Sabor, Cor...'
                  value={group.name}
                  onChange={(e) => updateGroup(gi, 'name', e.target.value)}
                />
              </div>
              <div>
                <Label>Mín. seleções</Label>
                <Input
                  type='number'
                  min={0}
                  value={group.min}
                  onChange={(e) => updateGroup(gi, 'min', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Máx. seleções</Label>
                <Input
                  type='number'
                  min={1}
                  value={group.max}
                  onChange={(e) => updateGroup(gi, 'max', Number(e.target.value))}
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                checked={group.required}
                onCheckedChange={(v) => updateGroup(gi, 'required', v)}
              />
              <Label>Obrigatório</Label>
            </div>

            <Separator />

            {/* Options */}
            <div className='space-y-2'>
              <Label>Opções</Label>
              {group.options.map((opt, oi) => (
                <div key={oi} className='flex items-center gap-2'>
                  <Input
                    placeholder='Nome da opção'
                    value={opt.name}
                    onChange={(e) => updateOption(gi, oi, 'name', e.target.value)}
                    className='flex-1'
                  />
                  <CurrencyInput
                    value={opt.price}
                    onChange={(v) => updateOption(gi, oi, 'price', v)}
                    className='w-32'
                  />
                  <Button
                    onClick={() => removeOption(gi, oi)}
                    variant='ghost'
                    size='icon'
                    className='text-destructive shrink-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              <Button onClick={() => addOption(gi)} variant='outline' size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Adicionar Opção
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Addons Tab ──────────────────────────────────────────────────────

function AddonsTab({
  itemId,
  storeId,
  linkedAddons,
}: {
  itemId: string
  storeId: string
  linkedAddons: { addon: { id: string; name: string; price: number; isActive?: boolean } }[]
}) {
  const { data: allAddons, isLoading: loadingAddons } = useAddons(storeId)
  const attachAddon = useAttachItemAddon()
  const detachAddon = useDetachItemAddon()
  const createAddon = useCreateAddon()
  const [showCreate, setShowCreate] = useState(false)
  const [newAddonName, setNewAddonName] = useState('')
  const [newAddonPrice, setNewAddonPrice] = useState(0)

  const linkedIds = new Set(linkedAddons.map((a) => a.addon.id))

  const availableAddons = (allAddons?.items ?? []).filter(
    (a: Addon) => !linkedIds.has(a.id) && a.isActive,
  )

  function handleAttach(addonId: string) {
    attachAddon.mutate({ itemId, addonId })
  }

  function handleDetach(addonId: string) {
    detachAddon.mutate({ itemId, addonId })
  }

  function handleCreate() {
    if (!newAddonName.trim()) return
    createAddon.mutate(
      { storeId, name: newAddonName.trim(), price: newAddonPrice },
      {
        onSuccess: (addon) => {
          setNewAddonName('')
          setNewAddonPrice(0)
          setShowCreate(false)
          // Also attach it to the item
          attachAddon.mutate({ itemId, addonId: addon.id })
        },
      },
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Complementos do Produto</h3>
          <p className='text-muted-foreground text-sm'>
            Gerencie os complementos/adicionais disponíveis para este produto.
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant='outline' size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Criar Complemento
        </Button>
      </div>

      {/* Create new addon form */}
      {showCreate && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-end gap-3'>
              <div className='flex-1'>
                <Label>Nome</Label>
                <Input
                  placeholder='Ex: Queijo extra, Bacon, Molho especial...'
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                />
              </div>
              <div className='w-40'>
                <Label>Preço</Label>
                <CurrencyInput
                  value={newAddonPrice}
                  onChange={(v) => setNewAddonPrice(v)}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createAddon.isPending || !newAddonName.trim()}
              >
                Criar e Vincular
              </Button>
              <Button variant='ghost' onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked addons */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Complementos Vinculados ({linkedAddons.length})</CardTitle>
          <CardDescription>Estes complementos aparecem como opcionais ao cliente ao adicionar o produto ao carrinho.</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedAddons.length === 0 ? (
            <p className='text-muted-foreground text-sm py-4 text-center'>
              Nenhum complemento vinculado a este produto.
            </p>
          ) : (
            <div className='space-y-2'>
              {linkedAddons.map((la) => (
                <div key={la.addon.id} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <PlusCircle className='text-emerald-600 h-4 w-4' />
                    <span className='font-medium'>{la.addon.name}</span>
                    <Badge variant='outline'>R$ {Number(la.addon.price).toFixed(2)}</Badge>
                  </div>
                  <Button
                    onClick={() => handleDetach(la.addon.id)}
                    variant='ghost'
                    size='sm'
                    className='text-destructive'
                    disabled={detachAddon.isPending}
                  >
                    <Trash2 className='mr-1 h-4 w-4' />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available addons from store */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Complementos Disponíveis da Loja</CardTitle>
          <CardDescription>
            Complementos da mesma loja que ainda não foram vinculados a este produto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAddons ? (
            <div className='space-y-2'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full rounded-lg' />
              ))}
            </div>
          ) : availableAddons.length === 0 ? (
            <p className='text-muted-foreground text-sm py-4 text-center'>
              Todos os complementos da loja já estão vinculados ou não há complementos cadastrados.
            </p>
          ) : (
            <div className='space-y-2'>
              {availableAddons.map((addon: Addon) => (
                <div key={addon.id} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <PlusCircle className='text-muted-foreground h-4 w-4' />
                    <span>{addon.name}</span>
                    <Badge variant='outline'>R$ {Number(addon.price).toFixed(2)}</Badge>
                  </div>
                  <Button
                    onClick={() => handleAttach(addon.id)}
                    variant='outline'
                    size='sm'
                    disabled={attachAddon.isPending}
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    Vincular
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

function FlagItem({ label, value }: { label: string; value?: boolean | null }) {
  return (
    <div className='flex items-center gap-2 text-sm'>
      <div
        className={`h-2.5 w-2.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
      />
      <span className={value ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}

function MiniStatCard({
  label,
  value,
  icon: Icon,
  format,
}: {
  label: string
  value: number
  icon: React.ElementType
  format?: 'currency' | 'rating'
}) {
  let displayValue: string
  if (format === 'currency') {
    displayValue = `R$ ${value.toFixed(2)}`
  } else if (format === 'rating') {
    displayValue = `${value.toFixed(1)} ★`
  } else {
    displayValue = String(value)
  }

  return (
    <div className='bg-muted/50 flex items-center gap-3 rounded-lg p-3'>
      <div className='bg-background flex h-10 w-10 items-center justify-center rounded-full'>
        <Icon className='text-muted-foreground h-5 w-5' />
      </div>
      <div>
        <p className='text-lg font-semibold'>{displayValue}</p>
        <p className='text-muted-foreground text-xs'>{label}</p>
      </div>
    </div>
  )
}

// ─── Loading skeleton ────────────────────────────────────────────────

function ItemDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-10 w-10 rounded-md' />
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex gap-6'>
            <Skeleton className='h-24 w-24 rounded-lg' />
            <div className='flex-1 space-y-3'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-56' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
          <div className='mt-6 grid grid-cols-5 gap-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-16 rounded-lg' />
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-64 w-full' />
    </div>
  )
}
