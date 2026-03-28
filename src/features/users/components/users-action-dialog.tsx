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
import { PasswordInput } from '@/components/password-input'
import { type User } from '../data/schema'
import { useUpdateUser } from '../hooks/use-users'

const formSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório.'),
    phone: z.string().optional(),
    email: z.string().email('Informe um email válido.'),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Senha é obrigatória.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'A senha deve ter pelo menos 8 caracteres.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: 'As senhas não conferem.',
      path: ['confirmPassword'],
    }
  )
type FormData = z.infer<typeof formSchema>

type UsersActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User | null
}

export function UsersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersActionDialogProps) {
  const isEdit = !!currentRow
  const updateUserMutation = useUpdateUser()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      isEdit,
    },
  })

  const isPasswordTouched = form.formState.touchedFields.password

  useEffect(() => {
    if (currentRow && isEdit) {
      form.reset({
        name: currentRow.name,
        phone: currentRow.phone || '',
        email: currentRow.email ?? '',
        password: '',
        confirmPassword: '',
        isEdit: true,
      })
    } else {
      form.reset({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        isEdit: false,
      })
    }
  }, [currentRow, isEdit, form])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && currentRow) {
        const updateData: Record<string, string> = {
          name: data.name,
          email: data.email,
        }
        if (data.phone) updateData.phone = data.phone
        if (data.password) updateData.password = data.password

        await updateUserMutation.mutateAsync({
          id: currentRow.id,
          data: updateData,
        })
      } else {
        console.warn('Criação de clientes não suportada no admin')
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    }
  }

  const isLoading = updateUserMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações do usuário abaixo.'
              : 'Preencha as informações para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Nome
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='João Silva'
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
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='joao@example.com'
                        className='col-span-4'
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
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+55 11 99999-0000 (opcional)'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Senha {isEdit && '(vazio = manter)'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={
                          isEdit ? 'Deixe vazio para manter' : 'Digite a senha'
                        }
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {(!isEdit || isPasswordTouched) && (
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Confirmar Senha
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='Confirme a senha'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
