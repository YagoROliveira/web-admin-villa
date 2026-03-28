import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'
import type { UserRole } from '@/types/auth'

export function AuthDebug() {
  const { auth } = useAuthStore()

  const testConnection = async () => {
    try {
      console.log('Testando conexão com NestJS API...')
      const { data, status } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.LIST, {
        params: { page: 1, limit: 5 },
      })
      console.log('Response status:', status)
      console.log('Success:', data)
    } catch (error: any) {
      console.error('Fetch error:', error?.response?.status, error?.message)
    }
  }

  const loginTest = async () => {
    try {
      console.log('Testando login na NestJS API...')
      const { data } = await villamarketApi.post(VM_API.ENDPOINTS.AUTH.ADMIN_LOGIN, {
        email: 'admin@test.com',
        password: 'password123',
      })
      console.log('Login success:', data)

      // Salvar token
      auth.setAccessToken(data.accessToken)
      auth.setRefreshToken(data.refreshToken)
      auth.setUser({
        id: data.user?.id?.toString() ?? '',
        email: data.user?.email ?? '',
        name: data.user?.name ?? '',
        role: (data.user?.role || 'ADMIN') as UserRole,
        permissions: DEFAULT_ROLE_PERMISSIONS[(data.user?.role || 'ADMIN') as UserRole] ?? [],
      })
    } catch (error: any) {
      console.error('Login error:', error?.response?.status, error?.response?.data || error?.message)
    }
  }

  return (
    <div className='bg-muted/50 rounded-lg border p-4'>
      <h3 className='mb-2 font-semibold'>Auth Debug</h3>
      <div className='space-y-2 text-sm'>
        <p>
          <strong>Autenticado (user + token):</strong>{' '}
          {auth.isAuthenticated() ? 'Sim' : 'Não'}
        </p>
        <p>
          <strong>Usuário:</strong> {auth.user?.name || 'Nenhum'}{' '}
          {auth.user && `(${auth.user.email})`}
        </p>
        <p>
          <strong>Token:</strong> {auth.accessToken ? 'Presente' : 'Ausente'}
        </p>
        {auth.accessToken && (
          <p>
            <strong>Token (primeiros 20 chars):</strong>{' '}
            {auth.accessToken.substring(0, 20)}...
          </p>
        )}
        <div className='mt-2 rounded bg-yellow-100 p-2 text-xs dark:bg-yellow-900/20'>
          <strong>Status:</strong>{' '}
          {auth.accessToken && !auth.user
            ? '⚠️ Token existe mas usuário é null - Faça login mockado ou reset auth'
            : auth.isAuthenticated()
              ? '✅ Autenticado corretamente'
              : '❌ Não autenticado'}
        </div>
      </div>
      <div className='mt-4 flex gap-2'>
        <Button onClick={testConnection} variant='outline' size='sm'>
          Testar Conexão
        </Button>
        <Button onClick={loginTest} variant='outline' size='sm'>
          Login Real
        </Button>
        <Button onClick={() => auth.reset()} variant='destructive' size='sm'>
          Reset Auth
        </Button>
      </div>
    </div>
  )
}
