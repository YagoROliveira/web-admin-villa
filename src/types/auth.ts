/**
 * RBAC Types — Role-Based Access Control
 *
 * Define ALL roles, permissions, and user types for the unified panel.
 * Admin + Vendor in a SINGLE app with role-based routing and sidebar.
 */

// ============ ROLES ============

export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'VENDOR',
  'VENDOR_EMPLOYEE',
] as const

export type UserRole = (typeof USER_ROLES)[number]

/** Human-readable role labels (pt-BR) */
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  VENDOR: 'Lojista',
  VENDOR_EMPLOYEE: 'Funcionário',
}

/** Role hierarchy — higher number = more privilege */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  VENDOR: 60,
  VENDOR_EMPLOYEE: 40,
}

// ============ PERMISSIONS ============

export const PERMISSIONS = [
  // ─── Admin-only ───
  'admin.stores.view',
  'admin.stores.manage',
  'admin.customers.view',
  'admin.customers.manage',
  'admin.delivery_men.view',
  'admin.delivery_men.manage',
  'admin.vendors.view',
  'admin.vendors.manage',
  'admin.zones.view',
  'admin.zones.manage',
  'admin.modules.view',
  'admin.modules.manage',
  'admin.categories.view',
  'admin.categories.manage',
  'admin.promotions.view',
  'admin.promotions.manage',
  'admin.finance.view',
  'admin.finance.manage',
  'admin.subscriptions.view',
  'admin.subscriptions.manage',
  'admin.dispatch.view',
  'admin.dispatch.manage',
  'admin.settings.view',
  'admin.settings.manage',
  'admin.reports.view',
  'admin.access_management.view',
  'admin.access_management.manage',

  // ─── Shared (admin + vendor) ───
  'orders.view',
  'orders.manage',
  'orders.accept',
  'orders.process',
  'items.view',
  'items.manage',
  'categories.view',
  'categories.manage',
  'reviews.view',
  'reviews.manage',
  'chat.access',
  'pos.access',
  'notifications.view',

  // ─── Vendor-only ───
  'vendor.store.view',
  'vendor.store.manage',
  'vendor.employees.view',
  'vendor.employees.manage',
  'vendor.delivery_men.view',
  'vendor.delivery_men.manage',
  'vendor.subscription.view',
  'vendor.subscription.manage',
  'vendor.finance.view',
  'vendor.finance.manage',
  'vendor.reports.view',

  // ─── Wallet features (existing wallet-api) ───
  'wallet.dashboard.view',
  'wallet.fees.view',
  'wallet.fees.manage',
  'wallet.loans.view',
  'wallet.loans.manage',
  'wallet.payable_accounts.view',
  'wallet.payable_accounts.manage',
  'wallet.cashback.view',
  'wallet.cashback.manage',
  'wallet.stories.view',
  'wallet.stories.manage',
  'wallet.classifieds.view',
  'wallet.classifieds.manage',
  'wallet.apps.view',
  'wallet.apps.manage',
  'wallet.chats.view',
  'wallet.chats.manage',
  'wallet.users.view',
  'wallet.users.manage',
] as const

export type Permission = (typeof PERMISSIONS)[number]

// ============ USER ============

export interface AuthUser {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  role: UserRole
  permissions: Permission[]
  /** Store ID — present only for VENDOR and VENDOR_EMPLOYEE */
  storeId?: string
  /** Store name — for display in sidebar/header */
  storeName?: string
  /** Avatar URL */
  avatar?: string
  balance?: number
  accountNo?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  createdAt?: string
  updatedAt?: string
}

// ============ DEFAULT PERMISSIONS BY ROLE ============

/**
 * Default permissions assigned to each role.
 * SUPER_ADMIN always has ALL permissions (handled in code).
 * These are the DEFAULT set — individual users can have custom overrides.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS], // All permissions

  ADMIN: [
    // Admin management
    'admin.stores.view',
    'admin.stores.manage',
    'admin.customers.view',
    'admin.customers.manage',
    'admin.delivery_men.view',
    'admin.delivery_men.manage',
    'admin.vendors.view',
    'admin.vendors.manage',
    'admin.zones.view',
    'admin.zones.manage',
    'admin.modules.view',
    'admin.modules.manage',
    'admin.categories.view',
    'admin.categories.manage',
    'admin.promotions.view',
    'admin.promotions.manage',
    'admin.finance.view',
    'admin.finance.manage',
    'admin.subscriptions.view',
    'admin.subscriptions.manage',
    'admin.dispatch.view',
    'admin.dispatch.manage',
    'admin.settings.view',
    'admin.reports.view',
    'admin.access_management.view',
    // Shared features
    'orders.view',
    'orders.manage',
    'orders.accept',
    'orders.process',
    'items.view',
    'items.manage',
    'categories.view',
    'categories.manage',
    'reviews.view',
    'reviews.manage',
    'chat.access',
    'pos.access',
    'notifications.view',
    // Wallet features (admin has full access)
    'wallet.dashboard.view',
    'wallet.fees.view',
    'wallet.fees.manage',
    'wallet.loans.view',
    'wallet.loans.manage',
    'wallet.payable_accounts.view',
    'wallet.payable_accounts.manage',
    'wallet.cashback.view',
    'wallet.cashback.manage',
    'wallet.stories.view',
    'wallet.stories.manage',
    'wallet.classifieds.view',
    'wallet.classifieds.manage',
    'wallet.users.view',
    'wallet.users.manage',
  ],

  VENDOR: [
    // Vendor management
    'vendor.store.view',
    'vendor.store.manage',
    'vendor.employees.view',
    'vendor.employees.manage',
    'vendor.delivery_men.view',
    'vendor.delivery_men.manage',
    'vendor.subscription.view',
    'vendor.subscription.manage',
    'vendor.finance.view',
    'vendor.finance.manage',
    'vendor.reports.view',
    // Shared features (scoped to their store)
    'orders.view',
    'orders.manage',
    'orders.accept',
    'orders.process',
    'items.view',
    'items.manage',
    'categories.view',
    'reviews.view',
    'chat.access',
    'pos.access',
    'notifications.view',
  ],

  VENDOR_EMPLOYEE: [
    // Limited vendor access
    'vendor.store.view',
    'vendor.finance.view',
    'vendor.reports.view',
    // Shared features (scoped, limited)
    'orders.view',
    'orders.accept',
    'orders.process',
    'items.view',
    'reviews.view',
    'chat.access',
    'pos.access',
    'notifications.view',
  ],
}

// ============ ROLE GROUP HELPERS ============

export const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN']
export const VENDOR_ROLES: UserRole[] = ['VENDOR', 'VENDOR_EMPLOYEE']
export const ALL_ROLES: UserRole[] = [...USER_ROLES]
