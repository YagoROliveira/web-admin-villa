import { useState, useRef, useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Paperclip,
  Phone,
  ImagePlus,
  Plus,
  Search as SearchIcon,
  Send,
  Video,
  MessagesSquare,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NewChat } from './components/new-chat'
import { useAuthStore } from '@/stores/auth-store'
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from './hooks/use-chat-api'
import type { Conversation, Message } from './types'

export function Chats() {
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [mobileSelectedConversation, setMobileSelectedConversation] =
    useState<Conversation | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { auth } = useAuthStore()
  const currentUserId = auth.user?.id ?? ''

  // ─── API hooks ───
  const { data: conversationsList = [], isLoading: loadingConversations } =
    useConversations()
  const { data: messagesData, isLoading: loadingMessages } = useMessages(
    { conversationId: selectedConversation?._id ?? '' },
    { enabled: !!selectedConversation },
  )
  const sendMessageMutation = useSendMessage(
    selectedConversation?._id ?? '',
  )
  const markReadMutation = useMarkConversationRead(
    selectedConversation?._id ?? '',
  )

  // Mark as read when selecting a conversation
  useEffect(() => {
    if (selectedConversation?._id) {
      markReadMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?._id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesData])

  // ─── Helpers ───
  const getConversationName = (conv: Conversation) => {
    if (conv.title) return conv.title
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== currentUserId,
    )
    return otherParticipant?.userId ?? 'Chat'
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  const filteredConversations = conversationsList.filter((conv) => {
    const name = getConversationName(conv)
    return name.toLowerCase().includes(search.trim().toLowerCase())
  })

  const messages: Message[] = messagesData?.data ?? []

  const groupedMessages = messages.reduce(
    (acc: Record<string, Message[]>, msg) => {
      const key = format(new Date(msg.createdAt), 'd MMM, yyyy')
      if (!acc[key]) acc[key] = []
      acc[key].push(msg)
      return acc
    },
    {},
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const text = messageInput.trim()
    if (!text || !selectedConversation) return

    sendMessageMutation.mutate(
      { content: text, type: 'text' },
      { onSuccess: () => setMessageInput('') },
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <MessagesSquare size={20} />
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <Edit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>

              <label
                className={cn(
                  'focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden',
                  'border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2'
                )}
              >
                <SearchIcon size={15} className='me-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
              {loadingConversations ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='size-6 animate-spin text-muted-foreground' />
                </div>
              ) : filteredConversations.length === 0 ? (
                <p className='text-muted-foreground py-4 text-center text-sm'>
                  Nenhuma conversa encontrada
                </p>
              ) : (
                filteredConversations.map((conv) => {
                  const name = getConversationName(conv)
                  const lastMsg = conv.lastMessage
                    ? conv.lastMessage.senderId === currentUserId
                      ? `Você: ${conv.lastMessage.content ?? ''}`
                      : conv.lastMessage.content ?? ''
                    : 'Sem mensagens'
                  const myParticipant = conv.participants.find(
                    (p) => p.userId === currentUserId,
                  )
                  const unread = myParticipant?.unreadCount ?? 0

                  return (
                    <Fragment key={conv._id}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground',
                          `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                          selectedConversation?._id === conv._id && 'sm:bg-muted',
                        )}
                        onClick={() => {
                          setSelectedConversation(conv)
                          setMobileSelectedConversation(conv)
                        }}
                      >
                        <div className='flex gap-2'>
                          <Avatar>
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                              <span className='col-start-2 row-span-2 font-medium'>
                                {name}
                              </span>
                              {unread > 0 && (
                                <span className='bg-primary text-primary-foreground ml-1 flex size-5 items-center justify-center rounded-full text-xs'>
                                  {unread}
                                </span>
                              )}
                            </div>
                            <span className='text-muted-foreground group-hover:text-accent-foreground/90 col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis'>
                              {lastMsg}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedConversation ? (
            <div
              className={cn(
                'bg-background absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
                mobileSelectedConversation && 'start-0 flex'
              )}
            >
              {/* Top Part */}
              <div className='bg-card mb-1 flex flex-none justify-between p-4 shadow-lg sm:rounded-t-md'>
                {/* Left */}
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ms-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedConversation(null)}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Avatar className='size-9 lg:size-11'>
                      <AvatarFallback>
                        {getInitials(getConversationName(selectedConversation))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {getConversationName(selectedConversation)}
                      </span>
                      <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                        {selectedConversation.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className='-me-1 flex items-center gap-1 lg:gap-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                  >
                    <Video size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                  >
                    <Phone size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                  >
                    <MoreVertical className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Conversation */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden'>
                    <div className='chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4'>
                      {loadingMessages ? (
                        <div className='flex items-center justify-center py-8'>
                          <Loader2 className='size-6 animate-spin text-muted-foreground' />
                        </div>
                      ) : (
                        Object.keys(groupedMessages).map((key) => (
                          <Fragment key={key}>
                            {groupedMessages[key].map((msg, index) => (
                              <div
                                key={msg._id || `${msg.senderId}-${index}`}
                                className={cn(
                                  'chat-box max-w-72 px-3 py-2 break-words shadow-lg',
                                  msg.senderId === currentUserId
                                    ? 'bg-primary/90 text-primary-foreground/75 self-end rounded-[16px_16px_0_16px]'
                                    : 'bg-muted self-start rounded-[16px_16px_16px_0]'
                                )}
                              >
                                {msg.senderName &&
                                  msg.senderId !== currentUserId && (
                                    <span className='text-xs font-semibold block mb-0.5'>
                                      {msg.senderName}
                                    </span>
                                  )}
                                {msg.content}{' '}
                                <span
                                  className={cn(
                                    'text-foreground/75 mt-1 block text-xs font-light italic',
                                    msg.senderId === currentUserId &&
                                    'text-primary-foreground/85 text-end'
                                  )}
                                >
                                  {format(new Date(msg.createdAt), 'h:mm a')}
                                </span>
                              </div>
                            ))}
                            <div className='text-center text-xs'>{key}</div>
                          </Fragment>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
                <form
                  className='flex w-full flex-none gap-2'
                  onSubmit={handleSendMessage}
                >
                  <div className='border-input bg-card focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4'>
                    <div className='space-x-1'>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='h-8 rounded-md'
                      >
                        <Plus size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <ImagePlus
                          size={20}
                          className='stroke-muted-foreground'
                        />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <Paperclip
                          size={20}
                          className='stroke-muted-foreground'
                        />
                      </Button>
                    </div>
                    <label className='flex-1'>
                      <span className='sr-only'>Chat Text Box</span>
                      <input
                        type='text'
                        placeholder='Digite sua mensagem...'
                        className='h-8 w-full bg-inherit focus-visible:outline-hidden'
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      />
                    </label>
                    <Button
                      variant='ghost'
                      size='icon'
                      type='submit'
                      className='hidden sm:inline-flex'
                      disabled={sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 size={20} className='animate-spin' />
                      ) : (
                        <Send size={20} />
                      )}
                    </Button>
                  </div>
                  <Button
                    type='submit'
                    className='h-full sm:hidden'
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send size={18} /> Enviar
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <MessagesSquare className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Suas mensagens</h1>
                  <p className='text-muted-foreground text-sm'>
                    Envie uma mensagem para iniciar uma conversa.
                  </p>
                </div>
                <Button onClick={() => setCreateConversationDialog(true)}>
                  Enviar mensagem
                </Button>
              </div>
            </div>
          )}
        </section>
        <NewChat
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
        />
      </Main>
    </>
  )
}
