import { z } from 'zod'

const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),
  walletBalance: z.number(),
  loyaltyPoints: z.number(),
  referralCode: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({
    orders: z.number(),
    addresses: z.number(),
  }),
})
export type Customer = z.infer<typeof customerSchema>

export const customerListSchema = z.array(customerSchema)
