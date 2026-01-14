import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { useCashback } from './cashback-provider'
import { CashbackType } from '../types'
import { toast } from 'sonner'

const formSchema = z.object({
  orderId: z.string().min(1, 'ID do pedido é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  orderAmountReais: z.string().min(1, 'Valor do pedido é obrigatório'),
  cashbackPercentage: z.string().optional(),
  cashbackType: z.nativeEnum(CashbackType).optional(),
  campaignId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateCashbackDialog() {
  const [open, setOpen] = useState(false)
  const { processCashback } = useCashback()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: '',
      userId: '',
      orderAmountReais: '',
      cashbackPercentage: '',
      cashbackType: CashbackType.PERCENTAGE,
      campaignId: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const orderAmountCents = Math.round(
        parseFloat(values.orderAmountReais) * 100
      )
      const cashbackPercentage = values.cashbackPercentage
        ? parseFloat(values.cashbackPercentage)
        : undefined

      await processCashback({
        orderId: values.orderId,
        userId: values.userId,
        orderAmountCents,
        cashbackPercentage,
        cashbackType: values.cashbackType,
        campaignId: values.campaignId || undefined,
      })

      toast.success('Cashback processado com sucesso!')
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Novo Cashback
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Processar Cashback</DialogTitle>
          <DialogDescription>
            Crie e processe um novo cashback para um pedido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='orderId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Pedido</FormLabel>
                  <FormControl>
                    <Input placeholder='123456' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='userId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder='user_abc123' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='orderAmountReais'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pedido (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='100.00'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor em reais (será convertido para centavos)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cashbackType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cashback</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CashbackType.PERCENTAGE}>
                        Percentual
                      </SelectItem>
                      <SelectItem value={CashbackType.FIXED}>
                        Valor Fixo
                      </SelectItem>
                      <SelectItem value={CashbackType.PROMOTIONAL}>
                        Promocional
                      </SelectItem>
                      <SelectItem value={CashbackType.LOYALTY}>
                        Fidelidade
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cashbackPercentage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentual (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.1'
                      placeholder='2.5'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Deixe vazio para usar o padrão (2.5%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='campaignId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da Campanha (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder='black-friday-2024' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Processando...'
                  : 'Processar Cashback'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
