import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useRejectLoan } from '../hooks/use-loan-mutations'

// Schema de validação para rejeição
const rejectionSchema = z.object({
  analysisNote: z
    .string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .refine(
      (val) => val.trim().length >= 10,
      'Motivo deve ter pelo menos 10 caracteres válidos'
    ),
})

type RejectionFormData = z.infer<typeof rejectionSchema>

interface LoanRejectionDialogProps {
  loanId: string
  amountRequested: string
  userName: string
  children: React.ReactNode
}

export function LoanRejectionDialog({
  loanId,
  amountRequested,
  userName,
  children,
}: LoanRejectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<RejectionFormData | null>(null)

  const rejectLoanMutation = useRejectLoan()

  const form = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      analysisNote: '',
    },
  })

  const onSubmit = (data: RejectionFormData) => {
    setFormData(data)
    setShowConfirmation(true)
  }

  const handleConfirmRejection = () => {
    if (!formData) return

    rejectLoanMutation.mutate(
      { loanRequestId: loanId, data: formData },
      {
        onSuccess: () => {
          setOpen(false)
          setShowConfirmation(false)
          form.reset()
        },
      }
    )
  }

  const watchedNote = form.watch('analysisNote')
  const charCount = watchedNote.length

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        {!showConfirmation ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Rejeitar Empréstimo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Informe o motivo da rejeição para <strong>{userName}</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Valor solicitado: {Number(amountRequested).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="analysisNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Rejeição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva detalhadamente o motivo da rejeição do empréstimo..."
                          className="min-h-[120px] resize-none"
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Explique claramente o motivo para orientar o cliente</span>
                        <span className={`text-sm ${charCount > 450 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {charCount}/500
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sugestões de motivos comuns */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Motivos Comuns:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <button
                      type="button"
                      className="text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted-foreground"
                      onClick={() => form.setValue('analysisNote', 'Documentação incompleta ou ilegível')}
                    >
                      • Documentação incompleta
                    </button>
                    <button
                      type="button"
                      className="text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted-foreground"
                      onClick={() => form.setValue('analysisNote', 'Renda insuficiente para o valor solicitado')}
                    >
                      • Renda insuficiente
                    </button>
                    <button
                      type="button"
                      className="text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted-foreground"
                      onClick={() => form.setValue('analysisNote', 'Histórico de crédito negativo')}
                    >
                      • Histórico de crédito
                    </button>
                    <button
                      type="button"
                      className="text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted-foreground"
                      onClick={() => form.setValue('analysisNote', 'Informações inconsistentes nos documentos')}
                    >
                      • Informações inconsistentes
                    </button>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!form.formState.isValid}
                  >
                    Continuar
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Rejeição
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja rejeitar este empréstimo?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">
                Detalhes da Rejeição
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <strong>{userName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor solicitado:</span>
                  <strong>
                    {Number(amountRequested).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
                <div className="pt-2">
                  <span className="font-semibold">Motivo:</span>
                  <p className="mt-1 p-2 bg-white dark:bg-red-900/50 rounded border text-red-900 dark:text-red-100">
                    {formData?.analysisNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O empréstimo será rejeitado
                permanentemente e o cliente será notificado com o motivo informado.
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowConfirmation(false)}
                disabled={rejectLoanMutation.isPending}
              >
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRejection}
                disabled={rejectLoanMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectLoanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejeitando...
                  </>
                ) : (
                  'Confirmar Rejeição'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}