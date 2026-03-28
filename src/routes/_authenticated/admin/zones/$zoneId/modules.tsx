import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ZoneModulesPage } from '@/features/zones/components/zone-modules-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute(
  '/_authenticated/admin/zones/$zoneId/modules',
)({
  beforeLoad: requirePermission('admin.zones.view'),
  component: ZoneModulesRoute,
})

function ZoneModulesRoute() {
  const { zoneId } = Route.useParams()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <ZoneModulesPage zoneId={zoneId} />
      </Main>
    </>
  )
}
