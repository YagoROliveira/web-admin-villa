import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ModuleFormPage } from '@/features/modules/components/module-form-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute(
  '/_authenticated/admin/modules/$moduleId/edit',
)({
  beforeLoad: requirePermission('admin.modules.view'),
  component: EditModulePage,
})

function EditModulePage() {
  const { moduleId } = Route.useParams()

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
        <ModuleFormPage moduleId={moduleId} />
      </Main>
    </>
  )
}
