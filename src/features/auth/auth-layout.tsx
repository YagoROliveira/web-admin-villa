import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-6 flex flex-col items-center justify-center gap-3'>
          <div className='bg-primary/10 flex size-16 items-center justify-center rounded-2xl'>
            <Logo className='size-9 text-primary' />
          </div>
          <div className='text-center'>
            <h1 className='text-3xl font-bold tracking-tight'>Villa Market</h1>
            <p className='text-muted-foreground text-sm'>Painel Administrativo</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
