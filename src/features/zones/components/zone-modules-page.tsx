import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Save, Puzzle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useZone, useZoneModules, useSyncZoneModules } from '../hooks/use-zones'
import { useModules } from '@/features/modules/hooks/use-modules'
import type { ZoneModulePayload } from '../data/schema'
import { MODULE_TYPE_LABELS } from '@/features/modules/data/schema'

interface Props {
  zoneId: string
}

interface ModuleConfig {
  moduleId: string
  moduleName: string
  moduleType: string
  moduleIcon?: string | null
  enabled: boolean
  perKmShippingCharge: number
  minShippingCharge: number
  maxShippingCharge: number
  maxCodAmount: number
}

export function ZoneModulesPage({ zoneId }: Props) {
  const navigate = useNavigate()
  const { data: zone, isLoading: loadingZone } = useZone(zoneId)
  const { data: currentModules, isLoading: loadingModules } =
    useZoneModules(zoneId)
  const { data: allModulesData, isLoading: loadingAll } = useModules(1, 100, '')
  const syncModules = useSyncZoneModules()

  const [configs, setConfigs] = useState<ModuleConfig[]>([])
  const [initialized, setInitialized] = useState(false)

  // Build initial config from all available modules + current assignments
  useEffect(() => {
    if (initialized || loadingAll || loadingModules) return
    if (!allModulesData?.items) return

    const existing = new Map(
      (currentModules ?? []).map((mz) => [
        mz.moduleId,
        {
          perKmShippingCharge: Number(mz.perKmShippingCharge) || 0,
          minShippingCharge: Number(mz.minShippingCharge) || 0,
          maxShippingCharge: Number(mz.maxShippingCharge) || 0,
          maxCodAmount: Number(mz.maxCodAmount) || 0,
        },
      ]),
    )

    const list: ModuleConfig[] = allModulesData.items.map((mod) => {
      const ex = existing.get(mod.id)
      return {
        moduleId: mod.id,
        moduleName: mod.name,
        moduleType: mod.type,
        moduleIcon: mod.icon,
        enabled: !!ex,
        perKmShippingCharge: ex?.perKmShippingCharge ?? 0,
        minShippingCharge: ex?.minShippingCharge ?? 0,
        maxShippingCharge: ex?.maxShippingCharge ?? 0,
        maxCodAmount: ex?.maxCodAmount ?? 0,
      }
    })

    setConfigs(list)
    setInitialized(true)
  }, [allModulesData, currentModules, loadingAll, loadingModules, initialized])

  const handleToggle = (moduleId: string, enabled: boolean) => {
    setConfigs((prev) =>
      prev.map((c) => (c.moduleId === moduleId ? { ...c, enabled } : c)),
    )
  }

  const handleChange = (
    moduleId: string,
    field: keyof Pick<
      ModuleConfig,
      | 'perKmShippingCharge'
      | 'minShippingCharge'
      | 'maxShippingCharge'
      | 'maxCodAmount'
    >,
    value: number,
  ) => {
    setConfigs((prev) =>
      prev.map((c) => (c.moduleId === moduleId ? { ...c, [field]: value } : c)),
    )
  }

  const handleSave = () => {
    const modules: ZoneModulePayload[] = configs
      .filter((c) => c.enabled)
      .map((c) => ({
        moduleId: c.moduleId,
        perKmShippingCharge: c.perKmShippingCharge,
        minShippingCharge: c.minShippingCharge,
        maxShippingCharge: c.maxShippingCharge,
        maxCodAmount: c.maxCodAmount,
      }))

    syncModules.mutate({ zoneId, modules })
  }

  const handleBack = () => navigate({ to: '/admin/zones' })

  const isLoading = loadingZone || loadingModules || loadingAll

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const enabledCount = configs.filter((c) => c.enabled).length

  return (
    <div className='container max-w-5xl py-6'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={handleBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <div className='flex-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Módulos da Zona
            </h1>
            {zone && (
              <Badge variant='outline' className='text-base'>
                {zone.name}
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>
            Selecione os módulos disponíveis nesta zona e configure as taxas de
            entrega individuais por módulo.
          </p>
        </div>
        <Button onClick={handleSave} disabled={syncModules.isPending}>
          {syncModules.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          Salvar ({enabledCount} módulo{enabledCount !== 1 ? 's' : ''})
        </Button>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Puzzle className='mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-muted-foreground'>
              Nenhum módulo cadastrado. Crie módulos primeiro.
            </p>
            <Button
              variant='link'
              onClick={() => navigate({ to: '/admin/modules/new' })}
            >
              Criar Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {configs.map((config) => (
            <Card
              key={config.moduleId}
              className={
                config.enabled
                  ? 'border-primary/30 bg-primary/[0.02]'
                  : 'opacity-60'
              }
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={config.enabled}
                      onCheckedChange={(v) =>
                        handleToggle(config.moduleId, !!v)
                      }
                      id={`mod-${config.moduleId}`}
                    />
                    <div className='flex items-center gap-2'>
                      {config.moduleIcon ? (
                        <img
                          src={config.moduleIcon}
                          alt={config.moduleName}
                          className='h-8 w-8 rounded-md object-cover'
                        />
                      ) : (
                        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold'>
                          {config.moduleName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label
                        htmlFor={`mod-${config.moduleId}`}
                        className='cursor-pointer'
                      >
                        <CardTitle className='text-base'>
                          {config.moduleName}
                        </CardTitle>
                        <CardDescription className='text-xs'>
                          {MODULE_TYPE_LABELS[config.moduleType] ??
                            config.moduleType}
                        </CardDescription>
                      </label>
                    </div>
                  </div>
                  {config.enabled && (
                    <Badge variant='default' className='text-xs'>
                      Ativo
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {config.enabled && (
                <CardContent>
                  <Separator className='mb-4' />
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                    <div className='space-y-1.5'>
                      <Label className='text-xs text-muted-foreground'>
                        Taxa por Km (R$)
                      </Label>
                      <Input
                        type='number'
                        min={0}
                        step={0.01}
                        value={config.perKmShippingCharge}
                        onChange={(e) =>
                          handleChange(
                            config.moduleId,
                            'perKmShippingCharge',
                            Number(e.target.value),
                          )
                        }
                        placeholder='0.00'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs text-muted-foreground'>
                        Taxa Mínima (R$)
                      </Label>
                      <Input
                        type='number'
                        min={0}
                        step={0.01}
                        value={config.minShippingCharge}
                        onChange={(e) =>
                          handleChange(
                            config.moduleId,
                            'minShippingCharge',
                            Number(e.target.value),
                          )
                        }
                        placeholder='0.00'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs text-muted-foreground'>
                        Taxa Máxima (R$)
                      </Label>
                      <Input
                        type='number'
                        min={0}
                        step={0.01}
                        value={config.maxShippingCharge}
                        onChange={(e) =>
                          handleChange(
                            config.moduleId,
                            'maxShippingCharge',
                            Number(e.target.value),
                          )
                        }
                        placeholder='0.00'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs text-muted-foreground'>
                        Máx. Pedido COD (R$)
                      </Label>
                      <Input
                        type='number'
                        min={0}
                        step={0.01}
                        value={config.maxCodAmount}
                        onChange={(e) =>
                          handleChange(
                            config.moduleId,
                            'maxCodAmount',
                            Number(e.target.value),
                          )
                        }
                        placeholder='0.00'
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
