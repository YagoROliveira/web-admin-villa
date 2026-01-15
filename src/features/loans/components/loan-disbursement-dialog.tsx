import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wallet, Loader2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { buildApiUrl, API_CONFIG } from '@/config/api'

// Schema de validação para desembolso
const disbursementSchema = z.object({
  disbursedBy: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  disbursementMethod: z.enum(['PIX', 'TED', 'DOC', 'Dinheiro', 'Outro']),
  disbursementNotes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
})

type DisbursementFormData = z.infer<typeof disbursementSchema>

interface LoanDisbursementDialogProps {
  loanId: string
  userName: string
  valueApproved?: string
  children: React.ReactNode
  onSuccess?: () => void
}

export function LoanDisbursementDialog({
  loanId,
  userName,
  valueApproved,
  children,
  onSuccess,
}: LoanDisbursementDialogProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<DisbursementFormData | null>(null)

  const form = useForm<DisbursementFormData>({
    resolver: zodResolver(disbursementSchema),
    defaultValues: {
      disbursedBy: '',
      disbursementMethod: 'PIX',
      disbursementNotes: '',
    },
  })

  const onSubmit = (data: DisbursementFormData) => {
    setFormData(data)
    setShowConfirmation(true)
  }

  const handleConfirmDisbursement = async () => {
    if (!formData) return

    setIsProcessing(true)

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.MARK_DISBURSED)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanRequestId: loanId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      toast.success(
        result.message || 'Empréstimo marcado como desembolsado com sucesso!'
      )

      // Resetar formulário e fechar diálogo
      setOpen(false)
      setShowConfirmation(false)
      form.reset()

      // Callback de sucesso
      if (onSuccess) {
        onSuccess()
      }

      // Recarregar a página para atualizar os dados
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Erro ao marcar desembolso:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao marcar desembolso'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const watchedNotes = form.watch('disbursementNotes') || ''
  const charCount = watchedNotes.length

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent className='max-w-2xl'>
        {!showConfirmation ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2 text-green-600'>
                <Wallet className='h-5 w-5' />
                Marcar como Desembolsado
              </AlertDialogTitle>
              <AlertDialogDescription>
                Registre o desembolso do empréstimo para{' '}
                <strong>{userName}</strong>
                {valueApproved && (
                  <>
                    <br />
                    <span className='text-muted-foreground text-sm'>
                      Valor aprovado:{' '}
                      {Number(valueApproved).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='disbursedBy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável pelo Desembolso *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ex: João Silva'
                          maxLength={100}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nome da pessoa que realizou o pagamento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='disbursementMethod'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Desembolso *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecione o método' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='PIX'>PIX</SelectItem>
                          <SelectItem value='TED'>TED</SelectItem>
                          <SelectItem value='DOC'>DOC</SelectItem>
                          <SelectItem value='Dinheiro'>Dinheiro</SelectItem>
                          <SelectItem value='Outro'>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Como o valor foi transferido ao cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='disbursementNotes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Ex: Depositado via PIX às 14:30 no banco Itaú'
                          className='min-h-[100px] resize-none'
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='flex justify-between'>
                        <span>Informações adicionais sobre o desembolso</span>
                        <span
                          className={`text-sm ${charCount > 450 ? 'text-red-500' : 'text-muted-foreground'}`}
                        >
                          {charCount}/500
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sugestões rápidas */}
                <div className='rounded-lg border bg-gray-50 p-4 dark:bg-gray-900'>
                  <h4 className='mb-2 text-sm font-semibold'>
                    Sugestões de Observações:
                  </h4>
                  <div className='grid grid-cols-1 gap-2 text-sm md:grid-cols-2'>
                    <button
                      type='button'
                      className='text-muted-foreground rounded p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                      onClick={() =>
                        form.setValue(
                          'disbursementNotes',
                          'Depositado via PIX às ' +
                          new Date().toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        )
                      }
                    >
                      • PIX com horário atual
                    </button>
                    <button
                      type='button'
                      className='text-muted-foreground rounded p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                      onClick={() =>
                        form.setValue(
                          'disbursementNotes',
                          'Transferência bancária realizada com sucesso'
                        )
                      }
                    >
                      • Transferência bancária
                    </button>
                    <button
                      type='button'
                      className='text-muted-foreground rounded p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                      onClick={() =>
                        form.setValue(
                          'disbursementNotes',
                          'Valor depositado conforme dados bancários fornecidos'
                        )
                      }
                    >
                      • Dados bancários
                    </button>
                    <button
                      type='button'
                      className='text-muted-foreground rounded p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                      onClick={() =>
                        form.setValue(
                          'disbursementNotes',
                          'Pagamento efetuado conforme solicitado'
                        )
                      }
                    >
                      • Pagamento efetuado
                    </button>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button
                    type='submit'
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Wallet className='mr-2 h-4 w-4' />
                    Confirmar Desembolso
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-yellow-600' />
                Confirmar Desembolso
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a marcar este empréstimo como{' '}
                <strong>DESEMBOLSADO</strong>.
                <br />
                <br />
                <strong>Cliente:</strong> {userName}
                {valueApproved && (
                  <>
                    <br />
                    <strong>Valor:</strong>{' '}
                    {Number(valueApproved).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </>
                )}
                <br />
                <strong>Responsável:</strong> {formData?.disbursedBy}
                <br />
                <strong>Método:</strong> {formData?.disbursementMethod}
                {formData?.disbursementNotes && (
                  <>
                    <br />
                    <strong>Observações:</strong> {formData.disbursementNotes}
                  </>
                )}
                <br />
                <br />
                Esta ação indica que a empresa pagou o valor ao cliente. O
                cliente receberá uma notificação push automaticamente.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
              >
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDisbursement}
                disabled={isProcessing}
                className='bg-green-600 hover:bg-green-700'
              >
                {isProcessing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wallet className='mr-2 h-4 w-4' />
                    Confirmar Desembolso
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
