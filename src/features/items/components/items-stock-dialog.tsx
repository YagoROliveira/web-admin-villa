import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useItemStock, useUpdateItemStock } from '../hooks/use-items'
import { useItemsContext } from './items-provider'

export function ItemsStockDialog() {
  const { open, setOpen, currentRow } = useItemsContext()
  const isOpen = open === 'stock' && !!currentRow

  const { data: stockData, isLoading } = useItemStock(currentRow?.id ?? '')
  const updateStock = useUpdateItemStock()

  const [stockValues, setStockValues] = useState<Record<number, string>>({})

  useEffect(() => {
    if (stockData?.variations) {
      const initial: Record<number, string> = {}
      stockData.variations.forEach((v) => {
        initial[v.variant_index] = String(v.stock)
      })
      setStockValues(initial)
    }
  }, [stockData])

  function handleClose() {
    setOpen(null)
    setStockValues({})
  }

  function handleUpdate(variantIndex: number) {
    if (!currentRow) return
    const newStock = parseInt(stockValues[variantIndex] ?? '0', 10)
    if (isNaN(newStock)) return
    updateStock.mutate({
      item_id: currentRow.id,
      variant_index: variantIndex,
      stock: newStock,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Gerenciar Estoque
          </DialogTitle>
          <DialogDescription>
            {currentRow?.name ? `Produto: ${currentRow.name}` : 'Atualize o estoque por variante.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => <Skeleton key={i} className='h-10 w-full' />)}
            </div>
          ) : !stockData?.variations?.length ? (
            <div className='rounded-md border p-4 text-center'>
              <p className='text-muted-foreground text-sm'>
                Produto sem variantes ou sem controle de estoque.
              </p>
              {/* Simple stock update for non-variation items */}
              <div className='mt-4 space-y-2'>
                <Label>Estoque total</Label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    min='0'
                    value={stockValues[0] ?? String(currentRow?.stock ?? 0)}
                    onChange={(e) =>
                      setStockValues((prev) => ({ ...prev, 0: e.target.value }))
                    }
                  />
                  <Button
                    size='sm'
                    onClick={() => handleUpdate(0)}
                    disabled={updateStock.isPending}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              {stockData.variations.map((variant) => (
                <div key={variant.variant_index} className='flex items-center gap-3'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{variant.type || `Variante ${variant.variant_index + 1}`}</span>
                      <Badge variant='outline'>R$ {Number(variant.price).toFixed(2)}</Badge>
                    </div>
                    <Input
                      type='number'
                      min='0'
                      value={stockValues[variant.variant_index] ?? String(variant.stock)}
                      onChange={(e) =>
                        setStockValues((prev) => ({
                          ...prev,
                          [variant.variant_index]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    size='sm'
                    onClick={() => handleUpdate(variant.variant_index)}
                    disabled={updateStock.isPending}
                    className='mt-6'
                  >
                    Salvar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
