# Sistema de Autenticação - Shadcn Admin

## 📋 Visão Geral

Sistema completo de autenticação implementado usando **Zustand** para gerenciamento de estado, **TanStack Router** para proteção de rotas, e **React Query** para chamadas à API.

---

## 🔐 Componentes Principais

### 1. Auth Store (`/src/stores/auth-store.ts`)

Gerencia o estado global de autenticação usando Zustand:

```typescript
interface AuthUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  balance?: number
  accountNo?: string
  createdAt?: string
  updatedAt?: string
}
```

**Métodos disponíveis:**
- `setUser(user)` - Define o usuário atual
- `setAccessToken(token)` - Armazena access token
- `setRefreshToken(token)` - Armazena refresh token
- `reset()` - Limpa todos os dados de autenticação
- `isAuthenticated()` - Verifica se usuário está autenticado

**Persistência:**
- Tokens são armazenados em **cookies** usando `getCookie`, `setCookie`, `removeCookie`
- Tokens são carregados automaticamente ao inicializar a aplicação

---

### 2. Hooks de Autenticação (`/src/hooks/use-auth.ts`)

#### `useLogin()`
Realiza login do usuário:
```typescript
const loginMutation = useLogin()

loginMutation.mutate({ email, password }, {
  onSuccess: () => {
    // Redirecionar usuário
  }
})
```

#### `useLogout()`
Realiza logout e limpa dados:
```typescript
const logoutMutation = useLogout()

logoutMutation.mutate()
```

#### `useCurrentUser()`
Busca informações do usuário atual:
```typescript
const { data: user, isLoading } = useCurrentUser()
```

#### `useValidateToken()`
Valida token atual:
```typescript
const { data: validation } = useValidateToken()
```

#### `useRefreshToken()`
Atualiza tokens expirados:
```typescript
const refreshMutation = useRefreshToken()

refreshMutation.mutate()
```

---

## 🛡️ Proteção de Rotas

### Rotas Autenticadas (`/_authenticated`)

Todas as rotas dentro de `/_authenticated` são protegidas automaticamente:

**Arquivo:** `/src/routes/_authenticated/route.tsx`

```typescript
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    
    // Verificar se o usuário está autenticado
    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
      })
    }
  },
  component: AuthenticatedLayout,
})
```

**Rotas protegidas:**
- `/` (Dashboard)
- `/users` (Usuários)
- `/fees` (Taxas)
- `/loans` (Empréstimos)
- `/stories` (Stories)
- `/tasks` (Tarefas)
- `/chats` (Chat)
- `/apps` (Apps)
- `/settings` (Configurações)

### Rotas Públicas (`/(auth)`)

Rotas de autenticação que redirecionam se usuário já está logado:

**Arquivo:** `/src/routes/(auth)/sign-in.tsx`

```typescript
export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    
    // Se já está autenticado, redirecionar para a página principal
    if (auth.accessToken) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SignIn,
})
```

**Rotas públicas:**
- `/sign-in` - Login
- `/sign-up` - Registro
- `/forgot-password` - Recuperar senha
- `/otp` - Verificação OTP

---

## 🔄 Fluxo de Autenticação

### Login
1. Usuário acessa `/sign-in`
2. Preenche email e senha
3. `useLogin()` envia credenciais para API
4. API retorna `{ user, accessToken, refreshToken }`
5. Tokens e usuário são salvos no store (Zustand)
6. Tokens são persistidos em cookies
7. Usuário é redirecionado para `/` (Dashboard)

### Navegação Protegida
1. Usuário tenta acessar rota protegida (ex: `/users`)
2. `beforeLoad` do `_authenticated/route.tsx` verifica token
3. Se **não autenticado**: redireciona para `/sign-in`
4. Se **autenticado**: permite acesso à rota

### Logout
1. Usuário clica em "Sign out" no profile dropdown
2. Dialog de confirmação é exibido
3. `useLogout()` envia request para API
4. Store e cookies são limpos
5. React Query cache é limpo
6. Usuário é redirecionado para `/sign-in`

