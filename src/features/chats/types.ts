/**
 * Chat types matching the villamarket-api Mongoose schemas.
 */

// ─── Enums ───

export type ConversationType = 'direct' | 'group' | 'support' | 'order'

export type ParticipantType =
  | 'customer'
  | 'vendor'
  | 'admin'
  | 'delivery_man'
  | 'system'

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'location'
  | 'order_link'
  | 'product_link'
  | 'system_event'

// ─── Sub-documents ───

export interface ChatParticipant {
  userId: string
  userType: ParticipantType
  joinedAt: string
  lastReadAt?: string
  unreadCount: number
  isMuted: boolean
  isAdmin: boolean
}

export interface MessageMedia {
  url: string
  mimeType: string
  fileName?: string
  fileSize?: number
  thumbnailUrl?: string
  duration?: number
}

export interface MessageLocation {
  lat: number
  lng: number
  address?: string
}

export interface MessageReference {
  type: string
  id: string
  title?: string
  imageUrl?: string
}

export interface LastMessage {
  content?: string
  senderId: string
  senderName?: string
  type: MessageType
  sentAt: string
}

// ─── Main Models ───

export interface Conversation {
  _id: string
  type: ConversationType
  participants: ChatParticipant[]
  lastMessage?: LastMessage
  storeId?: string
  orderId?: string
  title?: string
  metadata?: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderType: ParticipantType
  senderName?: string
  type: MessageType
  content?: string
  media?: MessageMedia
  location?: MessageLocation
  reference?: MessageReference
  readBy: string[]
  deliveredTo: string[]
  replyToId?: string
  isEdited: boolean
  editedAt?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// ─── API Request/Response ───

export interface CreateConversationRequest {
  type: ConversationType
  participantIds: string[]
  participantTypes?: ParticipantType[]
  title?: string
  storeId?: string
  orderId?: string
}

export interface SendMessageRequest {
  content?: string
  type?: MessageType
  media?: MessageMedia
  location?: MessageLocation
  reference?: MessageReference
  replyToId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Legacy compat — used by existing UI components ───

/** Simplified user-like shape for the conversation list sidebar */
export interface ChatUser {
  id: string
  fullName: string
  username: string
  profile?: string
  title?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline?: boolean
  conversationType: ConversationType
}

/** Single message display shape */
export interface Convo {
  sender: string
  message: string
  timestamp: string
}
