/**
 * Navigation configuration — Dynamic sidebar items by role/permission.
 *
 * Replaces the static `sidebar-data.ts` with permission-aware navigation.
 * Each item specifies which permission is required to show it.
 * The sidebar renders only items the current user has permission for.
 */

import {
  LayoutDashboard,
  ListTodo,
  Calculator,
  Landmark,
  Receipt,
  Gift,
  BookOpen,
  Package,
  MessagesSquare,
  Users,
  Settings,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
  HelpCircle,
  ShoppingCart,
  Store,
  Truck,
  MapPin,
  Layers,
  FolderTree,
  Tag,
  BarChart3,
  CreditCard,
  BadgeCheck,
  Megaphone,
  Shield,
  UserPlus,
  Star,
  MessageCircle,
  Printer,
  type LucideIcon,
} from 'lucide-react'
import type { Permission, UserRole } from '@/types/auth'

// ============ TYPES ============

export interface NavItemConfig {
  title: string
  url: string
  icon?: LucideIcon
  badge?: string
  /** Permission required to show this item. If undefined, always visible. */
  permission?: Permission
  /** Show only for these roles (overrides permission check) */
  roles?: UserRole[]
  /** Always visible regardless of role/permission */
  always?: boolean
  /** Sub-items (collapsible menu) */
  items?: Omit<NavItemConfig, 'items'>[]
}

export interface NavGroupConfig {
  title: string
  /** Permission required to show the entire group */
  permission?: Permission
  /** Show only for these roles */
  roles?: UserRole[]
  items: NavItemConfig[]
}

// ============ NAVIGATION DEFINITION ============

/**
 * All possible navigation items, organized by group.
 * The filtering is done at render time by `getFilteredNavigation()`.
 */
