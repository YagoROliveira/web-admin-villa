import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploader } from '@/components/image-uploader'
import {
  moduleFormSchema,
  MODULE_TYPES,
  MODULE_TYPE_LABELS,
  type ModuleFormValues,
} from '../data/schema'
import {
  useCreateModule,
  useUpdateModule,
  useModule,
} from '../hooks/use-modules'

interface Props {
  moduleId?: string
}

export function ModuleFormPage({ moduleId }: Props) {
  const navigate = useNavigate()
  const isUpdate = !!moduleId

  const { data: existing, isLoading: loadingModule } = useModule(moduleId ?? '')
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  const isPending = createModule.isPending || updateModule.isPending

  const form = useForm<ModuleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(moduleFormSchema) as any,
    defaultValues: {
      name: '',
      type: '',
      icon: '',
      thumbnail: '',
      description: '',
      isActive: true,
      allZoneService: false,
      themeId: 1,
    },
  })

  useEffect(() => {
    if (existing && isUpdate) {
      form.reset({
        name: existing.name,
        type: existing.type,
        icon: existing.icon ?? '',
        thumbnail: existing.thumbnail ?? '',
        description: existing.description ?? '',
        isActive: existing.isActive,
        allZoneService: existing.allZoneService,
        themeId: existing.themeId,
      })
    }
  }, [existing, isUpdate, form])

  const handleSubmit = (data: ModuleFormValues) => {
    if (isUpdate && moduleId) {
      updateModule.mutate(
        { id: moduleId, data },
        { onSuccess: () => navigate({ to: '/admin/modules' }) },
      )
    } else {
      createModule.mutate(data, {
        onSuccess: () => navigate({ to: '/admin/modules' }),
      })
    }
  }

  const handleBack = () => navigate({ to: '/admin/modules' })

  if (isUpdate && loadingModule) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='container max-w-4xl py-6'>
      <div className='mb-6 flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={handleBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {isUpdate ? 'Editar Módulo' : 'Novo Módulo'}
          </h1>
          <p className='text-muted-foreground'>
            {isUpdate
              ? 'Atualize as informações do módulo.'
              : 'Preencha os dados para criar um novo módulo.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          {/* ─── Informações Básicas ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Nome, tipo e descrição do módulo.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Ex: Alimentação' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione o tipo...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MODULE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {MODULE_TYPE_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Breve descrição do módulo...'
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Imagens ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
              <CardDescription>Ícone e thumbnail do módulo.</CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        label='Ícone do módulo'
                        aspectRatio='square'
                      />
                    </FormControl>
                    <FormDescription>Recomendado: 128x128px</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        label='Thumbnail do módulo'
                        aspectRatio='video'
                      />
                    </FormControl>
                    <FormDescription>Recomendado: 300x200px</FormDescription>
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
              <CardDescription>Status e disponibilidade.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
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
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>Visível no app</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='allZoneService'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-3'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel>Todas as Zonas</FormLabel>
                        <FormDescription>
                          Disponível em todas as zonas automaticamente
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='themeId'
                render={({ field }) => (
                  <FormItem className='max-w-xs'>
                    <FormLabel>Tema</FormLabel>
                    <FormControl>
                      <Input {...field} type='number' min='1' />
                    </FormControl>
                    <FormDescription>ID do tema visual</FormDescription>
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
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {isUpdate ? 'Atualizar' : 'Criar Módulo'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
