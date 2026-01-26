import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { buildApiUrl, API_CONFIG } from '@/config/api'

const notificationSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(100, 'Título deve ter no máximo 100 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres').max(500, 'Mensagem deve ter no máximo 500 caracteres'),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface LoanNotificationDialogProps {
  loanRequestId: string
  userName: string
  overdueAmount?: number
  overdueDays?: number
}

export function LoanNotificationDialog({
  loanRequestId,
  userName,
  overdueAmount,
  overdueDays,
}: LoanNotificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { auth } = useAuthStore()

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: 'Empréstimo em Atraso',
      message: '',
    },
  })

  // Gera mensagem automática quando o diálogo abre
  useEffect(() => {
    if (isOpen) {
      const defaultMessage = generateDefaultMessage(userName, overdueAmount, overdueDays)
      form.setValue('message', defaultMessage)
    }
  }, [isOpen, userName, overdueAmount, overdueDays, form])

  const generateDefaultMessage = (name: string, amount?: number, days?: number) => {
    const firstName = name.split(' ')[0]

    if (amount && days) {
      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)

      return `Olá ${firstName}! Identificamos que seu empréstimo está em atraso há ${days} ${days === 1 ? 'dia' : 'dias'}, no valor de ${formattedAmount}. Informamos que, ao atingir 30 dias de inadimplência, o débito poderá ser encaminhado para Serasa e SPC, além da incidência de juros diários. Para evitar encargos e restrições, entre em contato imediatamente pelo chat do aplicativo Villa Market e regularize sua situação.`
    }

    return `Olá ${firstName}! Entre em contato conosco pelo chat do aplicativo Villa Market para tratar sobre seu empréstimo.`
  }

  const onSubmit = async (data: NotificationFormData) => {
    if (!auth.user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.SEND_NOTIFICATION),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            loanRequestId,
            title: data.title,
            message: data.message,
            sentBy: auth.user.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao enviar notificação')
      }

      toast.success('Notificação enviada com sucesso!')
      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar notificação. Tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateMessage = () => {
    const message = generateDefaultMessage(userName, overdueAmount, overdueDays)
    form.setValue('message', message)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Send className='mr-2 h-4 w-4' />
          Notificar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Enviar Notificação Manual</DialogTitle>
          <DialogDescription>
            Envie uma notificação push para {userName} sobre o empréstimo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Notificação</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Empréstimo em Atraso' {...field} />
                  </FormControl>
                  <FormDescription>
                    Título que aparecerá na notificação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Digite a mensagem da notificação...'
                      className='min-h-[150px] resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mensagem que será enviada ao usuário
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={handleGenerateMessage}
              className='w-full'
            >
              Gerar Mensagem Automática
            </Button>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
