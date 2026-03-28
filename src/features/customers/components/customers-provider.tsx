import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Customer } from '../data/schema'

type CustomersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type CustomersContextType = {
  open: CustomersDialogType | null
  setOpen: (str: CustomersDialogType | null) => void
  currentRow: Customer | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Customer | null>>
}

const CustomersContext = React.createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Customer | null>(null)

  return (
    <CustomersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CustomersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomersContext = () => {
  const ctx = React.useContext(CustomersContext)
  if (!ctx) {
    throw new Error('useCustomersContext has to be used within <CustomersProvider>')
  }
  return ctx
}
