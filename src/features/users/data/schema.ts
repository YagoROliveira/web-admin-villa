import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('ACTIVE'),
  z.literal('INACTIVE'),
  z.literal('SUSPENDED'),
  z.literal('PENDING_VERIFICATION'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('USER'),
  z.literal('MANAGER'),
  z.literal('CASHIER'),
])

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string().optional(),
  status: userStatusSchema,
  role: userRoleSchema,
  balance: z.number().optional(),
  accountNo: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
