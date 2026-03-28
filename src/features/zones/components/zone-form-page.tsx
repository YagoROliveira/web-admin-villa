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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  PolygonMapPicker,
  type PolygonPoint,
} from '@/components/polygon-map-picker'
import {
  zoneFormSchema,
  type ZoneFormValues,
  type CoordinatePoint,
} from '../data/schema'
import { useCreateZone, useUpdateZone, useZone } from '../hooks/use-zones'

interface Props {
  zoneId?: string
}

/**
 * Convert GeoJSON Polygon (from API) to the flat PolygonPoint[]
 * expected by the form.
 */
function geoJsonToPoints(
  coords: unknown,
): CoordinatePoint[] {
  if (!coords) return []

  // GeoJSON Polygon: { type: 'Polygon', coordinates: [[[lng,lat], ...]] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geo = coords as any
  if (geo?.type === 'Polygon' && Array.isArray(geo.coordinates?.[0])) {
    const ring: number[][] = geo.coordinates[0]
    // GeoJSON closes the ring — drop last duplicate point
    const open =
      ring.length > 1 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring
    return open.map(([lng, lat]) => ({ lat, lng }))
  }

  // Already flat array
  if (Array.isArray(geo) && geo.length > 0 && 'lat' in geo[0]) {
    return geo as CoordinatePoint[]
  }

  return []
}

export function ZoneFormPage({ zoneId }: Props) {
  const navigate = useNavigate()
  const isUpdate = !!zoneId

  const { data: existing, isLoading: loadingZone } = useZone(zoneId ?? '')
  const createZone = useCreateZone()
  const updateZone = useUpdateZone()
  const isPending = createZone.isPending || updateZone.isPending

  const form = useForm<ZoneFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zoneFormSchema) as any,
    defaultValues: {
      name: '',
      displayName: '',
      coordinates: [],
      isActive: true,
      cashOnDelivery: true,
      digitalPayment: true,
      offlinePayment: false,
      deliveryFeeSurge: {
        enabled: false,
        percentage: 0,
        message: '',
      },
    },
  })

  useEffect(() => {
    if (existing && isUpdate) {
      const pts = geoJsonToPoints(existing.coordinates)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const surge = existing.deliveryFeeSurge as any
      form.reset({
        name: existing.name,
        displayName: existing.displayName ?? '',
        coordinates: pts,
        isActive: existing.isActive,
        cashOnDelivery: existing.cashOnDelivery,
        digitalPayment: existing.digitalPayment,
        offlinePayment: existing.offlinePayment,
        deliveryFeeSurge: surge
          ? {
            enabled: surge.enabled ?? false,
            percentage: surge.percentage ?? 0,
            message: surge.message ?? '',
          }
          : { enabled: false, percentage: 0, message: '' },
      })
    }
  }, [existing, isUpdate, form])

  const handleSubmit = (data: ZoneFormValues) => {
    if (isUpdate && zoneId) {
      updateZone.mutate(
        { id: zoneId, data },
        { onSuccess: () => navigate({ to: '/admin/zones' }) },
      )
    } else {
      createZone.mutate(data, {
        onSuccess: () => navigate({ to: '/admin/zones' }),
      })
    }
  }

  const handleBack = () => navigate({ to: '/admin/zones' })

  if (isUpdate && loadingZone) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const surgeEnabled = form.watch('deliveryFeeSurge.enabled')

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
            {isUpdate ? 'Editar Zona' : 'Nova Zona'}
          </h1>
          <p className='text-muted-foreground'>
            {isUpdate
              ? 'Atualize as informações da zona de entrega.'
              : 'Defina uma nova zona de entrega com área no mapa.'}
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
                Nome e identificação da zona.
              </CardDescription>
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
                        <Input {...field} placeholder='Ex: Centro SP' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='displayName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Exibição</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Ex: São Paulo - Centro' />
                      </FormControl>
                      <FormDescription>
                        Nome amigável exibido para os clientes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── Área (Polígono no Mapa) ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Área de Cobertura</CardTitle>
              <CardDescription>
                Desenhe o polígono da zona clicando no mapa. Mínimo 3 pontos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='coordinates'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PolygonMapPicker
                        value={(field.value as PolygonPoint[]) ?? []}
                        onChange={field.onChange}
                        height={400}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Métodos de Pagamento ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>
                Formas de pagamento aceitas nesta zona.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='cashOnDelivery'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Dinheiro na Entrega</FormLabel>
                      <FormDescription>
                        Aceitar pagamento em dinheiro no ato da entrega.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='digitalPayment'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Pagamento Digital</FormLabel>
                      <FormDescription>
                        Aceitar PIX, cartão de crédito e outros meios digitais.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='offlinePayment'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Pagamento Offline</FormLabel>
                      <FormDescription>
                        Aceitar comprovante de pagamento manual.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Taxa de Entrega Extra ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Entrega Extra</CardTitle>
              <CardDescription>
                Acréscimo temporário na taxa de entrega (ex: durante chuva
                forte, pico de demanda).
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='deliveryFeeSurge.enabled'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Ativar Acréscimo</FormLabel>
                      <FormDescription>
                        Adicionar uma porcentagem extra à taxa de entrega.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {surgeEnabled && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='deliveryFeeSurge.percentage'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentagem (%)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              step={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='deliveryFeeSurge.message'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Ex: Taxa extra por chuva forte'
                            />
                          </FormControl>
                          <FormDescription>
                            Exibida ao cliente no checkout.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ─── Configurações ─── */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Zona Ativa</FormLabel>
                      <FormDescription>
                        Apenas zonas ativas são exibidas para clientes e lojas.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Actions ─── */}
          <Separator />
          <div className='flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={handleBack}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Save className='mr-2 h-4 w-4' />
              )}
              {isUpdate ? 'Salvar Alterações' : 'Criar Zona'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
