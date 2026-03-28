'use client'

import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { type Customer } from '../data/schema'
import { useUpdateCustomer } from '../hooks/use-customers'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  phone: z.string().optional(),
  email: z.string().email('Informe um email válido.'),
  isEdit: z.boolean(),
})
type FormData = z.infer<typeof formSchema>

type CustomersActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Customer | null
}

export function CustomersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: CustomersActionDialogProps) {
  const isEdit = !!currentRow
  const updateCustomerMutation = useUpdateCustomer()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      isEdit,
    },
  })

  useEffect(() => {
    if (currentRow && isEdit) {
      form.reset({
        name: currentRow.name,
        phone: currentRow.phone ?? '',
        email: currentRow.email ?? '',
        isEdit: true,
      })
    }
  }, [currentRow, isEdit, form])

  const onSubmit = async (values: FormData) => {
    if (isEdit && currentRow) {
      try {
        await updateCustomerMutation.mutateAsync({
          id: currentRow.id,
          data: {
            name: values.name,
            email: values.email,
            phone: values.phone,
          },
        })
        form.reset()
        onOpenChange(false)
      } catch (error) {
        // handled by mutation
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações do cliente.'
              : 'Preencha as informações do novo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='customer-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 p-0.5'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nome do cliente'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='email@exemplo.com'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-right'>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='(11) 99999-9999'
                      className='col-span-4'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='customer-form'
            disabled={updateCustomerMutation.isPending}
          >
            {updateCustomerMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
