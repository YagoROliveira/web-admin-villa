import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { API_CONFIG, buildApiUrl } from '@/config/api'

/**
 * Tenta fazer refresh do token usando o refreshToken
 */
async function tryRefreshToken(): Promise<boolean> {
  const { auth } = useAuthStore.getState()
  const refreshToken = auth.refreshToken

  if (!refreshToken) return false

  try {
    console.log('🔄 Tentando refresh do token...')
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error('❌ Refresh token falhou:', response.status)
      return false
    }

    const data = await response.json()
    auth.setAccessToken(data.accessToken)
    if (data.refreshToken) {
      auth.setRefreshToken(data.refreshToken)
    }
    console.log('✅ Token renovado com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro no refresh token:', error)
    return false
  }
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // Verificar se há token de acesso
    if (!auth.accessToken) {
      // Tentar refresh antes de redirecionar
      const refreshed = await tryRefreshToken()
      if (!refreshed) {
        console.warn('🚫 Acesso negado: Token não encontrado')
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }

    // Se tiver token mas não tiver user, tentar carregar o usuário
    if (!auth.user) {
      try {
        console.log('👤 Carregando informações do usuário...')
        const currentToken = useAuthStore.getState().auth.accessToken
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          // Token expirado, tentar refresh
          const refreshed = await tryRefreshToken()
          if (refreshed) {
            // Tentar novamente com o novo token
            const newToken = useAuthStore.getState().auth.accessToken
            const retryResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
              headers: {
                Authorization: `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (!retryResponse.ok) {
              auth.reset()
              throw redirect({
                to: '/sign-in',
                search: { redirect: location.href },
              })
            }

            const userData = await retryResponse.json()
            auth.setUser({
              id: userData.id?.toString() || '',
              email: userData.email || '',
              name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.email,
              role: userData.role || 'USER',
            })
          } else {
            auth.reset()
            throw redirect({
              to: '/sign-in',
              search: { redirect: location.href },
            })
          }
        } else if (!response.ok) {
          console.error('❌ Erro ao carregar usuário:', response.status, response.statusText)
          auth.reset()
          throw redirect({
            to: '/sign-in',
            search: { redirect: location.href },
          })
        } else {
          const userData = await response.json()
          console.log('✅ Usuário carregado:', userData.email)
          auth.setUser({
            id: userData.id?.toString() || '',
            email: userData.email || '',
            name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.email,
            role: userData.role || 'USER',
          })
        }
      } catch (error: any) {
        // Se já é um redirect, propagar
        if (error?.to || error?.redirect) throw error
        console.error('❌ Erro ao validar autenticação:', error)
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }

    console.log('✅ Acesso autorizado para:', useAuthStore.getState().auth.user?.email)
  },
  component: AuthenticatedLayout,
})