export const NAVIGATION_CONFIG: NavGroupConfig[] = [
  // ─── GENERAL (wallet-api existing features) ───
  {
    title: 'Geral',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        always: true,
      },
      {
        title: 'Tasks',
        url: '/tasks',
        icon: ListTodo,
        always: true,
      },
      {
        title: 'Taxas',
        url: '/fees',
        icon: Calculator,
        permission: 'wallet.fees.view',
      },
      {
        title: 'Empréstimos',
        url: '/loans',
        icon: Landmark,
        permission: 'wallet.loans.view',
      },
      {
        title: 'Contas a Pagar',
        url: '/payable-accounts',
        icon: Receipt,
        permission: 'wallet.payable_accounts.view',
      },
      {
        title: 'Cashback',
        url: '/cashback',
        icon: Gift,
        permission: 'wallet.cashback.view',
      },
      {
        title: 'Stories',
        url: '/stories',
        icon: BookOpen,
        permission: 'wallet.stories.view',
      },
      {
        title: 'Apps',
        url: '/apps',
        icon: Package,
        always: true,
      },
      {
        title: 'Chats',
        url: '/chats',
        icon: MessagesSquare,
        permission: 'chat.access',
      },
      {
        title: 'Classificados',
        url: '/classifieds',
        icon: Tag,
        permission: 'wallet.classifieds.view',
      },
      {
        title: 'Clientes',
        url: '/customers',
        icon: Users,
        permission: 'wallet.users.view',
      },
    ],
  },

  // ─── MARKETPLACE (villamarket-api features — shared admin+vendor) ───
  {
    title: 'Marketplace',
    items: [
      {
        title: 'Pedidos',
        url: '/admin/orders',
        icon: ShoppingCart,
        permission: 'orders.view',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        title: 'Produtos',
        url: '/items',
        icon: Package,
        permission: 'items.view',
      },
      {
        title: 'Categorias',
        url: '/admin/categories',
        icon: Layers,
        permission: 'categories.view',
      },
      {
        title: 'Avaliações',
        url: '/reviews',
        icon: Star,
        permission: 'reviews.view',
      },
      {
        title: 'Chat',
        url: '/chat',
        icon: MessageCircle,
        permission: 'chat.access',
      },
      {
        title: 'POS',
        url: '/pos',
        icon: Printer,
        permission: 'pos.access',
      },
      {
        title: 'Notificações',
        url: '/notifications',
        icon: Bell,
        permission: 'notifications.view',
      },
    ],
  },

  // ─── ADMIN ONLY ───
  {
    title: 'Administração',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    items: [
      {
        title: 'Lojas',
        url: '/admin/stores',
        icon: Store,
        permission: 'admin.stores.view',
      },
      {
        title: 'Clientes',
        url: '/admin/customers',
        icon: Users,
        permission: 'admin.customers.view',
      },
      {
        title: 'Entregadores',
        url: '/admin/delivery-men',
        icon: Truck,
        permission: 'admin.delivery_men.view',
      },
      {
        title: 'Lojistas',
        url: '/admin/vendors',
        icon: UserPlus,
        permission: 'admin.vendors.view',
      },
      {
        title: 'Zonas',
        url: '/admin/zones',
        icon: MapPin,
        permission: 'admin.zones.view',
      },
      {
        title: 'Módulos',
        url: '/admin/modules',
        icon: Layers,
        permission: 'admin.modules.view',
      },
      {
        title: 'Categorias',
        url: '/admin/categories',
        icon: FolderTree,
        permission: 'admin.categories.view',
      },
      {
        title: 'Promoções',
        url: '/admin/promotions',
        icon: Megaphone,
        permission: 'admin.promotions.view',
      },
      {
        title: 'Financeiro',
        url: '/admin/finance',
        icon: CreditCard,
        permission: 'admin.finance.view',
      },
      {
        title: 'Assinaturas',
        url: '/admin/subscriptions',
        icon: BadgeCheck,
        permission: 'admin.subscriptions.view',
      },
      {
        title: 'Despacho',
        url: '/admin/dispatch',
        icon: Truck,
        permission: 'admin.dispatch.view',
      },
      {
        title: 'Relatórios',
        url: '/admin/reports',
        icon: BarChart3,
        permission: 'admin.reports.view',
      },
      {
        title: 'Configurações',
        url: '/admin/settings',
        icon: Settings,
        permission: 'admin.settings.view',
      },
      {
        title: 'Gestão de Acesso',
        url: '/admin/access-management',
        icon: Shield,
        permission: 'admin.access_management.view',
      },
    ],
  },

  // ─── VENDOR ONLY ───
  {
    title: 'Minha Loja',
    roles: ['VENDOR', 'VENDOR_EMPLOYEE'],
    items: [
      {
        title: 'Pedidos',
        url: '/vendor/orders',
        icon: ShoppingCart,
        permission: 'orders.view',
      },
      {
        title: 'Dashboard da Loja',
        url: '/vendor/store',
        icon: Store,
        permission: 'vendor.store.view',
      },
      {
        title: 'Config. da Loja',
        url: '/vendor/store/settings',
        icon: Settings,
        permission: 'vendor.store.manage',
      },
      {
        title: 'Funcionários',
        url: '/vendor/employees',
        icon: Users,
        permission: 'vendor.employees.view',
      },
      {
        title: 'Meus Entregadores',
        url: '/vendor/delivery-men',
        icon: Truck,
        permission: 'vendor.delivery_men.view',
      },
      {
        title: 'Assinatura',
        url: '/vendor/subscription',
        icon: BadgeCheck,
        permission: 'vendor.subscription.view',
      },
      {
        title: 'Financeiro',
        url: '/vendor/finance',
        icon: CreditCard,
        permission: 'vendor.finance.view',
      },
      {
        title: 'Relatórios',
        url: '/vendor/reports',
        icon: BarChart3,
        permission: 'vendor.reports.view',
      },
    ],
  },

  // ─── SETTINGS (always visible) ───
  {
    title: 'Outros',
    items: [
      {
        title: 'Configurações',
        icon: Settings,
        url: '/settings',
        items: [
          {
            title: 'Perfil',
            url: '/settings',
            icon: UserCog,
          },
          {
            title: 'Conta',
            url: '/settings/account',
            icon: Wrench,
          },
          {
            title: 'Aparência',
            url: '/settings/appearance',
            icon: Palette,
          },
          {
            title: 'Notificações',
            url: '/settings/notifications',
            icon: Bell,
          },
          {
            title: 'Display',
            url: '/settings/display',
            icon: Monitor,
          },
        ],
        always: true,
      },
      {
        title: 'Central de Ajuda',
        url: '/help-center',
        icon: HelpCircle,
        always: true,
      },
    ],
  },
]

// ============ FILTER FUNCTION ============

/**
 * Filters navigation items based on user role and permissions.
 * Returns only the groups/items the user has access to.
 */
export function getFilteredNavigation(
  role: UserRole | undefined,
  permissions: Permission[]
): NavGroupConfig[] {
  if (!role) return []

  const isSuperAdmin = role === 'SUPER_ADMIN'

  return NAVIGATION_CONFIG
    .filter((group) => {
      // Check group-level role restriction
      if (group.roles && !group.roles.includes(role)) return false
      return true
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // Always visible items
        if (item.always) return true
        // Super admin sees everything
        if (isSuperAdmin) return true
        // Role-restricted items
        if (item.roles && !item.roles.includes(role)) return false
        // Permission check
        if (item.permission && !permissions.includes(item.permission)) return false
        return true
      }),
    }))
    .filter((group) => group.items.length > 0) // Remove empty groups
}
