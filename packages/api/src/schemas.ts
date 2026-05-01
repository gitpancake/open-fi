import { z } from "@hono/zod-openapi";

// --- Shared response schemas ---

export const ErrorSchema = z.object({
  error: z.string(),
}).openapi("Error");

// --- Auth schemas ---

export const LoginHeadersSchema = z.object({
  "x-fi-email": z.string().email(),
  "x-fi-password": z.string().min(1),
}).openapi("LoginHeaders");

export const LoginResponseSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  fiCookies: z.string(),
}).openapi("LoginResponse");

// --- Pet schemas ---

export const BreedSchema = z.object({
  __typename: z.string(),
  id: z.string(),
  name: z.string(),
}).openapi("Breed");

export const PhotoSchema = z.object({
  __typename: z.string(),
  id: z.string(),
  date: z.string(),
  image: z.object({ __typename: z.string(), fullSize: z.string() }),
}).openapi("Photo");

export const LedColorSchema = z.object({
  __typename: z.string(),
  ledColorCode: z.number(),
  hexCode: z.string(),
  name: z.string(),
}).openapi("LedColor");

export const ConnectionStateSchema = z.object({
  __typename: z.string(),
  date: z.string(),
  user: z.object({ __typename: z.string(), id: z.string(), firstName: z.string() }).optional(),
  chargingBase: z.object({ __typename: z.string(), id: z.string() }).optional(),
  signalStrengthPercent: z.number().optional(),
  unknownConnectivity: z.boolean().optional(),
}).openapi("ConnectionState");

export const OperationParamsSchema = z.object({
  __typename: z.string(),
  mode: z.string(),
  ledEnabled: z.boolean(),
  ledOffAt: z.string().nullable(),
}).openapi("OperationParams");

export const DeviceInfoSchema = z.object({
  __typename: z.string(),
  buildId: z.string(),
  batteryPercent: z.number(),
  isCharging: z.boolean().optional(),
  temperature: z.number().optional(),
}).openapi("DeviceInfo");

export const DeviceSchema = z.object({
  __typename: z.string(),
  id: z.string(),
  moduleId: z.string(),
  info: DeviceInfoSchema,
  nextLocationUpdateExpectedBy: z.string(),
  operationParams: OperationParamsSchema,
  lastConnectionState: ConnectionStateSchema,
  ledColor: LedColorSchema,
  availableLedColors: z.array(LedColorSchema),
}).openapi("Device");

export const PositionSchema = z.object({
  __typename: z.string(),
  latitude: z.number(),
  longitude: z.number(),
}).openapi("Position");

export const BaseSchema = z.object({
  __typename: z.string(),
  baseId: z.string(),
  name: z.string(),
  position: PositionSchema,
  infoLastUpdated: z.string(),
  networkName: z.string(),
  online: z.boolean(),
  onlineQuality: z.string(),
}).openapi("Base");

export const PetSchema = z.object({
  __typename: z.string(),
  id: z.string(),
  name: z.string(),
  homeCityState: z.string(),
  yearOfBirth: z.number(),
  monthOfBirth: z.number(),
  dayOfBirth: z.number(),
  gender: z.string(),
  weight: z.number(),
  isPurebred: z.boolean(),
  breed: BreedSchema,
  photos: z.object({
    __typename: z.string(),
    first: PhotoSchema.nullable(),
    items: z.array(PhotoSchema),
  }),
  chip: z.object({ __typename: z.string(), shortId: z.string() }).optional(),
  device: DeviceSchema.nullable(),
}).openapi("Pet");

export const PetsAndBasesSchema = z.object({
  pets: z.array(PetSchema),
  bases: z.array(BaseSchema),
}).openapi("PetsAndBases");

// --- Request body schemas ---

export const SetLedBodySchema = z.object({
  ledColorCode: z.number(),
}).openapi("SetLedBody");

export const ToggleLedBodySchema = z.object({
  ledEnabled: z.boolean(),
}).openapi("ToggleLedBody");

export const LostModeBodySchema = z.object({
  isLost: z.boolean(),
}).openapi("LostModeBody");

// --- Path params ---

export const PetIdParamSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" }, description: "Pet ID" }),
});
