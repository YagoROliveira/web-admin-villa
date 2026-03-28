import { z } from 'zod'

// ─── Coordinate point ───
export const coordinatePointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export type CoordinatePoint = z.infer<typeof coordinatePointSchema>

// ─── Delivery fee surge ───
export const deliveryFeeSurgeSchema = z.object({
  enabled: z.boolean().default(false),
  percentage: z.number().min(0).default(0),
  message: z.string().optional().default(''),
})

// ─── Module Zone pivot (from API) ───
export const moduleZoneSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  zoneId: z.string(),
  perKmShippingCharge: z.coerce.number().default(0),
  minShippingCharge: z.coerce.number().default(0),
  maxShippingCharge: z.coerce.number().default(0),
  maxCodAmount: z.coerce.number().default(0),
  module: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      icon: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    })
    .optional(),
})

export type ModuleZone = z.infer<typeof moduleZoneSchema>

// ─── Full zone from API ───
export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullable().optional(),
  coordinates: z.any(), // GeoJSON Polygon
  isActive: z.boolean(),
  cashOnDelivery: z.boolean(),
  digitalPayment: z.boolean(),
  offlinePayment: z.boolean(),
  deliveryFeeSurge: z.any().nullable().optional(),
  customerTopic: z.string().nullable().optional(),
  storeTopic: z.string().nullable().optional(),
  driverTopic: z.string().nullable().optional(),
  moduleZones: z.array(moduleZoneSchema).optional(),
  _count: z
    .object({
      stores: z.number().optional(),
      deliveryMen: z.number().optional(),
      moduleZones: z.number().optional(),
    })
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Zone = z.infer<typeof zoneSchema>

// ─── Form schema (create / edit) ───
export const zoneFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  displayName: z.string().optional().default(''),
  coordinates: z
    .array(coordinatePointSchema)
    .min(3, 'Desenhe um polígono com pelo menos 3 pontos'),
  isActive: z.boolean().default(true),
  cashOnDelivery: z.boolean().default(true),
  digitalPayment: z.boolean().default(true),
  offlinePayment: z.boolean().default(false),
  deliveryFeeSurge: deliveryFeeSurgeSchema.optional(),
})

export type ZoneFormValues = z.infer<typeof zoneFormSchema>

// ─── Module assignment payload ───
export const zoneModulePayloadSchema = z.object({
  moduleId: z.string(),
  perKmShippingCharge: z.coerce.number().min(0).default(0),
  minShippingCharge: z.coerce.number().min(0).default(0),
  maxShippingCharge: z.coerce.number().min(0).default(0),
  maxCodAmount: z.coerce.number().min(0).default(0),
})

export type ZoneModulePayload = z.infer<typeof zoneModulePayloadSchema>
