import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import villamarketApi from '@/lib/villamarket-api'
import { useAuthStore } from '@/stores/auth-store'
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  PaginatedResponse,
} from '../types'

// ─── Query Keys ───

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
}

// ─── Conversations ───

export function useConversations(
  options?: Partial<UseQueryOptions<Conversation[]>>,
) {
  return useQuery<Conversation[]>({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const { data } = await villamarketApi.get('/v1/chat/conversations')
      return data
    },
    staleTime: 30_000, // 30s
    ...options,
  })
}

export function useConversation(
  id: string,
  options?: Partial<UseQueryOptions<Conversation>>,
) {
  return useQuery<Conversation>({
    queryKey: chatKeys.conversation(id),
    queryFn: async () => {
      const { data } = await villamarketApi.get(`/v1/chat/conversations/${id}`)
      return data
    },
    enabled: !!id,
    ...options,
  })
}

// ─── Messages ───

interface UseMessagesParams {
  conversationId: string
  page?: number
  limit?: number
}

export function useMessages(
  { conversationId, page = 1, limit = 50 }: UseMessagesParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<Message>>>,
) {
  return useQuery<PaginatedResponse<Message>>({
    queryKey: [...chatKeys.messages(conversationId), page],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        `/v1/chat/conversations/${conversationId}/messages`,
        { params: { page, limit } },
      )
      return data
    },
    enabled: !!conversationId,
    staleTime: 10_000, // 10s
    ...options,
  })
}

// ─── Mutations ───

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (req: CreateConversationRequest) => {
      const { data } = await villamarketApi.post('/v1/chat/conversations', req)
      return data as Conversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (req: SendMessageRequest) => {
      const { data } = await villamarketApi.post(
        `/v1/chat/conversations/${conversationId}/messages`,
        req,
      )
      return data as Message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      })
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      })
    },
  })
}

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient()
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const { data } = await villamarketApi.patch(
        `/v1/chat/conversations/${conversationId}/read`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(conversationId),
      })
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      })
    },
  })
}
