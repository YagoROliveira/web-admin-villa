import React, { createContext, useContext, useState } from 'react'
import type { Module } from '../data/schema'

interface ModulesContextType {
  open: 'delete' | null
  setOpen: (v: 'delete' | null) => void
  currentRow: Module | null
  setCurrentRow: (r: Module | null) => void
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

export function ModulesProvider({ children }: Props) {
  const [open, setOpen] = useState<'delete' | null>(null)
  const [currentRow, setCurrentRow] = useState<Module | null>(null)

  return (
    <ModulesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ModulesContext.Provider>
  )
}

export const useModulesContext = () => {
  const ctx = useContext(ModulesContext)
  if (!ctx) throw new Error('useModulesContext must be used within ModulesProvider')
  return ctx
}
