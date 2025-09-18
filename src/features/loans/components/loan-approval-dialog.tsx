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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useApproveLoan } from '../hooks/use-loan-mutations'

// Schema de validação para aprovação
const approvalSchema = z.object({
  maxInstallments: z
    .number()
    .min(1, 'Número de parcelas deve ser maior que 0')
    .max(60, 'Número máximo de parcelas é 60'),
  interestRate: z
    .number()
    .min(0, 'Taxa de juros deve ser maior ou igual a 0')
    .max(100, 'Taxa de juros deve ser menor que 100%'),
  valueApproved: z
    .number()
    .min(0.01, 'Valor aprovado deve ser maior que zero'),
})

type ApprovalFormData = z.infer<typeof approvalSchema>

interface LoanApprovalDialogProps {
  loanId: string
  amountRequested: string
  userName: string
  children: React.ReactNode
  userId: number | string // Aceitar tanto number quanto string, mas sempre enviar como string
}

export function LoanApprovalDialog({
  loanId,
  amountRequested,
  userName,
  children,
  userId
}: LoanApprovalDialogProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<ApprovalFormData | null>(null)

  const approveLoanMutation = useApproveLoan()

  const form = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      maxInstallments: 12,
      interestRate: 2.5,
      valueApproved: Number(amountRequested) || 0,
    },
  })

  const onSubmit = (data: ApprovalFormData) => {
    setFormData(data)
    setShowConfirmation(true)
  }

  const handleConfirmApproval = () => {
    if (!formData) return

    approveLoanMutation.mutate(
      { loanRequestId: loanId, data: formData, userId: String(userId) },
      {
        onSuccess: () => {
          setOpen(false)
          setShowConfirmation(false)
          form.reset()
        },
      }
    )
  }

  // Calcular valor da parcela estimado
  const calculateInstallmentAmount = (value: number, installments: number, rate: number) => {
    if (installments <= 0) return 0
    const monthlyRate = rate / 100
    if (monthlyRate === 0) return value / installments

    const factor = Math.pow(1 + monthlyRate, installments)
    return (value * monthlyRate * factor) / (factor - 1)
  }

  const watchedValues = form.watch()
  const estimatedInstallment = calculateInstallmentAmount(
    watchedValues.valueApproved || 0,
    watchedValues.maxInstallments || 1,
    watchedValues.interestRate || 0
  )

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        {!showConfirmation ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Aprovar Empréstimo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Configure os parâmetros de aprovação para <strong>{userName}</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Valor solicitado: {Number(amountRequested).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valueApproved"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Aprovado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor que será liberado para o cliente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            placeholder="12"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo de parcelas permitidas (1-60)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros Mensal (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="2.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Taxa de juros mensal aplicada ao empréstimo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Informações de resumo */}
                {watchedValues.valueApproved > 0 && watchedValues.maxInstallments > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Resumo da Aprovação
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Valor aprovado:</span>
                        <Badge variant="secondary">
                          {Number(watchedValues.valueApproved).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Parcelas:</span>
                        <Badge variant="secondary">{watchedValues.maxInstallments}x</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa mensal:</span>
                        <Badge variant="secondary">{watchedValues.interestRate}%</Badge>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Valor estimado da parcela:</span>
                        <Badge>
                          {estimatedInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button type="submit" disabled={!form.formState.isValid}>
                    Continuar
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Confirmar Aprovação
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja aprovar este empréstimo com os seguintes parâmetros?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                Detalhes da Aprovação
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <strong>{userName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor aprovado:</span>
                  <strong>
                    {Number(formData?.valueApproved || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Parcelas máximas:</span>
                  <strong>{formData?.maxInstallments}x</strong>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de juros:</span>
                  <strong>{formData?.interestRate}% a.m.</strong>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Parcela estimada:</span>
                  <strong>
                    {calculateInstallmentAmount(
                      formData?.valueApproved || 0,
                      formData?.maxInstallments || 1,
                      formData?.interestRate || 0
                    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O empréstimo será aprovado
                imediatamente e o cliente será notificado.
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowConfirmation(false)}
                disabled={approveLoanMutation.isPending}
              >
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmApproval}
                disabled={approveLoanMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveLoanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  'Confirmar Aprovação'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}