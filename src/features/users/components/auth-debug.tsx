import { buildApiUrl, API_CONFIG } from '@/config/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { mockLoginResponse } from '../data/mock-data'

export function AuthDebug() {
  const { auth } = useAuthStore()

  const testConnection = async () => {
    try {
      console.log('Testando conexão...')
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS.LIST)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(auth.accessToken && {
            Authorization: `Bearer ${auth.accessToken}`,
          }),
        },
      })

      console.log('Response status:', response.status)
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Success:', data)
      } else {
        const errorText = await response.text()
        console.error('Error:', errorText)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  const mockLogin = () => {
    console.log('Fazendo login mockado...')
    // Simular login com dados mockados
    auth.setAccessToken(mockLoginResponse.accessToken)
    auth.setRefreshToken(mockLoginResponse.refreshToken)
    auth.setUser({
      id: mockLoginResponse.user.id.toString(),
      email: mockLoginResponse.user.email,
      name: `${mockLoginResponse.user.firstName} ${mockLoginResponse.user.lastName}`,
      role: mockLoginResponse.user.role,
    })
    console.log('Login mockado realizado com sucesso')
  }

  const loginTest = async () => {
    try {
      console.log('Testando login...')
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'password123',
        }),
      })

      console.log('Login response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Login success:', data)

        // Salvar token
        auth.setAccessToken(data.accessToken)
        auth.setRefreshToken(data.refreshToken)
        auth.setUser({
          id: data.user.id.toString(),
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          role: data.user.role,
        })
      } else {
        const errorText = await response.text()
        console.error('Login error:', errorText)
      }
    } catch (error) {
      console.error('Login fetch error:', error)
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
        <Button onClick={mockLogin} variant='outline' size='sm'>
          Login Mockado
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
