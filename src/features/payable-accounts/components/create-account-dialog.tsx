import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { payableAccountService } from '../services/api'
import type { CreatePayableAccountRequest } from '../types'

interface CreateAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAccountDialog({
  open,
  onOpenChange,
}: CreateAccountDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<CreatePayableAccountRequest>>({
    gross_amount: 0,
    discounts: 0,
    fees: 0,
    net_amount: 0,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePayableAccountRequest) =>
      payableAccountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payable-accounts'] })
      onOpenChange(false)
      setFormData({
        gross_amount: 0,
        discounts: 0,
        fees: 0,
        net_amount: 0,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as CreatePayableAccountRequest)
  }

  const calculateNetAmount = () => {
    const gross = formData.gross_amount || 0
    const discounts = formData.discounts || 0
    const fees = formData.fees || 0
    const net = gross - discounts - fees
    setFormData({ ...formData, net_amount: net })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
          <DialogDescription>
            Crie uma nova conta a pagar para um fornecedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='store_id'>ID da Loja *</Label>
              <Input
                id='store_id'
                type='number'
                required
                value={formData.store_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store_id: Number(e.target.value) })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='invoice_number'>Número da Fatura</Label>
              <Input
                id='invoice_number'
                value={formData.invoice_number || ''}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Descrição *</Label>
            <Input
              id='description'
              required
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reference_month'>Mês de Referência (YYYY-MM) *</Label>
            <Input
              id='reference_month'
              placeholder='2026-01'
              required
              value={formData.reference_month || ''}
              onChange={(e) =>
                setFormData({ ...formData, reference_month: e.target.value })
              }
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='gross_amount'>Valor Bruto *</Label>
              <Input
                id='gross_amount'
                type='number'
                step='0.01'
                required
                value={formData.gross_amount}
                onChange={(e) =>
                  setFormData({ ...formData, gross_amount: Number(e.target.value) })
                }
                onBlur={calculateNetAmount}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='discounts'>Descontos</Label>
              <Input
                id='discounts'
                type='number'
                step='0.01'
                value={formData.discounts}
                onChange={(e) =>
                  setFormData({ ...formData, discounts: Number(e.target.value) })
                }
                onBlur={calculateNetAmount}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='fees'>Taxas</Label>
              <Input
                id='fees'
                type='number'
                step='0.01'
                value={formData.fees}
                onChange={(e) =>
                  setFormData({ ...formData, fees: Number(e.target.value) })
                }
                onBlur={calculateNetAmount}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='net_amount'>Valor Líquido *</Label>
              <Input
                id='net_amount'
                type='number'
                step='0.01'
                required
                value={formData.net_amount}
                onChange={(e) =>
                  setFormData({ ...formData, net_amount: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='issue_date'>Data de Emissão *</Label>
              <Input
                id='issue_date'
                type='date'
                required
                value={formData.issue_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='due_date'>Data de Vencimento *</Label>
              <Input
                id='due_date'
                type='date'
                required
                value={formData.due_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Observações</Label>
            <Textarea
              id='notes'
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Conta'}
            </Button>
          </DialogFooter>

          {createMutation.isError && (
            <p className='text-sm text-destructive'>
              Erro ao criar conta: {String(createMutation.error)}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
