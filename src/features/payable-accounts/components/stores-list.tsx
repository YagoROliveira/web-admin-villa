import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Store as StoreIcon, Mail, Phone, TrendingUp, Grid3x3, List } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Store } from '../types'

interface StoresListProps {
  stores: Store[]
  isLoading: boolean
  onSelectStore: (storeId: number) => void
}

export function StoresList({ stores, isLoading, onSelectStore }: StoresListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (isLoading) {
    return <div className='py-8 text-center text-muted-foreground'>Carregando lojas...</div>
  }

  if (!stores || stores.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        Nenhuma loja parceira encontrada.
      </div>
    )
  }

  // Filtrar lojas por nome
  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='space-y-6'>
      {/* Header com busca */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold'>Lojas Parceiras</h2>
          <p className='text-sm text-muted-foreground'>
            Selecione uma loja para visualizar os relatórios de pagamento
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar loja...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <div className='flex gap-1 border rounded-lg p-1'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='h-8 w-8 p-0'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className='text-sm text-muted-foreground'>
        {filteredStores.length} de {stores.length} lojas
      </div>

      {/* Grid de lojas */}
      {viewMode === 'grid' && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              className='hover:border-primary cursor-pointer transition-all hover:shadow-md'
              onClick={() => onSelectStore(store.id)}
            >
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <StoreIcon className='h-5 w-5 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <CardTitle className='text-base font-semibold line-clamp-1'>
                      {store.name}
                    </CardTitle>
                    <Badge
                      variant={store.status === 1 ? 'default' : 'secondary'}
                      className='mt-1'
                    >
                      {store.status === 1 ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                {/* Email */}
                {store.email && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground truncate'>{store.email}</span>
                  </div>
                )}

                {/* Telefone */}
                {store.phone && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span className='text-muted-foreground'>{store.phone}</span>
                  </div>
                )}

                {/* Taxas */}
                <div className='pt-2 border-t'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Comissão</span>
                    <div className='flex items-center gap-1 font-semibold text-primary'>
                      <TrendingUp className='h-3 w-3' />
                      {store.comission}%
                    </div>
                  </div>
                  {store.tax > 0 && (
                    <div className='flex items-center justify-between text-sm mt-1'>
                      <span className='text-muted-foreground'>Taxa adicional</span>
                      <span className='font-semibold'>{store.tax}%</span>
                    </div>
                  )}
                </div>

                {/* Botão */}
                <Button className='w-full mt-2' onClick={() => onSelectStore(store.id)}>
                  Ver Relatórios
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de lojas */}
      {viewMode === 'list' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className='text-right'>Comissão</TableHead>
                <TableHead className='text-right'>Taxa</TableHead>
                <TableHead className='text-right'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow
                  key={store.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => onSelectStore(store.id)}
                >
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <StoreIcon className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>{store.name}</p>
                        {store.email && (
                          <p className='text-xs text-muted-foreground'>{store.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.status === 1 ? 'default' : 'secondary'}>
                      {store.status === 1 ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {store.phone && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Phone className='h-3 w-3 text-muted-foreground' />
                        <span>{store.phone}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1 font-semibold text-primary'>
                      <TrendingUp className='h-3 w-3' />
                      {store.comission}%
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    {store.tax > 0 ? `${store.tax}%` : '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectStore(store.id)
                      }}
                    >
                      Ver Relatórios
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Mensagem se não encontrar */}
      {filteredStores.length === 0 && (
        <div className='text-center py-8 text-muted-foreground'>
          Nenhuma loja encontrada com "{searchTerm}"
        </div>
      )}
    </div>
  )
}
