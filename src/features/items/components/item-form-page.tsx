import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { SearchableCombobox } from '@/components/searchable-combobox'
import {
  useStoreOptions,
  useCategoryOptions,
  useModuleOptions,
  useUnitOptions,
} from '@/hooks/use-lookups'
import { useAuthStore } from '@/stores/auth-store'
import {
  itemFormSchema,
  type Item,
  type ItemFormValues,
} from '../data/schema'
import {
  useCreateItem,
  useUpdateItem,
  useItem,
} from '../hooks/use-items'

interface ItemFormPageProps {
  itemId?: string
}

export function ItemFormPage({ itemId }: ItemFormPageProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const isAdmin = auth.isAdmin()
  const isVendor = auth.isVendor()
  const isUpdate = !!itemId

  // Fetch existing item for edit
  const { data: existingItem, isLoading: itemLoading } = useItem(itemId ?? '')

  // Mutations
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const isPending = createItem.isPending || updateItem.isPending

  // Lookup searches
  const [storeSearch, setStoreSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [moduleSearch, setModuleSearch] = useState('')
  const [unitSearch, setUnitSearch] = useState('')

  const { options: storeOptions, isLoading: storesLoading } =
    useStoreOptions(storeSearch)
  const { options: categoryOptions, isLoading: categoriesLoading } =
    useCategoryOptions(categorySearch)
  const { options: moduleOptions, isLoading: modulesLoading } =
    useModuleOptions(moduleSearch)
  const { options: unitOptions, isLoading: unitsLoading } =
    useUnitOptions(unitSearch)

  // Tag input state
  const [tagInput, setTagInput] = useState('')

  const form = useForm<ItemFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemFormSchema) as any,
    defaultValues: {
      name: '',
      storeId: isVendor ? (auth.user?.storeId ?? '') : '',
      categoryId: '',
      moduleId: '',
      unitId: '',
      description: '',
      images: [],
      price: 0,
      discount: null,
      tax: 0,
      stock: 0,
      maxCartQty: undefined,
      isVeg: false,
      isHalal: false,
      isOrganic: false,
      isRecommended: false,
      isSetMenu: false,
      availableFrom: '',
      availableTo: '',
      tags: [],
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingItem && isUpdate) {
      form.reset({
        name: existingItem.name,
        storeId: existingItem.storeId,
        categoryId: existingItem.categoryId,
        moduleId: existingItem.moduleId,
        unitId: existingItem.unitId ?? '',
        description: existingItem.description ?? '',
        images: existingItem.images ?? [],
        price: Number(existingItem.price),
        discount: existingItem.discount ?? null,
        tax: existingItem.tax != null ? Number(existingItem.tax) : 0,
        stock: existingItem.stock ?? 0,
        maxCartQty: existingItem.maxCartQty ?? undefined,
        isVeg: existingItem.isVeg ?? false,
        isHalal: existingItem.isHalal ?? false,
        isOrganic: existingItem.isOrganic ?? false,
        isRecommended: existingItem.isRecommended ?? false,
        isSetMenu: existingItem.isSetMenu ?? false,
        availableFrom: existingItem.availableFrom ?? '',
        availableTo: existingItem.availableTo ?? '',
        tags: existingItem.tags?.map((t) => t.tag) ?? [],
      })
    }
  }, [existingItem, isUpdate, form])

  // Ensure existing item's related entities appear in options
  const storeOptionsWithCurrent =
    existingItem?.store &&
      !storeOptions.find((o) => o.value === existingItem.storeId)
      ? [
        {
          value: existingItem.storeId,
          label: existingItem.store.name,
        },
        ...storeOptions,
      ]
      : storeOptions

  const categoryOptionsWithCurrent =
    existingItem?.category &&
      !categoryOptions.find((o) => o.value === existingItem.categoryId)
      ? [
        {
          value: existingItem.categoryId,
          label: existingItem.category.name,
        },
        ...categoryOptions,
      ]
      : categoryOptions

  const moduleOptionsWithCurrent =
    existingItem?.module &&
      !moduleOptions.find((o) => o.value === existingItem.moduleId)
      ? [
        {
          value: existingItem.moduleId,
          label: existingItem.module.name,
          description: existingItem.module.type,
        },
        ...moduleOptions,
      ]
      : moduleOptions

  const handleSubmit = (data: ItemFormValues) => {
    // Clean empty optional fields
    const payload = {
      ...data,
      unitId: data.unitId || undefined,
      discount: data.discount?.type ? data.discount : undefined,
    }

    if (isUpdate && itemId) {
      updateItem.mutate(
        { id: itemId, data: payload },
        { onSuccess: () => navigate({ to: '/items' }) },
      )
    } else {
      createItem.mutate(payload as ItemFormValues, {
        onSuccess: () => navigate({ to: '/items' }),
      })
    }
  }

  const handleBack = () => navigate({ to: '/items' })

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag) {
      const currentTags = form.getValues('tags') ?? []
      if (!currentTags.includes(tag)) {
        form.setValue('tags', [...currentTags, tag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') ?? []
    form.setValue(
      'tags',
      currentTags.filter((t) => t !== tagToRemove),
    )
  }

  if (isUpdate && itemLoading) {
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
            {isUpdate ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className='text-muted-foreground'>
            {isUpdate
              ? 'Atualize as informações do produto.'
              : 'Preencha os dados para criar um novo produto.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          {/* ─── Informações Básicas ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Nome e descrição do produto.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Nome do produto' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Descrição do produto...'
                        rows={3}
                      />
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
                Loja, categoria e módulo do produto.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Store — Admin pesquisa, Vendor fica fixo na própria loja */}
              {isAdmin ? (
                <FormField
                  control={form.control}
                  name='storeId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loja *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={storeOptionsWithCurrent}
                          value={field.value}
                          onValueChange={field.onChange}
                          searchQuery={storeSearch}
                          onSearchChange={setStoreSearch}
                          placeholder='Selecione a loja...'
                          searchPlaceholder='Buscar loja...'
                          emptyMessage='Nenhuma loja encontrada.'
                          isLoading={storesLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name='storeId'
                  render={() => (
                    <FormItem>
                      <FormLabel>Loja</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          value={auth.user?.storeName ?? 'Sua loja'}
                        />
                      </FormControl>
                      <FormDescription>
                        O produto será cadastrado na sua loja automaticamente.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={categoryOptionsWithCurrent}
                          value={field.value}
                          onValueChange={field.onChange}
                          searchQuery={categorySearch}
                          onSearchChange={setCategorySearch}
                          placeholder='Selecione a categoria...'
                          searchPlaceholder='Buscar categoria...'
                          emptyMessage='Nenhuma categoria encontrada.'
                          isLoading={categoriesLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

              <FormField
                control={form.control}
                name='unitId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <SearchableCombobox
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        options={unitOptions}
                        onSearchChange={setUnitSearch}
                        placeholder='Selecione a unidade'
                        emptyMessage='Nenhuma unidade encontrada'
                        isLoading={unitsLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Preços e Estoque ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Preços e Estoque</CardTitle>
              <CardDescription>
                Defina o preço, imposto e controle de estoque.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$) *</FormLabel>
                      <FormControl>
                        <CurrencyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='tax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imposto (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type='number' step='0.01' min='0' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='stock'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque</FormLabel>
                      <FormControl>
                        <Input {...field} type='number' min='0' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='maxCartQty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. no carrinho</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min='1'
                        placeholder='Sem limite'
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Desconto ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Desconto</CardTitle>
              <CardDescription>
                Configure desconto percentual ou valor fixo.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='discount.type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Desconto</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ''}
                          className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        >
                          <option value=''>Sem desconto</option>
                          <option value='percent'>Percentual (%)</option>
                          <option value='amount'>Valor fixo (R$)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='discount.amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('discount.type') === 'percent'
                          ? 'Desconto (%)'
                          : 'Desconto (R$)'}
                      </FormLabel>
                      <FormControl>
                        {form.watch('discount.type') === 'percent' ? (
                          <Input
                            {...field}
                            type='number'
                            step='0.01'
                            min='0'
                            value={field.value ?? ''}
                            disabled={!form.watch('discount.type')}
                          />
                        ) : (
                          <CurrencyInput
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={!form.watch('discount.type')}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='discount.maxDiscount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Máximo (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value ?? 0}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={form.watch('discount.type') !== 'percent'}
                        />
                      </FormControl>
                      <FormDescription>
                        Limite de desconto quando é percentual.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Disponibilidade ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
              <CardDescription>
                Horários de disponibilidade do produto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='availableFrom'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponível de</FormLabel>
                      <FormControl>
                        <Input {...field} type='time' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='availableTo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponível até</FormLabel>
                      <FormControl>
                        <Input {...field} type='time' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Classificações ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Classificações</CardTitle>
              <CardDescription>
                Flags e categorização do produto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3'>
                {([
                  { name: 'isVeg' as const, label: 'Vegetariano' },
                  { name: 'isHalal' as const, label: 'Halal' },
                  { name: 'isOrganic' as const, label: 'Orgânico' },
                  { name: 'isRecommended' as const, label: 'Recomendado' },
                  { name: 'isSetMenu' as const, label: 'Menu/Combo' },
                ]).map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem className='flex items-center gap-3'>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className='!mt-0'>{label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── Tags ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Palavras-chave para facilitar a busca do produto.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Adicionar tag...'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className='max-w-xs'
                />
                <Button type='button' variant='secondary' onClick={addTag}>
                  Adicionar
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {(form.watch('tags') ?? []).map((tag) => (
                  <Badge
                    key={tag}
                    variant='secondary'
                    className='cursor-pointer'
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
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
                  {isUpdate ? 'Atualizar' : 'Criar Produto'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
