import { Plus, Upload, Download } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useItemsContext } from './items-provider'

export function ItemsPrimaryButtons() {
  const { setOpen } = useItemsContext()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setOpen('import')}
      >
        <Upload className='mr-2 h-4 w-4' />
        Importar
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          window.open('/item/export?type=xlsx', '_blank')
        }}
      >
        <Download className='mr-2 h-4 w-4' />
        Exportar
      </Button>
      <Button asChild>
        <Link to='/items/new'>
          <Plus className='mr-2 h-4 w-4' />
          Novo Produto
        </Link>
      </Button>
    </div>
  )
}

