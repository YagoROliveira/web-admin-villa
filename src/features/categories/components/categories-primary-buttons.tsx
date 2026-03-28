import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function CategoriesPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' asChild>
        <Link to='/admin/categories/new'>
          <span>Nova Categoria</span>
          <Plus size={18} />
        </Link>
      </Button>
    </div>
  )
}
