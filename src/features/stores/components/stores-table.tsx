import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Store } from '../data/schema'
import {
  useToggleStoreActive,
  useToggleStoreFeatured,
  useDeleteStore,
  useStore,
} from '../hooks/use-stores'

interface StoresTableProps {
  data: Store[]
  isLoading?: boolean
}

function StoreAvatar({ store }: { store: Store }) {
  // The list endpoint doesn't return logo — fetch detail to get the real URL
  const { data: detail } = useStore(store.id)
  const logoUrl = detail?.logoUrl ?? store.logoUrl
  const [imgError, setImgError] = useState(false)

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={store.name}
        className='h-10 w-10 rounded-full object-cover ring-2 ring-border flex-shrink-0'
        onError={() => setImgError(true)}
      />
    )
  }
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-red-100 text-red-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ]
  const color = colors[parseInt(store.id, 10) % colors.length]
  return (
    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}>
      {store.name.charAt(0).toUpperCase()}
    </div>
  )
}

function InlineToggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <Switch
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
      className='data-[state=checked]:bg-teal-500'
      onClick={(e) => e.stopPropagation()}
    />
  )
}

export function StoresTable({ data, isLoading }: StoresTableProps) {
  const navigate = useNavigate()
  const toggleActive = useToggleStoreActive()
  const toggleFeatured = useToggleStoreFeatured()
  const deleteStore = useDeleteStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/40'>
              <TableHead>Informações da Loja</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className='flex items-center gap-3'><Skeleton className='h-10 w-10 rounded-full' /><Skeleton className='h-4 w-36' /></div></TableCell>
                <TableCell><Skeleton className='h-4 w-28' /></TableCell>
                <TableCell><Skeleton className='h-6 w-10 rounded-full' /></TableCell>
                <TableCell><Skeleton className='h-6 w-10 rounded-full' /></TableCell>
                <TableCell><Skeleton className='h-8 w-24' /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border py-16 text-center'>
        <p className='text-muted-foreground text-sm'>Nenhuma loja encontrada.</p>
      </div>
    )
  }

  return (
    <>
      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/40 hover:bg-muted/40'>
              <TableHead className='w-[40%] font-semibold'>Informações da Loja</TableHead>
              <TableHead className='font-semibold'>Contato</TableHead>
              <TableHead className='font-semibold'>Destaque</TableHead>
              <TableHead className='font-semibold'>Status</TableHead>
              <TableHead className='text-right font-semibold'>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((store) => (
              <TableRow
                key={store.id}
                className='cursor-pointer transition-colors hover:bg-muted/30'
                onClick={() => navigate({ to: '/admin/stores/$storeId', params: { storeId: store.id } })}
              >
                {/* Store info */}
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <StoreAvatar store={store} />
                    <div className='min-w-0'>
                      <p className='truncate font-semibold leading-tight'>{store.name}</p>
                      <p className='text-muted-foreground text-xs'>ID: {store.id}</p>
                      {store.address && (
                        <p className='text-muted-foreground mt-0.5 truncate text-xs max-w-[220px]'>
                          {store.address}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Contact */}
                <TableCell>
                  <div className='space-y-0.5'>
                    {store.email && (
                      <p className='text-sm font-medium truncate max-w-[180px]'>{store.email}</p>
                    )}
                    {store.phone && (
                      <p className='text-primary text-sm font-medium'>{store.phone}</p>
                    )}
                  </div>
                </TableCell>

                {/* Featured toggle */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <InlineToggle
                    checked={store.isFeatured}
                    disabled={toggleFeatured.isPending}
                    onChange={() => toggleFeatured.mutate({ id: store.id, value: !store.isFeatured })}
                  />
                </TableCell>

                {/* Status toggle */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <InlineToggle
                    checked={store.isActive}
                    disabled={toggleActive.isPending}
                    onChange={() => toggleActive.mutate({ id: store.id, value: !store.isActive })}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className='flex items-center justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 rounded-lg border border-amber-300 p-0 text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:border-amber-700 dark:hover:bg-amber-950/40'
                      onClick={() => navigate({ to: '/admin/stores/$storeId', params: { storeId: store.id } })}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 rounded-lg border border-blue-300 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-700 dark:hover:bg-blue-950/40'
                      onClick={() => {
                        navigate({
                          to: '/admin/stores/$storeId/edit',
                          params: { storeId: store.id },
                        })
                      }}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 rounded-lg border border-red-300 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-700 dark:hover:bg-red-950/40'
                      onClick={() => setDeleteId(store.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir loja?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A loja será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                if (deleteId) {
                  deleteStore.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                    onError: () => setDeleteId(null),
                  })
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
