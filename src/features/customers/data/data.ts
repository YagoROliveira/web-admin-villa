import { Shield, UserCheck, Store, Users, Truck } from 'lucide-react'

export const statusDisplay = new Map<boolean, { label: string; className: string }>([
  [true, { label: 'Ativo', className: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200' }],
  [false, { label: 'Inativo', className: 'bg-neutral-300/40 border-neutral-300' }],
])

export const roles = [
  {
    label: 'Cliente',
    value: 'CUSTOMER',
    icon: UserCheck,
  },
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: Shield,
  },
  {
    label: 'Vendedor',
    value: 'VENDOR',
    icon: Store,
  },
  {
    label: 'Func. Loja',
    value: 'VENDOR_EMPLOYEE',
    icon: Users,
  },
  {
    label: 'Entregador',
    value: 'DELIVERY_MAN',
    icon: Truck,
  },
] as const
