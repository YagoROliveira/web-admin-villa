import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CategoryFormPage } from '@/features/categories/components/category-form-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute(
  '/_authenticated/admin/categories/$categoryId/edit',
)({
  beforeLoad: requirePermission('admin.categories.view'),
  component: EditCategoryPage,
})

function EditCategoryPage() {
  const { categoryId } = Route.useParams()

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
        <CategoryFormPage categoryId={categoryId} />
      </Main>
    </>
  )
}
