import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Cashback, CashbackStatus, CashbackType } from '../types'
import { cashbackColumns } from './cashback-columns'
import { useCashback } from './cashback-provider'

interface CashbackTableProps {
  data: Cashback[]
}

export function CashbackTable({ data }: CashbackTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  const { pagination, setPagination, fetchCashbacks } = useCashback()

  // Recarrega dados quando paginação mudar
  useEffect(() => {
    fetchCashbacks(undefined, pagination)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  // Calcula o número de páginas baseado no total de itens do servidor
  const pageCount = pagination.totalItems
    ? Math.ceil(pagination.totalItems / pagination.limit)
    : -1

  const table = useReactTable({
    data,
    columns: cashbackColumns,
    pageCount, // Informa o total de páginas para paginação server-side
    manualPagination: true, // Habilita paginação manual (server-side)
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 10,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({
            pageIndex: (pagination.page || 1) - 1,
            pageSize: pagination.limit || 10,
          })
          : updater

      setPagination({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      })
    },
  })

  useEffect(() => {
    const currentPage = table.getState().pagination.pageIndex
    const totalPages = table.getPageCount()
    if (currentPage >= totalPages && totalPages > 0) {
      table.setPageIndex(totalPages - 1)
    }
  }, [table])

  return (
    <div className='space-y-4 max-sm:has-[div[role=toolbar]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filtrar por pedido ou usuário...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Pendente', value: CashbackStatus.PENDING },
              { label: 'Processando', value: CashbackStatus.PROCESSING },
              { label: 'Concluído', value: CashbackStatus.COMPLETED },
              { label: 'Falhou', value: CashbackStatus.FAILED },
              { label: 'Cancelado', value: CashbackStatus.CANCELLED },
              { label: 'Revertido', value: CashbackStatus.REVERSED },
            ],
          },
          {
            columnId: 'cashbackType',
            title: 'Tipo',
            options: [
              { label: 'Percentual', value: CashbackType.PERCENTAGE },
              { label: 'Valor Fixo', value: CashbackType.FIXED },
              { label: 'Promocional', value: CashbackType.PROMOTIONAL },
              { label: 'Fidelidade', value: CashbackType.LOYALTY },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={cashbackColumns.length}
                  className='h-24 text-center'
                >
                  Nenhum cashback encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
