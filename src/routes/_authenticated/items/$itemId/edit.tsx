import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ItemFormPage } from '@/features/items/components/item-form-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/items/$itemId/edit')({
  beforeLoad: requirePermission('items.view'),
  component: EditItemPage,
})

function EditItemPage() {
  const { itemId } = Route.useParams()

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
        <ItemFormPage itemId={itemId} />
      </Main>
    </>
  )
}
