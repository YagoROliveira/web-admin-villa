import React, { createContext, useContext, useState } from 'react'
import type { Zone } from '../data/schema'

interface ZonesContextType {
  open: 'delete' | null
  setOpen: (v: 'delete' | null) => void
  currentRow: Zone | null
  setCurrentRow: (r: Zone | null) => void
}

const ZonesContext = createContext<ZonesContextType | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

export function ZonesProvider({ children }: Props) {
  const [open, setOpen] = useState<'delete' | null>(null)
  const [currentRow, setCurrentRow] = useState<Zone | null>(null)

  return (
    <ZonesContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </ZonesContext.Provider>
  )
}

export const useZonesContext = () => {
  const ctx = useContext(ZonesContext)
  if (!ctx)
    throw new Error('useZonesContext must be used within ZonesProvider')
  return ctx
}
