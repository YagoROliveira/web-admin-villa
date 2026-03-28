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
import { Switch } from '@/components/ui/switch'
import { SearchableCombobox } from '@/components/searchable-combobox'
import { ImageUploader } from '@/components/image-uploader'
import {
  useModuleOptions,
  useCategoryOptions,
} from '@/hooks/use-lookups'
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '../data/schema'
import {
  useCreateCategory,
  useUpdateCategory,
  useCategory,
} from '../hooks/use-categories'

interface CategoryFormPageProps {
  categoryId?: string
}

export function CategoryFormPage({ categoryId }: CategoryFormPageProps) {
  const navigate = useNavigate()
  const isUpdate = !!categoryId

  // Fetch existing category for edit
  const { data: existingCategory, isLoading: categoryLoading } = useCategory(
    categoryId ?? '',
  )

  // Mutations
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isPending = createCategory.isPending || updateCategory.isPending

  // Lookup searches
  const [moduleSearch, setModuleSearch] = useState('')
  const [parentSearch, setParentSearch] = useState('')

  const { options: moduleOptions, isLoading: modulesLoading } =
    useModuleOptions(moduleSearch)
  const { options: parentOptions, isLoading: parentsLoading } =
    useCategoryOptions(parentSearch)

  const form = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: '',
      moduleId: '',
      parentId: '',
      imageUrl: '',
      position: 0,
      priority: 0,
      isActive: true,
      isFeatured: false,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingCategory && isUpdate) {
      form.reset({
        name: existingCategory.name,
        moduleId: existingCategory.moduleId,
        parentId: existingCategory.parentId ?? '',
        imageUrl: existingCategory.imageUrl ?? '',
        position: existingCategory.position ?? 0,
        priority: existingCategory.priority ?? 0,
        isActive: existingCategory.isActive ?? true,
        isFeatured: existingCategory.isFeatured ?? false,
      })
    }
  }, [existingCategory, isUpdate, form])

  // Ensure existing entity options appear
  const moduleOptionsWithCurrent =
    existingCategory?.module &&
      !moduleOptions.find((o) => o.value === existingCategory.moduleId)
      ? [
        {
          value: existingCategory.moduleId,
          label: existingCategory.module.name,
        },
        ...moduleOptions,
      ]
      : moduleOptions

  // Filter out current category from parent options
  const filteredParentOptions = parentOptions.filter(
    (o) => o.value !== categoryId,
  )

  const parentOptionsWithCurrent =
    existingCategory?.parent &&
      !filteredParentOptions.find((o) => o.value === existingCategory.parentId)
      ? [
        {
          value: existingCategory.parentId!,
          label: existingCategory.parent.name,
        },
        ...filteredParentOptions,
      ]
      : filteredParentOptions

  const handleSubmit = (data: CategoryFormValues) => {
    // Remove empty parentId
    const payload = {
      ...data,
      parentId: data.parentId || undefined,
    }

    if (isUpdate && categoryId) {
      updateCategory.mutate(
        { id: categoryId, data: payload },
        { onSuccess: () => navigate({ to: '/admin/categories' }) },
      )
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => navigate({ to: '/admin/categories' }),
      })
    }
  }

  const handleBack = () => navigate({ to: '/admin/categories' })

  if (isUpdate && categoryLoading) {
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
            {isUpdate ? 'Editar Categoria' : 'Nova Categoria'}
          </h1>
          <p className='text-muted-foreground'>
            {isUpdate
              ? 'Atualize as informações da categoria.'
              : 'Preencha os dados para criar uma nova categoria.'}
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
                Nome e imagem da categoria.
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
                      <Input {...field} placeholder='Nome da categoria' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        label='Imagem da categoria'
                        aspectRatio='square'
                      />
                    </FormControl>
                    <FormDescription>
                      Recomendado: 256x256px (quadrada)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Vínculos ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Vínculos</CardTitle>
              <CardDescription>
                Módulo e categoria pai (para subcategorias).
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
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
                name='parentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria Pai</FormLabel>
                    <FormControl>
                      <SearchableCombobox
                        options={parentOptionsWithCurrent}
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        searchQuery={parentSearch}
                        onSearchChange={setParentSearch}
                        placeholder='Nenhuma (raiz)...'
                        searchPlaceholder='Buscar categoria...'
                        emptyMessage='Nenhuma categoria encontrada.'
                        isLoading={parentsLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Deixe vazio para categoria raiz.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Configuração ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>
                Posição, prioridade e status.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='position'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posição</FormLabel>
                      <FormControl>
                        <Input {...field} type='number' min='0' />
                      </FormControl>
                      <FormDescription>
                        Ordem de exibição (menor = primeiro)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <FormControl>
                        <Input {...field} type='number' min='0' />
                      </FormControl>
                      <FormDescription>
                        Maior = mais relevante
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex gap-8'>
                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>Ativa</FormLabel>
                        <FormDescription>
                          Visível no app
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='isFeatured'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>Destaque</FormLabel>
                        <FormDescription>
                          Exibir na tela inicial
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
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
                  {isUpdate ? 'Atualizar' : 'Criar Categoria'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
