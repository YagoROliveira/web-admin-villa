import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useImportItems } from '../hooks/use-items'
import { useItemsContext } from './items-provider'

export function ItemsImportDialog() {
  const { open, setOpen } = useItemsContext()
  const isOpen = open === 'import'

  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [storeId, setStoreId] = useState('')

  const importItems = useImportItems()

  function handleClose() {
    setOpen(null)
    setSelectedFile(null)
    setStoreId('')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  function handleSubmit() {
    if (!selectedFile || !storeId) return
    importItems.mutate(
      { file: selectedFile, store_id: storeId },
      { onSuccess: handleClose },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Importar Produtos</DialogTitle>
          <DialogDescription>
            Importe produtos em massa via arquivo Excel (.xlsx) ou CSV.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              O arquivo deve estar no formato padrão de importação. Cada linha representa um produto.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label htmlFor='import-store-id'>ID da Loja *</Label>
            <Input
              id='import-store-id'
              placeholder='ID da loja'
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='import-file'>Arquivo (.xlsx ou .csv) *</Label>
            <div
              className='border-muted-foreground/25 hover:border-muted-foreground/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors'
              onClick={() => fileRef.current?.click()}
            >
              {selectedFile ? (
                <div className='flex items-center gap-2 text-sm'>
                  <FileSpreadsheet className='h-5 w-5 text-green-500' />
                  <span className='font-medium'>{selectedFile.name}</span>
                  <span className='text-muted-foreground'>
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2 text-sm text-muted-foreground'>
                  <Upload className='h-8 w-8' />
                  <span>Clique para selecionar o arquivo</span>
                  <span className='text-xs'>.xlsx ou .csv</span>
                </div>
              )}
              <input
                ref={fileRef}
                id='import-file'
                type='file'
                accept='.xlsx,.csv'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={importItems.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !storeId || importItems.isPending}
          >
            {importItems.isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
