'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'

const formSchema = z.object({
  status: z.string().min(1, 'Status é obrigatório.'),
  reason: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres.'),
})

type StatusChangeForm = z.infer<typeof formSchema>

type LoanStatusChangeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: StatusChangeForm) => void
}

const statusOptions = [
  { label: 'Aprovado', value: 'approved' },
  { label: 'Recusado', value: 'rejected' },
  { label: 'Cancelado', value: 'canceled' },
  { label: 'Desistência', value: 'abandoned' },
]

export function LoanStatusChangeDialog({
  open,
  onOpenChange,
  onSubmit,
}: LoanStatusChangeDialogProps) {
  const form = useForm<StatusChangeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: '',
      reason: '',
    },
  })

  const handleSubmit = (values: StatusChangeForm) => {
    onSubmit?.(values)
    form.reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Alterar Status do Empréstimo</DialogTitle>
          <DialogDescription>
            Selecione o novo status e informe o motivo da alteração.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='status-change-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Selecione um status'
                    items={statusOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Alteração</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Descreva o motivo da alteração de status...'
                      className='min-h-24 resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button type='submit' form='status-change-form'>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
