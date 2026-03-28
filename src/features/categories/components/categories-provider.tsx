import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Category } from '../data/schema'

type CategoriesDialogType = 'delete'

interface CategoriesContextType {
  open: CategoriesDialogType | null
  setOpen: (str: CategoriesDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Category | null>>
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(null)

interface CategoriesProviderProps {
  children: React.ReactNode
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [open, setOpen] = useDialogState<CategoriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)

  return (
    <CategoriesContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </CategoriesContext>
  )
}

export const useCategoriesContext = () => {
  const ctx = React.useContext(CategoriesContext)
  if (!ctx)
    throw new Error(
      'useCategoriesContext must be used within <CategoriesProvider>',
    )
  return ctx
}
