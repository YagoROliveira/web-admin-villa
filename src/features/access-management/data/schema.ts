import { z } from 'zod'
import { USER_ROLES, PERMISSIONS } from '@/types/auth'

// ─── Schema for a panel user (as returned by API) ───

export const panelUserStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
])

export const panelUserRoleSchema = z.enum(USER_ROLES as unknown as [string, ...string[]])

export const panelUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: panelUserRoleSchema,
  permissions: z.array(z.string()).default([]),
  status: panelUserStatusSchema,
  storeId: z.string().optional().nullable(),
  storeName: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type PanelUser = z.infer<typeof panelUserSchema>

export const panelUserListSchema = z.array(panelUserSchema)

// ─── Schema for updating a user's role/permissions ───

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: panelUserRoleSchema,
  permissions: z.array(z.string()).optional(),
})

export type UpdateUserRolePayload = z.infer<typeof updateUserRoleSchema>

// ─── Schema for inviting a new user ───

export const inviteUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  role: panelUserRoleSchema,
  storeId: z.string().optional(),
})

export type InviteUserPayload = z.infer<typeof inviteUserSchema>
