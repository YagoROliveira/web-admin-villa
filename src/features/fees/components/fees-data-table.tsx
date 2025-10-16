import React from 'react'
import { MoreHorizontal, Edit, Trash2, Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Fee,
  FeeTypeLabels,
  CalculationTypeLabels,
  AppliesToLabels,
  CardBrandLabels,
} from '../data/schema'
import { useDeleteFee } from '../hooks/use-fees-api'

interface FeesDataTableProps {
  data: Fee[]
  isLoading?: boolean
}

export function FeesDataTable({ data, isLoading }: FeesDataTableProps) {
  const deleteFee = useDeleteFee()

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta taxa?')) {
      deleteFee.mutate(id.toString())
    }
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Ativa' : 'Inativa'}
    </Badge>
  )

  const getScopeBadge = (
    appliesTo: string,
    userId?: string,
    cardBrand?: string
  ) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
    let text = AppliesToLabels[appliesTo as keyof typeof AppliesToLabels]

    if (appliesTo === 'USER_SPECIFIC' && userId) {
      variant = 'secondary'
      text = `User: ${userId.slice(0, 8)}...` as any
    } else if (appliesTo === 'BRAND_SPECIFIC' && cardBrand) {
      variant = 'outline'
      text = CardBrandLabels[cardBrand as keyof typeof CardBrandLabels] as any
    }

    return <Badge variant={variant}>{text}</Badge>
  }

  const formatValue = (value: number, calculationType: string) => {
    if (calculationType === 'PERCENTAGE') {
      return `${value}%`
    }
    return formatCurrency(value)
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='flex items-center space-x-4'>
            <Skeleton className='h-12 w-12' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-[250px]' />
              <Skeleton className='h-4 w-[200px]' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='text-muted-foreground flex h-32 flex-col items-center justify-center'>
        <Calculator className='mb-2 h-8 w-8' />
        <p>Nenhuma taxa encontrada</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cálculo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Aplicação</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-[70px]'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((fee) => (
            <TableRow key={fee.id}>
              <TableCell className='font-medium'>
                <div className='space-y-1'>
                  <div>{fee.name}</div>
                  {fee.description && (
                    <div className='text-muted-foreground text-sm'>
                      {fee.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>
                  {FeeTypeLabels[fee.fee_type as keyof typeof FeeTypeLabels]}
                </Badge>
              </TableCell>
              <TableCell>
                {
                  CalculationTypeLabels[
                    fee.calculation_type as keyof typeof CalculationTypeLabels
                  ]
                }
              </TableCell>
              <TableCell className='font-mono'>
                {formatValue(fee.value, fee.calculation_type)}
              </TableCell>
              <TableCell>
                {getScopeBadge(fee.applies_to, fee.user_id, fee.card_brand)}
              </TableCell>
              <TableCell className='text-muted-foreground text-sm'>
                {fee.min_installments} - {fee.max_installments}x
              </TableCell>
              <TableCell>{getStatusBadge(fee.is_active)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <span className='sr-only'>Abrir menu</span>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive'
                      onClick={() => handleDelete(fee.id!)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
