import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ClassifiedsList } from '../components/classifieds-list';
import { CategoryManagement } from '../components/category-management';

export function ClassifiedsPage() {
  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Classificados</h1>
            <p className='text-sm text-muted-foreground'>
              Gerencie anúncios e categorias do marketplace
            </p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Novo Anúncio
          </Button>
        </div>

        <Tabs defaultValue="classifieds" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classifieds">Anúncios</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="classifieds">
            <ClassifiedsList />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
        </Tabs>
      </Main>

      <ConfigDrawer />
    </>
  );
}