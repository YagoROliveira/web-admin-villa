import { LoansTable } from "./components/loans-table";
import { LoansProvider, useLoans } from "./components/loans-provider";
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ConfigDrawer } from '@/components/config-drawer';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';

function LoansContent() {
  const { loans, isLoading, error } = useLoans();
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Solicitações de Empréstimos</h2>
            <p className='text-muted-foreground'>Aqui estão as solicitações de empréstimos cadastradas.</p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading && <div>Carregando...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!isLoading && !error && <LoansTable data={loans} />}
        </div>
      </Main>
    </>
  );
}

export function Loans() {
  return (
    <LoansProvider>
      <LoansContent />
    </LoansProvider>
  );
}
