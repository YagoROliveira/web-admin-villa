import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Wallet,
  ShoppingCart,
  MapPin,
  MessageSquare,
  BarChart3,
  Clock,
  Star,
  RefreshCw,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Award,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useUserDetail } from '../hooks/use-user-detail'
import { WalletTab } from '../components/detail/wallet-tab'
import { OrdersTab } from '../components/detail/orders-tab'
import { AddressesTab } from '../components/detail/addresses-tab'
import { ConversationsTab } from '../components/detail/conversations-tab'
import { StatsTab } from '../components/detail/stats-tab'
import { AccessLogsTab } from '../components/detail/access-logs-tab'
import { TopItemsTab } from '../components/detail/top-items-tab'

export function UserDetailPage() {
  const { userId } = useParams({ from: '/_authenticated/users/$userId' })
  const { data: user, isLoading, error, refetch, isFetching } = useUserDetail(userId)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <UserDetailSkeleton />
        </Main>
      </>
    )
  }

  if (error || !user) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4'>
            <p className='text-destructive'>
              Erro ao carregar dados do cliente: {error?.message || 'Cliente não encontrado'}
            </p>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link to='/users'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Voltar
                </Link>
              </Button>
              <Button onClick={() => refetch()} variant='outline'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Tentar novamente
              </Button>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Back button + Title */}
        <div className='mb-6 flex items-center gap-4'>
          <Button asChild variant='outline' size='icon'>
            <Link to='/users'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Detalhes do Cliente</h2>
            <p className='text-muted-foreground text-sm'>
              Informações completas e gerenciamento do cliente
            </p>
          </div>
          <div className='ms-auto'>
            <Button
              onClick={() => refetch()}
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* User Header Card */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-6 md:flex-row'>
              {/* Avatar & Name */}
              <div className='flex items-start gap-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <h3 className='text-xl font-semibold'>{user.name}</h3>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={user.isActive ? 'default' : 'secondary'}
                      className={user.isActive ? 'bg-emerald-600' : ''}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant='outline'>{user.role}</Badge>
                    {user.isEmailVerified && (
                      <Badge variant='outline' className='border-blue-500 text-blue-600'>
                        <Mail className='mr-1 h-3 w-3' /> Email verificado
                      </Badge>
                    )}
                    {user.isPhoneVerified && (
                      <Badge variant='outline' className='border-green-500 text-green-600'>
                        <Phone className='mr-1 h-3 w-3' /> Telefone verificado
                      </Badge>
                    )}
                  </div>
                  {user.referralCode && (
                    <p className='text-muted-foreground text-xs'>
                      Código de indicação: <code className='bg-muted rounded px-1'>{user.referralCode}</code>
                    </p>
                  )}
                </div>
              </div>

              <Separator orientation='vertical' className='hidden md:block' />

              {/* Contact Info */}
              <div className='grid gap-3 text-sm md:grid-cols-2'>
                <div className='flex items-center gap-2'>
                  <Mail className='text-muted-foreground h-4 w-4' />
                  <span>{user.email || '—'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='text-muted-foreground h-4 w-4' />
                  <span>{user.phone || '—'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <span>Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Clock className='text-muted-foreground h-4 w-4' />
                  <span>
                    Último acesso:{' '}
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Nunca'}
                  </span>
                </div>
              </div>

              <Separator orientation='vertical' className='hidden md:block' />

              {/* Quick Stats */}
              <div className='grid grid-cols-2 gap-4 md:grid-cols-1'>
                <div className='text-center md:text-left'>
                  <p className='text-muted-foreground text-xs uppercase'>Saldo Wallet</p>
                  <p className='text-xl font-bold text-emerald-600'>
                    R$ {Number(user.walletBalance).toFixed(2)}
                  </p>
                </div>
                <div className='text-center md:text-left'>
                  <p className='text-muted-foreground text-xs uppercase'>Pontos</p>
                  <p className='flex items-center gap-1 text-xl font-bold text-amber-600'>
                    <Award className='h-5 w-5' />
                    {user.loyaltyPoints}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
              <MiniStatCard label='Pedidos' value={user._count?.orders ?? 0} icon={ShoppingCart} />
              <MiniStatCard label='Avaliações' value={user._count?.reviews ?? 0} icon={Star} />
              <MiniStatCard label='Transações Wallet' value={user._count?.walletTxns ?? 0} icon={Wallet} />
              <MiniStatCard label='Endereços' value={user.addresses?.length ?? 0} icon={MapPin} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='flex-wrap'>
            <TabsTrigger value='overview'>
              <BarChart3 className='mr-1.5 h-4 w-4' />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value='wallet'>
              <Wallet className='mr-1.5 h-4 w-4' />
              Wallet
            </TabsTrigger>
            <TabsTrigger value='orders'>
              <ShoppingCart className='mr-1.5 h-4 w-4' />
              Compras
            </TabsTrigger>
            <TabsTrigger value='top-items'>
              <Star className='mr-1.5 h-4 w-4' />
              Mais Comprados
            </TabsTrigger>
            <TabsTrigger value='addresses'>
              <MapPin className='mr-1.5 h-4 w-4' />
              Endereços
            </TabsTrigger>
            <TabsTrigger value='conversations'>
              <MessageSquare className='mr-1.5 h-4 w-4' />
              Conversas
            </TabsTrigger>
            <TabsTrigger value='access-logs'>
              <Clock className='mr-1.5 h-4 w-4' />
              Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <StatsTab userId={userId} />
          </TabsContent>
          <TabsContent value='wallet'>
            <WalletTab userId={userId} walletBalance={Number(user.walletBalance)} />
          </TabsContent>
          <TabsContent value='orders'>
            <OrdersTab userId={userId} />
          </TabsContent>
          <TabsContent value='top-items'>
            <TopItemsTab userId={userId} />
          </TabsContent>
          <TabsContent value='addresses'>
            <AddressesTab userId={userId} />
          </TabsContent>
          <TabsContent value='conversations'>
            <ConversationsTab userId={userId} />
          </TabsContent>
          <TabsContent value='access-logs'>
            <AccessLogsTab userId={userId} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

// ─── Mini stat card ───

function MiniStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <div className='bg-muted/50 flex items-center gap-3 rounded-lg p-3'>
      <div className='bg-background flex h-10 w-10 items-center justify-center rounded-full'>
        <Icon className='text-muted-foreground h-5 w-5' />
      </div>
      <div>
        <p className='text-lg font-semibold'>{value}</p>
        <p className='text-muted-foreground text-xs'>{label}</p>
      </div>
    </div>
  )
}

// ─── Loading skeleton ───

function UserDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-10 w-10 rounded-md' />
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex gap-6'>
            <Skeleton className='h-20 w-20 rounded-full' />
            <div className='flex-1 space-y-3'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-56' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
          <div className='mt-6 grid grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-16 rounded-lg' />
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-64 w-full' />
    </div>
  )
}
