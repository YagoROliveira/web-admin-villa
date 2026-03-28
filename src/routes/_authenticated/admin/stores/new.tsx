import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StoreFormPage } from '@/features/stores/components/store-form-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/stores/new')({
  beforeLoad: requirePermission('admin.stores.view'),
  component: NewStorePage,
})

function NewStorePage() {
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
        <StoreFormPage />
      </Main>
    </>
  )
}
