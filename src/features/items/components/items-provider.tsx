import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Item } from '../data/schema'

type ItemsDialogType = 'create' | 'update' | 'delete'

interface ItemsContextType {
  open: ItemsDialogType | null
  setOpen: (str: ItemsDialogType | null) => void
  currentRow: Item | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Item | null>>
}

const ItemsContext = React.createContext<ItemsContextType | null>(null)

interface ItemsProviderProps {
  children: React.ReactNode
}

export function ItemsProvider({ children }: ItemsProviderProps) {
  const [open, setOpen] = useDialogState<ItemsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Item | null>(null)

  return (
    <ItemsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ItemsContext>
  )
}

export const useItemsContext = () => {
  const ctx = React.useContext(ItemsContext)
  if (!ctx) throw new Error('useItemsContext must be used within <ItemsProvider>')
  return ctx
}
