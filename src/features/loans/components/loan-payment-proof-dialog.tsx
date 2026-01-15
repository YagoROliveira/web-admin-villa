import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, Loader2, FileCheck, AlertTriangle } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { buildApiUrl, API_CONFIG } from '@/config/api'

// Schema de validação para upload de comprovante
const paymentProofSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Selecione um arquivo')
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      'O arquivo deve ter no máximo 5MB'
    )
    .refine(
      (files) =>
        ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(
          files[0]?.type
        ),
      'Apenas arquivos JPG, PNG ou PDF são permitidos'
    ),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
})

type PaymentProofFormData = z.infer<typeof paymentProofSchema>

interface LoanPaymentProofDialogProps {
  loanId: string
  userName: string
  amountPaid?: string
  children: React.ReactNode
  onSuccess?: () => void
}

export function LoanPaymentProofDialog({
  loanId,
  userName,
  amountPaid,
  children,
  onSuccess,
}: LoanPaymentProofDialogProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  const form = useForm<PaymentProofFormData>({
    resolver: zodResolver(paymentProofSchema),
  })

  const onSubmit = async (data: PaymentProofFormData) => {
    setShowConfirmation(true)
  }

  const handleConfirmUpload = async () => {
    const formData = form.getValues()
    const file = formData.file[0]

    if (!file) return

    setIsUploading(true)

    try {
      // Preparar FormData para envio
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('loanRequestId', loanId)
      uploadData.append('documentType', 'PAYMENT_PROOF')
      if (formData.notes) {
        uploadData.append('notes', formData.notes)
      }

      // Fazer upload do comprovante
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.UPLOAD_PAYMENT_PROOF)
      const response = await fetch(url, {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      toast.success('Comprovante enviado com sucesso!')

      // Resetar formulário e fechar diálogo
      setOpen(false)
      setShowConfirmation(false)
      form.reset()
      setSelectedFileName('')

      // Callback de sucesso
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar comprovante de pagamento'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent className='max-w-2xl'>
        {!showConfirmation ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2 text-blue-600'>
                <Upload className='h-5 w-5' />
                Adicionar Comprovante de Pagamento
              </AlertDialogTitle>
              <AlertDialogDescription>
                Envie o comprovante de pagamento para{' '}
                <strong>{userName}</strong>
                {amountPaid && (
                  <>
                    <br />
                    <span className='text-muted-foreground text-sm'>
                      Valor:{' '}
                      {Number(amountPaid).toLocaleString('pt-BR', {
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
                  name='file'
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Comprovante de Pagamento</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <Input
                            type='file'
                            accept='image/jpeg,image/png,image/jpg,application/pdf'
                            onChange={(e) => {
                              onChange(e.target.files)
                              handleFileChange(e)
                            }}
                            {...field}
                          />
                          {selectedFileName && (
                            <p className='text-sm text-muted-foreground flex items-center gap-2'>
                              <FileCheck className='h-4 w-4 text-green-600' />
                              {selectedFileName}
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Formatos aceitos: JPG, PNG ou PDF (máximo 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Adicione observações sobre o pagamento...'
                          className='min-h-[80px] resize-none'
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Informações adicionais sobre o comprovante
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                    <Upload className='mr-2 h-4 w-4' />
                    Enviar Comprovante
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
                Confirmar Upload
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja enviar este comprovante de pagamento?
                <br />
                <br />
                <strong>Cliente:</strong> {userName}
                <br />
                <strong>Arquivo:</strong> {selectedFileName}
                {amountPaid && (
                  <>
                    <br />
                    <strong>Valor:</strong>{' '}
                    {Number(amountPaid).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowConfirmation(false)}
                disabled={isUploading}
              >
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {isUploading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className='mr-2 h-4 w-4' />
                    Confirmar Upload
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
