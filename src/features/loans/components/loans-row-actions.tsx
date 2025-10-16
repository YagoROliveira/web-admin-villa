import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LoansRowActions({
  onAnalyze,
  onReject,
  onRequestDocs,
}: {
  onAnalyze?: () => void
  onReject?: () => void
  onRequestDocs?: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onAnalyze}>Analisar</DropdownMenuItem>
        <DropdownMenuItem onClick={onReject}>Recusar</DropdownMenuItem>
        <DropdownMenuItem onClick={onRequestDocs}>
          Solicitar documentos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
