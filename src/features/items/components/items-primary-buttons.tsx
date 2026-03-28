import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ItemsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' asChild>
        <Link to='/items/new'>
          <span>Novo Produto</span>
          <Plus size={18} />
        </Link>
      </Button>
    </div>
  )
}
