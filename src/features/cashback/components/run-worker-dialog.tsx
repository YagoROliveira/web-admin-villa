import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CalendarIcon, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CashbackService } from '../api/cashback-service'
import { useAuthStore } from '@/stores/auth-store'

const runWorkerSchema = z.object({
  mode: z.enum(['normal', 'date-range']),
  batchSize: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.mode === 'date-range') {
      return !!data.startDate && !!data.endDate
    }
    return true
  },
  {
    message: 'Data inicial e final são obrigatórias para modo por período',
    path: ['endDate'],
  }
)

type RunWorkerFormValues = z.infer<typeof runWorkerSchema>

interface RunWorkerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RunWorkerDialog({
  open,
  onOpenChange,
  onSuccess,
}: RunWorkerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuthStore()
  const token = auth.accessToken

  const form = useForm<RunWorkerFormValues>({
    resolver: zodResolver(runWorkerSchema),
    defaultValues: {
      mode: 'normal',
      batchSize: '100',
    },
  })

  const mode = form.watch('mode')

  const onSubmit = async (values: RunWorkerFormValues) => {
    setIsLoading(true)

    try {
      const batchSize = values.batchSize ? parseInt(values.batchSize) : undefined

      let response

      if (values.mode === 'date-range' && values.startDate && values.endDate) {
        response = await CashbackService.runWorkerDateRange(
          {
            startDate: format(values.startDate, 'yyyy-MM-dd'),
            endDate: format(values.endDate, 'yyyy-MM-dd'),
            batchSize,
          },
          token
        )
      } else {
        response = await CashbackService.runWorker(
          { batchSize },
          token
        )
      }

      if (response.success && response.data) {
        // Suporta ambos os formatos de resposta da API
        const data = response.data as any
        const processed = data.processedCount ?? data.processed ?? 0
        const skipped = data.skippedCount ?? data.skipped ?? 0
        const failed = data.failedCount ?? data.failed ?? 0
        const total = data.totalOrders ?? data.total ?? 0
        const executionTime = data.executionTime

        // Mensagem customizada baseada nos resultados
        if (processed === 0 && total === 0) {
          toast.info('Worker executado', {
            description: 'Nenhum pedido elegível encontrado no período selecionado.',
            duration: 4000,
          })
        } else if (processed === 0 && total > 0) {
          toast.warning('Worker executado', {
            description: `${total} pedidos encontrados, mas nenhum foi processado (já tinham cashback ou não atendiam os critérios).`,
            duration: 5000,
          })
        } else {
          const parts = [`✅ ${processed} processados`]
          if (skipped > 0) parts.push(`⏭️ ${skipped} ignorados`)
          if (failed > 0) parts.push(`❌ ${failed} falharam`)
          if (executionTime) parts.push(`⏱️ ${executionTime}`)

          toast.success('Worker executado com sucesso!', {
            description: parts.join(' • '),
            duration: 5000,
          })
        }

        onOpenChange(false)
        form.reset()
        onSuccess?.()
      } else {
        toast.error(response.error || 'Erro ao executar worker')
      }
    } catch (error) {
      toast.error('Erro ao executar worker de cashback')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <PlayCircle className='h-5 w-5' />
            Executar Worker de Cashback
          </DialogTitle>
          <DialogDescription>
            Processa cashbacks de pedidos entregues e pagos. O worker verifica
            pedidos elegíveis e cria os cashbacks automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='mode'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Modo de Execução</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='normal' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Normal - Processar todos os pedidos elegíveis
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='date-range' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Por Período - Processar pedidos de um período específico
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'date-range' && (
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Data Inicial</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy', {
                                  locale: ptBR,
                                })
                              ) : (
                                <span>Selecione</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('2020-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Data Final</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy', {
                                  locale: ptBR,
                                })
                              ) : (
                                <span>Selecione</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('2020-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name='batchSize'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho do Lote (Batch Size)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='100'
                      min='1'
                      max='1000'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de pedidos processados por vez. Padrão: 50
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Executando...' : 'Executar Worker'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
