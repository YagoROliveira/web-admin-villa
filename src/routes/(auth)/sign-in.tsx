import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    // Se já está autenticado, redirecionar para a página principal
    if (auth.isAuthenticated()) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