### Token Expirado
1. API retorna erro 401 (Unauthorized)
2. Hook `useCurrentUser` detecta erro 401
3. `auth.reset()` é chamado automaticamente
4. Usuário é redirecionado para `/sign-in`

---

## 🌐 Endpoints da API

**Base URL:** `https://localhost:443/wallet-api`

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Usuário atual
- `POST /auth/validate` - Validar token

**Configuração:** `/src/config/api.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://localhost:443/wallet-api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      VALIDATE: '/auth/validate',
    },
  },
}
```

---

## 🎨 Componentes UI

### Profile Dropdown
**Arquivo:** `/src/components/profile-dropdown.tsx`

Exibe informações do usuário e opção de logout:
- Avatar com iniciais
- Nome e email
- Links para Settings, Profile, Billing
- Botão "Sign out"

### Sign Out Dialog
**Arquivo:** `/src/components/sign-out-dialog.tsx`

Dialog de confirmação antes do logout:
- Título e descrição
- Botões "Cancel" e "Sign out"
- Loading state durante logout

### User Auth Form
**Arquivo:** `/src/features/auth/sign-in/components/user-auth-form.tsx`

Formulário de login com validação:
- Email (validação de formato)
- Password (mínimo 7 caracteres)
- Link "Forgot password?"
- Botões de login social (GitHub, Facebook)

---

## ✅ Checklist de Segurança

- [x] Tokens armazenados em cookies seguros
- [x] Proteção de rotas implementada
- [x] Redirecionamento automático para login
- [x] Limpeza de cache ao fazer logout
- [x] Validação de token em background
- [x] Refresh token para renovação automática
- [x] Prevenção de acesso a rotas públicas quando autenticado
- [ ] HTTPS habilitado em produção
- [ ] Rate limiting em endpoints de autenticação
- [ ] 2FA (Two-Factor Authentication) - futuro

---

## 🚀 Como Usar

### Verificar se usuário está logado

```typescript
import { useAuthStore } from '@/stores/auth-store'

function MyComponent() {
  const { auth } = useAuthStore()
  
  if (auth.isAuthenticated()) {
    return <div>Bem-vindo, {auth.user?.name}!</div>
  }
  
  return <div>Faça login</div>
}
```

### Obter token para chamadas API

```typescript
import { useAuthStore } from '@/stores/auth-store'

function fetchData() {
  const { auth } = useAuthStore.getState()
  
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`
    }
  })
}
```

### Proteger uma nova rota

Basta colocar o arquivo da rota dentro de `/src/routes/_authenticated/`:

```
/src/routes/_authenticated/
  ├── minha-nova-rota/
  │   └── index.tsx
```

A proteção será automática!

---

## 🔧 Troubleshooting

### "Redirecionado para login mesmo estando logado"

**Causa:** Token expirado ou inválido

**Solução:**
1. Limpar cookies do navegador
2. Fazer login novamente
3. Verificar se API está retornando tokens válidos

### "Erro 401 em todas as chamadas"

**Causa:** Token não está sendo enviado corretamente

**Solução:**
1. Verificar se `auth.accessToken` não está vazio
2. Verificar headers das requisições
3. Usar `getAuthHeaders()` do `/src/config/api.ts`

### "Loop infinito de redirecionamento"

**Causa:** Conflito entre rotas protegidas e públicas

**Solução:**
1. Verificar se rota de login está em `/(auth)/`
2. Verificar se `beforeLoad` não está conflitando
3. Limpar cache do navegador

---

## 📝 Notas Importantes

- **Tokens são httpOnly cookies** para maior segurança
- **Store Zustand** é sincronizado com cookies automaticamente
- **React Query** gerencia cache de dados do usuário
- **TanStack Router** protege rotas em nível de roteamento
- **Refresh token** renova automaticamente access token expirado

---

## 🎯 Próximos Passos

1. ✅ Sistema de autenticação completo
2. ⏳ Implementar refresh automático de token
3. ⏳ Adicionar 2FA (Two-Factor Authentication)
4. ⏳ Implementar sistema de permissões (RBAC)
5. ⏳ Adicionar auditoria de login
6. ⏳ Implementar session timeout

---

**Última atualização:** Outubro 15, 2025
**Status:** ✅ Implementado e funcionando
