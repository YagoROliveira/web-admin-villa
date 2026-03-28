import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Store } from '../data/schema'

type StoresDialogType = 'create' | 'update' | 'delete'

interface StoresContextType {
  open: StoresDialogType | null
  setOpen: (str: StoresDialogType | null) => void
  currentRow: Store | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Store | null>>
}

const StoresContext = React.createContext<StoresContextType | null>(null)

interface StoresProviderProps {
  children: React.ReactNode
}

export function StoresProvider({ children }: StoresProviderProps) {
  const [open, setOpen] = useDialogState<StoresDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Store | null>(null)

  return (
    <StoresContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StoresContext>
  )
}

export const useStoresContext = () => {
  const ctx = React.useContext(StoresContext)
  if (!ctx) throw new Error('useStoresContext must be used within <StoresProvider>')
  return ctx
}
