import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['ACTIVE', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['INACTIVE', 'bg-neutral-300/40 border-neutral-300'],
  ['PENDING_VERIFICATION', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'SUSPENDED',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: Shield,
  },
  {
    label: 'User',
    value: 'USER',
    icon: UserCheck,
  },
  {
    label: 'Manager',
    value: 'MANAGER',
    icon: Users,
  },
  {
    label: 'Cashier',
    value: 'CASHIER',
    icon: CreditCard,
  },
] as const
