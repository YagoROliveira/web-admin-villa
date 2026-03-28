import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ZonesPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button asChild>
        <Link to='/admin/zones/new'>
          <Plus className='mr-2 h-4 w-4' /> Nova Zona
        </Link>
      </Button>
    </div>
  )
}
