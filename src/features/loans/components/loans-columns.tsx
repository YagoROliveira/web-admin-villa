import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loan } from '../data/schema'
import { LoansRowActions } from './loans-row-actions'

export const loansColumns: ColumnDef<Loan>[] = [
  {
    accessorKey: 'solicitante',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-muted'
        >
          Solicitante
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </Button>
      )
    },
    cell: (info) => {
      const value = info.getValue() as string
      return value ? value.toUpperCase() : ''
    },
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-muted'
        >
          Valor
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </Button>
      )
    },
    cell: (info) => {
      const value = Number(info.getValue())
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      })
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-muted'
        >
          Status
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </Button>
      )
    },
    cell: (info) => {
      const value = info.getValue() as string
      let label = value
      let colorClass = ''
      switch (value) {
        case 'Aprovado':
        case 'APPROVED':
          colorClass = 'bg-green-100 text-green-800'
          label = 'Aprovado'
          break
        case 'Pendente':
        case 'PENDING':
          colorClass = 'bg-orange-100 text-orange-800'
          label = 'Pendente'
          break
        case 'Recusado':
        case 'REJECTED':
          colorClass = 'bg-red-100 text-red-800'
          label = 'Recusado'
          break
        default:
          colorClass = 'bg-secondary text-secondary-foreground'
      }
      return <Badge className={colorClass}>{label}</Badge>
    },
  },
  {
    accessorKey: 'dataSolicitacao',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='hover:bg-muted'
        >
          Data da Solicitação
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4' />
          )}
        </Button>
      )
    },
    cell: (info) => {
      const value = info.getValue() as string
      if (!value) return ''
      // Garante que o valor é uma string ISO válida
      // Exemplo: 2025-08-20T22:11:25.043Z
      try {
        const date = new Date(value)
        if (isNaN(date.getTime())) return value // Se não for válida, mostra o valor cru
        // Exibe data e hora completas (com segundos)
        const dia = date.toLocaleDateString('pt-BR')
        const hora = date.toLocaleTimeString('pt-BR', {
          hour12: false,
          timeZone: 'America/Sao_Paulo',
        })
        return `${dia} ${hora}`
      } catch {
        return value
      }
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      // Aqui você pode passar funções reais para cada ação
      return (
        <div className='flex justify-end'>
          <LoansRowActions
            onAnalyze={() => {
              /* implementar ação de analisar */
            }}
            onReject={() => {
              /* implementar ação de recusar */
            }}
            onRequestDocs={() => {
              /* implementar ação de solicitar documentos */
            }}
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
