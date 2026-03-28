import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function StoresPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' asChild>
        <Link to='/admin/stores/new'>
          <span>Nova Loja</span>
          <Plus size={18} />
        </Link>
      </Button>
    </div>
  )
}
