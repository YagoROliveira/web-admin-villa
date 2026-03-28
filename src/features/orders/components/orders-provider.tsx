import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Order } from '../data/schema'

interface OrdersContextValue {
  selectedOrder: Order | null
  setSelectedOrder: (order: Order | null) => void
  dialogOpen: string | null
  setDialogOpen: (dialog: string | null) => void
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

  return (
    <OrdersContext.Provider
      value={{ selectedOrder, setSelectedOrder, dialogOpen, setDialogOpen }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrdersContext() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrdersContext must be used within OrdersProvider')
  return ctx
}
