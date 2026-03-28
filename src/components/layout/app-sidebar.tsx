import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { useAuthStore } from '@/stores/auth-store'
import { getFilteredNavigation } from '@/config/navigation'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import type { NavGroup as NavGroupType, NavItem } from './types'
import type { NavGroupConfig, NavItemConfig } from '@/config/navigation'
import type { UserRole } from '@/types/auth'
import { Command } from 'lucide-react'

/**
 * Converts the RBAC NavItemConfig (string urls) to the sidebar NavItem type
 * expected by the existing NavGroup component.
 */
function toNavItem(cfg: NavItemConfig): NavItem {
  if (cfg.items && cfg.items.length > 0) {
    return {
      title: cfg.title,
      icon: cfg.icon,
      badge: cfg.badge,
      items: cfg.items.map((sub) => ({
        title: sub.title,
        url: sub.url as NavItem extends { url: infer U } ? U : string,
        icon: sub.icon,
        badge: sub.badge,
      })),
    } as NavItem
  }
  return {
    title: cfg.title,
    url: cfg.url as NavItem extends { url: infer U } ? U : string,
    icon: cfg.icon,
    badge: cfg.badge,
  } as NavItem
}

function toNavGroup(cfg: NavGroupConfig): NavGroupType {
  return {
    title: cfg.title,
    items: cfg.items.map(toNavItem),
  }
}

const defaultTeams = [
  {
    name: 'Villa Market',
    logo: Command,
    plan: 'Admin Panel',
  },
]

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()
  const user = auth.user

  // Normalize role — may be an object {id, name, permissions, createdAt} from stale cookie
  const safeRole: UserRole | undefined = (() => {
    const r = user?.role
    if (!r) return undefined
    if (typeof r === 'string') return r as UserRole
    if (typeof r === 'object' && r !== null) return (r as any).name as UserRole | undefined
    return undefined
  })()

  // Filter navigation based on current user's role & permissions
  const navGroups = useMemo(() => {
    const filtered = getFilteredNavigation(
      safeRole,
      user?.permissions ?? []
    )
    return filtered.map(toNavGroup)
  }, [safeRole, user?.permissions])

  // Build user data for NavUser (real data from auth store)
  const userData = useMemo(
    () => ({
      name: user?.name ?? 'Usuário',
      email: user?.email ?? '',
      avatar: user?.avatar ?? '/avatars/shadcn.jpg',
      role: safeRole,
    }),
    [user?.name, user?.email, user?.avatar, safeRole]
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={defaultTeams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
