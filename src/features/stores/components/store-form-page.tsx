import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  Save,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SearchableCombobox } from '@/components/searchable-combobox'
import { ImageUploader } from '@/components/image-uploader'
import { MapLocationPicker } from '@/components/map-location-picker'
import {
  useVendorOptions,
  useZoneOptions,
  useModuleOptions,
} from '@/hooks/use-lookups'
import { useAuthStore } from '@/stores/auth-store'
import {
  storeFormSchema,
  type StoreFormValues,
} from '../data/schema'
import {
  useCreateStore,
  useUpdateStore,
  useStore,
} from '../hooks/use-stores'

interface StoreFormPageProps {
  storeId?: string
}

export function StoreFormPage({ storeId }: StoreFormPageProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const isAdmin = auth.isAdmin()
  const isUpdate = !!storeId

  // Fetch existing store for edit
  const { data: existingStore, isLoading: storeLoading } = useStore(
    storeId ?? '',
  )

  // Mutations
  const createStore = useCreateStore()
  const updateStore = useUpdateStore()
  const isPending = createStore.isPending || updateStore.isPending

  // Lookup searches
  const [vendorSearch, setVendorSearch] = useState('')
  const [moduleSearch, setModuleSearch] = useState('')
  const [zoneSearch, setZoneSearch] = useState('')

  const { options: vendorOptions, isLoading: vendorsLoading } =
    useVendorOptions(vendorSearch)
  const { options: moduleOptions, isLoading: modulesLoading } =
    useModuleOptions(moduleSearch)
  const { options: zoneOptions, isLoading: zonesLoading } =
    useZoneOptions(zoneSearch)

  // Payment methods local state
  const [paymentMethods, setPaymentMethods] = useState({
    cashOnDelivery: true,
    digitalPayment: true,
    wallet: true,
    offlinePayment: false,
  })

  const form = useForm<StoreFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(storeFormSchema) as any,
    defaultValues: {
      name: '',
      vendorId: '',
      moduleId: '',
      zoneId: '',
      phone: '',
      email: '',
      address: '',
      latitude: 0,
      longitude: 0,
      logoUrl: '',
      coverUrl: '',
      minOrder: 0,
      commissionRate: 0,
      taxRate: 0,
      gstCode: '',
      metaTitle: '',
      metaDescription: '',
      features: {},
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingStore && isUpdate) {
      form.reset({
        name: existingStore.name,
        vendorId: existingStore.vendorId,
        moduleId: existingStore.moduleId,
        zoneId: existingStore.zoneId,
        phone: existingStore.phone ?? '',
        email: existingStore.email ?? '',
        address: existingStore.address ?? '',
        latitude: existingStore.latitude,
        longitude: existingStore.longitude,
        logoUrl: existingStore.logoUrl ?? '',
        coverUrl: existingStore.coverUrl ?? '',
        minOrder: existingStore.minOrder ?? 0,
        commissionRate: existingStore.commissionRate ?? 0,
        taxRate: existingStore.taxRate ?? 0,
        gstCode: existingStore.gstCode ?? '',
        metaTitle: existingStore.metaTitle ?? '',
        metaDescription: existingStore.metaDescription ?? '',
        features: existingStore.features ?? {},
      })

      // Load payment methods from features
      const features = existingStore.features as Record<string, unknown> | null
      if (features?.paymentMethods) {
        const pm = features.paymentMethods as Record<string, boolean>
        setPaymentMethods((prev) => ({ ...prev, ...pm }))
      }
    }
  }, [existingStore, isUpdate, form])

  // Ensure existing store's related entities appear in options
  const vendorOptionsWithCurrent =
    existingStore?.vendor &&
      !vendorOptions.find((o) => o.value === existingStore.vendorId)
      ? [
        {
          value: existingStore.vendorId,
          label: existingStore.vendor.name,
          description: existingStore.vendor.email ?? undefined,
        },
        ...vendorOptions,
      ]
      : vendorOptions

  const moduleOptionsWithCurrent =
    existingStore?.module &&
      !moduleOptions.find((o) => o.value === existingStore.moduleId)
      ? [
        {
          value: existingStore.moduleId,
          label: existingStore.module.name,
          description: existingStore.module.type,
        },
        ...moduleOptions,
      ]
      : moduleOptions

  const zoneOptionsWithCurrent =
    existingStore?.zone &&
      !zoneOptions.find((o) => o.value === existingStore.zoneId)
      ? [
        {
          value: existingStore.zoneId,
          label: existingStore.zone.displayName || existingStore.zone.name,
        },
        ...zoneOptions,
      ]
      : zoneOptions

  const handleSubmit = (data: StoreFormValues) => {
    // Merge payment methods into features
    const features = {
      ...(data.features || {}),
      paymentMethods,
    }
    const payload = { ...data, features }

    if (isUpdate && storeId) {
      updateStore.mutate(
        { id: storeId, data: payload },
        { onSuccess: () => navigate({ to: '/admin/stores' }) },
      )
    } else {
      createStore.mutate(payload, {
        onSuccess: () => navigate({ to: '/admin/stores' }),
      })
    }
  }

  const handleBack = () => navigate({ to: '/admin/stores' })

  if (isUpdate && storeLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='container max-w-4xl py-6'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={handleBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {isUpdate ? 'Editar Loja' : 'Nova Loja'}
          </h1>
          <p className='text-muted-foreground'>
            {isUpdate
              ? 'Atualize as informações da loja.'
              : 'Preencha os dados para criar uma nova loja.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          {/* ─── Informações Básicas ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Nome, contato e endereço da loja.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Nome da loja' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='(11) 99999-9999' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                          placeholder='loja@email.com'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Rua, número, bairro...' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Vínculos (Searchable Comboboxes) ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Vínculos</CardTitle>
              <CardDescription>
                Lojista responsável, módulo e zona de operação.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {isAdmin ? (
                <FormField
                  control={form.control}
                  name='vendorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lojista *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={vendorOptionsWithCurrent}
                          value={field.value}
                          onValueChange={field.onChange}
                          searchQuery={vendorSearch}
                          onSearchChange={setVendorSearch}
                          placeholder='Selecione o lojista...'
                          searchPlaceholder='Buscar lojista...'
                          emptyMessage='Nenhum lojista encontrado.'
                          isLoading={vendorsLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name='vendorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lojista</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          value={auth.user?.name ?? 'Sua conta'}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='moduleId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Módulo *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={moduleOptionsWithCurrent}
                          value={field.value}
                          onValueChange={field.onChange}
                          searchQuery={moduleSearch}
                          onSearchChange={setModuleSearch}
                          placeholder='Selecione o módulo...'
                          searchPlaceholder='Buscar módulo...'
                          emptyMessage='Nenhum módulo encontrado.'
                          isLoading={modulesLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='zoneId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={zoneOptionsWithCurrent}
                          value={field.value}
                          onValueChange={field.onChange}
                          searchQuery={zoneSearch}
                          onSearchChange={setZoneSearch}
                          placeholder='Selecione a zona...'
                          searchPlaceholder='Buscar zona...'
                          emptyMessage='Nenhuma zona encontrada.'
                          isLoading={zonesLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Localização (Map Picker) ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
              <CardDescription>
                Clique no mapa para definir a localização da loja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapLocationPicker
                latitude={form.watch('latitude')}
                longitude={form.watch('longitude')}
                onLocationChange={(lat, lng) => {
                  form.setValue('latitude', lat, { shouldDirty: true })
                  form.setValue('longitude', lng, { shouldDirty: true })
                }}
              />
            </CardContent>
          </Card>

          {/* ─── Imagens (Upload) ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
              <CardDescription>
                Logo e capa da loja. Arraste ou clique para enviar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='logoUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          label='Logo da loja'
                          aspectRatio='square'
                        />
                      </FormControl>
                      <FormDescription>
                        Recomendado: 512x512px
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='coverUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capa</FormLabel>
                      <FormControl>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          label='Capa da loja'
                          aspectRatio='video'
                        />
                      </FormControl>
                      <FormDescription>
                        Recomendado: 1200x675px
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Formas de Pagamento ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>
                Defina quais formas de pagamento esta loja aceita.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <Banknote className='h-5 w-5 text-green-600' />
                  <div>
                    <div className='font-medium'>Dinheiro na Entrega</div>
                    <div className='text-sm text-muted-foreground'>
                      Pagamento em dinheiro ao receber o pedido
                    </div>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.cashOnDelivery}
                  onCheckedChange={(checked) =>
                    setPaymentMethods((prev) => ({
                      ...prev,
                      cashOnDelivery: checked,
                    }))
                  }
                />
              </div>

              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <CreditCard className='h-5 w-5 text-blue-600' />
                  <div>
                    <div className='font-medium'>Pagamento Digital</div>
                    <div className='text-sm text-muted-foreground'>
                      Cartão de crédito, débito e PIX online
                    </div>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.digitalPayment}
                  onCheckedChange={(checked) =>
                    setPaymentMethods((prev) => ({
                      ...prev,
                      digitalPayment: checked,
                    }))
                  }
                />
              </div>

              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <Wallet className='h-5 w-5 text-purple-600' />
                  <div>
                    <div className='font-medium'>Carteira Digital</div>
                    <div className='text-sm text-muted-foreground'>
                      Saldo da carteira Villa Market
                    </div>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.wallet}
                  onCheckedChange={(checked) =>
                    setPaymentMethods((prev) => ({
                      ...prev,
                      wallet: checked,
                    }))
                  }
                />
              </div>

              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <Smartphone className='h-5 w-5 text-orange-600' />
                  <div>
                    <div className='font-medium'>Pagamento Offline</div>
                    <div className='text-sm text-muted-foreground'>
                      Maquininha de cartão na entrega
                    </div>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.offlinePayment}
                  onCheckedChange={(checked) =>
                    setPaymentMethods((prev) => ({
                      ...prev,
                      offlinePayment: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Configurações Financeiras ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Pedido mínimo, comissão e impostos.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='minOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedido Mín. (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='commissionRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comissão %</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          step='0.1'
                          min='0'
                          max='100'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='taxRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imposto %</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          step='0.1'
                          min='0'
                          max='100'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='gstCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código GST</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Código fiscal' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── SEO ─── */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Meta dados para otimização em mecanismos de busca.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='metaTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Título</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Título para SEO' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='metaDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Descrição para SEO'
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Actions ─── */}
          <div className='flex items-center justify-end gap-4'>
            <Button type='button' variant='outline' onClick={handleBack}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {isUpdate ? 'Atualizar' : 'Criar Loja'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
