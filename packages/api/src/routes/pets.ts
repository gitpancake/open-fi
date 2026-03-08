import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { FiCredentials } from "../client.js";
import {
  getPetsAndBases,
  getPetLocation,
  getPetActivity,
  getPetSleep,
  getPetAllInfo,
  getPetDeviceDetails,
  setDeviceLed,
  setDeviceLedEnabled,
  setLostDogMode,
} from "../client.js";
import {
  PetsAndBasesSchema,
  ErrorSchema,
  PetIdParamSchema,
  SetLedBodySchema,
  ToggleLedBodySchema,
  LostModeBodySchema,
} from "../schemas.js";

type Env = {
  Variables: {
    creds: FiCredentials;
  };
};

const pets = new OpenAPIHono<Env>();

// Middleware: extract Fi credentials from headers
pets.use("*", async (c, next) => {
  const fiCookies = c.req.header("X-Fi-Cookies");
  const sessionId = c.req.header("X-Session-Id") || "";

  if (!fiCookies) {
    return c.json({ error: "Missing Fi credentials" }, 401);
  }

  c.set("creds", { sessionId, fiCookies });
  await next();
});

// --- GET / ---
const listPetsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Pets"],
  summary: "List all pets and base stations",
  description: "Returns all pets in the household with device info, plus Wi-Fi base stations.",
  responses: {
    200: {
      content: { "application/json": { schema: PetsAndBasesSchema } },
      description: "Pets and base stations",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(listPetsRoute, async (c) => {
  const creds = c.get("creds");
  const data = await getPetsAndBases(creds);
  return c.json(data as any);
});

// --- GET /:id/location ---
const locationRoute = createRoute({
  method: "get",
  path: "/{id}/location",
  tags: ["Pets"],
  summary: "Get pet's current location",
  description: "Returns the pet's current activity (walking/resting), GPS coordinates, place name, and area.",
  request: { params: PetIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Current location/activity data",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(locationRoute, async (c) => {
  const creds = c.get("creds");
  const activity = await getPetLocation(creds, c.req.valid("param").id);
  return c.json((activity ?? { status: "no_data" }) as any);
});

// --- GET /:id/activity ---
const activityRoute = createRoute({
  method: "get",
  path: "/{id}/activity",
  tags: ["Pets"],
  summary: "Get pet activity stats",
  description: "Returns daily, weekly, and monthly step counts and distance.",
  request: { params: PetIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Activity statistics",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(activityRoute, async (c) => {
  const creds = c.get("creds");
  const stats = await getPetActivity(creds, c.req.valid("param").id);
  return c.json(stats as any);
});

// --- GET /:id/sleep ---
const sleepRoute = createRoute({
  method: "get",
  path: "/{id}/sleep",
  tags: ["Pets"],
  summary: "Get pet sleep data",
  description: "Returns daily, weekly, and monthly sleep and nap durations.",
  request: { params: PetIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Sleep statistics",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(sleepRoute, async (c) => {
  const creds = c.get("creds");
  const stats = await getPetSleep(creds, c.req.valid("param").id);
  return c.json(stats as any);
});

// --- GET /:id/details ---
const detailsRoute = createRoute({
  method: "get",
  path: "/{id}/details",
  tags: ["Pets"],
  summary: "Get comprehensive pet info",
  description: "Returns activity, sleep, location, and device status all at once.",
  request: { params: PetIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Comprehensive pet information",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(detailsRoute, async (c) => {
  const creds = c.get("creds");
  const info = await getPetAllInfo(creds, c.req.valid("param").id);
  return c.json(info as any);
});

// --- GET /:id/device ---
const deviceRoute = createRoute({
  method: "get",
  path: "/{id}/device",
  tags: ["Device"],
  summary: "Get collar/device status",
  description: "Returns collar battery, connection state, LED status, firmware, and operational mode.",
  request: { params: PetIdParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Device status",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
  },
});

pets.openapi(deviceRoute, async (c) => {
  const creds = c.get("creds");
  const pet = await getPetDeviceDetails(creds, c.req.valid("param").id);
  return c.json(pet as any);
});

// --- PUT /:id/device/led ---
const setLedRoute = createRoute({
  method: "put",
  path: "/{id}/device/led",
  tags: ["Device"],
  summary: "Change collar LED color",
  description: "Set the LED color on the pet's Fi collar by color code.",
  request: {
    params: PetIdParamSchema,
    body: {
      content: { "application/json": { schema: SetLedBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "LED color updated",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "No device found for this pet",
    },
    502: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Upstream API error",
    },
  },
});

pets.openapi(setLedRoute, async (c) => {
  const creds = c.get("creds");
  const { ledColorCode } = c.req.valid("json");

  const pet = await getPetDeviceDetails(creds, c.req.valid("param").id);
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" } as any, 404);
  }

  try {
    const result = await setDeviceLed(creds, pet.device.moduleId, ledColorCode);
    return c.json(result as any);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message } as any, 502);
  }
});

// --- PUT /:id/device/led-toggle ---
const toggleLedRoute = createRoute({
  method: "put",
  path: "/{id}/device/led-toggle",
  tags: ["Device"],
  summary: "Toggle collar LED on/off",
  description: "Turn the LED on the pet's Fi collar on or off.",
  request: {
    params: PetIdParamSchema,
    body: {
      content: { "application/json": { schema: ToggleLedBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "LED toggled",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "No device found for this pet",
    },
    502: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Upstream API error",
    },
  },
});

pets.openapi(toggleLedRoute, async (c) => {
  const creds = c.get("creds");
  const { ledEnabled } = c.req.valid("json");

  const pet = await getPetDeviceDetails(creds, c.req.valid("param").id);
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" } as any, 404);
  }

  try {
    const result = await setDeviceLedEnabled(creds, pet.device.moduleId, ledEnabled);
    return c.json(result as any);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message } as any, 502);
  }
});

// --- PUT /:id/device/lost-mode ---
const lostModeRoute = createRoute({
  method: "put",
  path: "/{id}/device/lost-mode",
  tags: ["Device"],
  summary: "Toggle Lost Dog Mode",
  description: "Enable or disable Lost Dog Mode, which increases GPS tracking frequency to help find the dog.",
  request: {
    params: PetIdParamSchema,
    body: {
      content: { "application/json": { schema: LostModeBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({}).passthrough() } },
      description: "Lost mode toggled",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Missing Fi credentials",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "No device found for this pet",
    },
    502: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Upstream API error",
    },
  },
});

pets.openapi(lostModeRoute, async (c) => {
  const creds = c.get("creds");
  const { isLost } = c.req.valid("json");

  const pet = await getPetDeviceDetails(creds, c.req.valid("param").id);
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" } as any, 404);
  }

  try {
    const result = await setLostDogMode(creds, pet.device.moduleId, isLost);
    return c.json(result as any);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message } as any, 502);
  }
});

export default pets;
