import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  FeeTypeLabels,
  CalculationTypeLabels,
  AppliesToLabels,
  CardBrandLabels,
  type Fee,
} from '../data/schema'
import { useUpdateFee } from '../hooks/use-fees-api'

interface EditFeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee: Fee | null
}

export function EditFeeDialog({ open, onOpenChange, fee }: EditFeeDialogProps) {
  const updateFee = useUpdateFee()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fee_type: 'SERVICE' as
      | 'INSTALLMENT'
      | 'PROCESSING'
      | 'SERVICE'
      | 'BUS_TICKET'
      | 'BUS_INSURANCE',
    calculation_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0,
    min_installments: 2,
    max_installments: 12,
    applies_to: 'GENERAL' as 'GENERAL' | 'USER_SPECIFIC' | 'BRAND_SPECIFIC',
    user_id: '',
    card_brand: '' as
      | 'Visa'
      | 'Master'
      | 'Elo'
      | 'Amex'
      | 'Hipercard'
      | 'Diners'
      | '',
    is_active: true,
    priority: 0,
  })

  // Reset form data when fee changes
  useEffect(() => {
    if (fee) {
      setFormData({
        name: fee.name,
        description: fee.description || '',
        fee_type: fee.fee_type,
        calculation_type: fee.calculation_type,
        value: fee.value,
        min_installments: fee.min_installments || 2,
        max_installments: fee.max_installments || 12,
        applies_to: fee.applies_to,
        user_id: fee.user_id || '',
        card_brand: fee.card_brand || '',
        is_active: fee.is_active,
        priority: fee.priority || 0,
      })
    }
  }, [fee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fee) return

    try {
      const data: any = {
        name: formData.name,
        description: formData.description || undefined,
        feeType: formData.fee_type,
        calculationType: formData.calculation_type,
        value: formData.value,
        minInstallments: formData.min_installments,
        maxInstallments: formData.max_installments,
        appliesTo: formData.applies_to,
        isActive: formData.is_active,
        priority: formData.priority,
      }

      if (formData.applies_to === 'USER_SPECIFIC' && formData.user_id) {
        data.userId = formData.user_id
      }

      if (formData.applies_to === 'BRAND_SPECIFIC' && formData.card_brand) {
        data.cardBrand = formData.card_brand
      }

      await updateFee.mutateAsync({ id: fee.id.toString(), data })

      // Aguardar um pouco para garantir que o refetch completou
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!fee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Editar Taxa</DialogTitle>
            <Badge variant={fee.is_active ? 'default' : 'secondary'}>
              {fee.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground text-sm'>ID</Label>
                  <p className='font-mono text-sm'>{fee.id}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground text-sm'>
                    Criado em
                  </Label>
                  <p className='text-sm'>
                    {new Date(fee.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              {fee.updated_at && (
                <div>
                  <Label className='text-muted-foreground text-sm'>
                    Última atualização
                  </Label>
                  <p className='text-sm'>
                    {new Date(fee.updated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome da Taxa</Label>
                <Input
                  id='name'
                  placeholder='Ex: Taxa de Saque'
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Descrição</Label>
                <Textarea
                  id='description'
                  placeholder='Descrição detalhada da taxa...'
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Tipo da Taxa</Label>
                  <Select
                    value={formData.fee_type}
                    onValueChange={(value) => updateField('fee_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FeeTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Tipo de Cálculo</Label>
                  <Select
                    value={formData.calculation_type}
                    onValueChange={(value) =>
                      updateField('calculation_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CalculationTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores e Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Valores e Configurações</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='value'>
                  Valor{' '}
                  {formData.calculation_type === 'PERCENTAGE' ? '(%)' : '(R$)'}
                </Label>
                <Input
                  id='value'
                  type='number'
                  step='0.01'
                  placeholder={
                    formData.calculation_type === 'PERCENTAGE' ? '2.5' : '15.00'
                  }
                  value={formData.value || ''}
                  onChange={(e) =>
                    updateField('value', parseFloat(e.target.value) || 0)
                  }
                  required
                />
                <p className='text-muted-foreground text-sm'>
                  {formData.calculation_type === 'PERCENTAGE'
                    ? 'Percentual a ser aplicado sobre o valor'
                    : 'Valor fixo em reais'}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='minInstallments'>Parcelas Mínimas</Label>
                  <Input
                    id='minInstallments'
                    type='number'
                    min='1'
                    max='36'
                    value={formData.min_installments}
                    onChange={(e) =>
                      updateField(
                        'min_installments',
                        parseInt(e.target.value) || 2
                      )
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='maxInstallments'>Parcelas Máximas</Label>
                  <Input
                    id='maxInstallments'
                    type='number'
                    min='1'
                    max='36'
                    value={formData.max_installments}
                    onChange={(e) =>
                      updateField(
                        'max_installments',
                        parseInt(e.target.value) || 12
                      )
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='priority'>Prioridade</Label>
                <Input
                  id='priority'
                  type='number'
                  min='0'
                  value={formData.priority}
                  onChange={(e) =>
                    updateField('priority', parseInt(e.target.value) || 0)
                  }
                />
                <p className='text-muted-foreground text-sm'>
                  Prioridade da taxa (maior número = maior prioridade)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aplicação da Taxa */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Aplicação da Taxa</CardTitle>
              <CardDescription>
                Configure onde e como esta taxa será aplicada
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Aplica-se a</Label>
                <Select
                  value={formData.applies_to}
                  onValueChange={(value) => updateField('applies_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AppliesToLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.applies_to === 'USER_SPECIFIC' && (
                <div className='space-y-2'>
                  <Label htmlFor='user_id'>ID do Usuário</Label>
                  <Input
                    id='user_id'
                    placeholder='ID do usuário específico'
                    value={formData.user_id}
                    onChange={(e) => updateField('user_id', e.target.value)}
                  />
                  <p className='text-muted-foreground text-sm'>
                    ID do usuário para o qual esta taxa se aplica
                  </p>
                </div>
              )}

              {formData.applies_to === 'BRAND_SPECIFIC' && (
                <div className='space-y-2'>
                  <Label>Bandeira do Cartão</Label>
                  <Select
                    value={formData.card_brand}
                    onValueChange={(value) => updateField('card_brand', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione a bandeira' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CardBrandLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <Label className='text-base'>Taxa Ativa</Label>
                  <p className='text-muted-foreground text-sm'>
                    Esta taxa estará disponível para uso imediatamente
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    updateField('is_active', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex justify-end space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={updateFee.isPending}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={updateFee.isPending}>
              {updateFee.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
