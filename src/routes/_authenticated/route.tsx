import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { API_CONFIG, buildApiUrl } from '@/config/api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // Verificar se há token de acesso
    if (!auth.accessToken) {
      console.warn('🚫 Acesso negado: Token não encontrado')
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Se tiver token mas não tiver user, tentar carregar o usuário
    if (!auth.user) {
      try {
        console.log('👤 Carregando informações do usuário...')
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.error('❌ Erro ao carregar usuário:', response.status, response.statusText)
          // Token inválido ou expirado
          auth.reset()
          throw redirect({
            to: '/sign-in',
            search: {
              redirect: location.href,
            },
          })
        }

        const userData = await response.json()
        console.log('✅ Usuário carregado:', userData.email)
        
        // Atualizar o user no store
        auth.setUser({
          id: userData.id?.toString() || '',
          email: userData.email || '',
          name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.email,
          role: userData.role || 'USER',
        })
      } catch (error) {
        console.error('❌ Erro ao validar autenticação:', error)
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }
    }

    // Verificação final usando o método isAuthenticated
    if (!auth.isAuthenticated()) {
      console.warn('🚫 Acesso negado: Não autenticado')
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    console.log('✅ Acesso autorizado para:', auth.user?.email)
  },
  component: AuthenticatedLayout,
})
