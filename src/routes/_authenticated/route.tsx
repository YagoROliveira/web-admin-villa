import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // Verificar se o usuário está autenticado
    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
      })
    }

    // Opcional: Verificar se o token é válido
    // Aqui você pode adicionar lógica para validar o token com o backend
    // ou verificar se o token expirou
  },
  component: AuthenticatedLayout,
})
