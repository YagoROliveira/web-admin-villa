import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateConversation } from '../hooks/use-chat-api'

interface SimpleUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

type NewChatProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChat({ onOpenChange, open }: NewChatProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [idInput, setIdInput] = useState('')
  const createConversation = useCreateConversation()

  const handleAddId = () => {
    const trimmed = idInput.trim()
    if (trimmed && !selectedUserIds.includes(trimmed)) {
      setSelectedUserIds([...selectedUserIds, trimmed])
      setIdInput('')
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
  }

  useEffect(() => {
    if (!open) {
      setSelectedUserIds([])
      setIdInput('')
    }
  }, [open])

  const handleCreate = () => {
    if (selectedUserIds.length === 0) return

    createConversation.mutate(
      {
        type: selectedUserIds.length > 1 ? 'group' : 'direct',
        participantIds: selectedUserIds,
      },
      {
        onSuccess: () => {
          toast.success('Conversa criada com sucesso!')
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(err.message || 'Erro ao criar conversa')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-baseline-last gap-2'>
            <span className='text-muted-foreground min-h-6 text-sm'>Para:</span>
            {selectedUserIds.map((userId) => (
              <Badge key={userId} variant='default'>
                {userId}
                <button
                  className='ring-offset-background focus:ring-ring ms-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRemoveUser(userId)
                  }}
                  onClick={() => handleRemoveUser(userId)}
                >
                  <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='ID do usuário ou email...'
              className='border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm'
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddId()
                }
              }}
            />
            <Button type='button' variant='outline' onClick={handleAddId}>
              Adicionar
            </Button>
          </div>
          <Button
            variant='default'
            onClick={handleCreate}
            disabled={selectedUserIds.length === 0 || createConversation.isPending}
          >
            {createConversation.isPending ? 'Criando...' : 'Iniciar conversa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
