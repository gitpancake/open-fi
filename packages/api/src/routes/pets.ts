import { Hono } from "hono";
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

type Env = {
  Variables: {
    creds: FiCredentials;
  };
};

const pets = new Hono<Env>();

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

pets.get("/", async (c) => {
  const creds = c.get("creds");
  const data = await getPetsAndBases(creds);
  return c.json(data);
});

pets.get("/:id/location", async (c) => {
  const creds = c.get("creds");
  const activity = await getPetLocation(creds, c.req.param("id"));
  return c.json(activity ?? { status: "no_data" });
});

pets.get("/:id/activity", async (c) => {
  const creds = c.get("creds");
  const stats = await getPetActivity(creds, c.req.param("id"));
  return c.json(stats);
});

pets.get("/:id/sleep", async (c) => {
  const creds = c.get("creds");
  const stats = await getPetSleep(creds, c.req.param("id"));
  return c.json(stats);
});

pets.get("/:id/details", async (c) => {
  const creds = c.get("creds");
  const info = await getPetAllInfo(creds, c.req.param("id"));
  return c.json(info);
});

pets.get("/:id/device", async (c) => {
  const creds = c.get("creds");
  const pet = await getPetDeviceDetails(creds, c.req.param("id"));
  return c.json(pet);
});

pets.put("/:id/device/led", async (c) => {
  const creds = c.get("creds");
  const { ledColorCode } = await c.req.json<{ ledColorCode: number }>();

  // Get the pet's device to find the moduleId
  const pet = await getPetDeviceDetails(creds, c.req.param("id"));
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" }, 404);
  }

  try {
    const result = await setDeviceLed(creds, pet.device.moduleId, ledColorCode);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
});

pets.put("/:id/device/led-toggle", async (c) => {
  const creds = c.get("creds");
  const { ledEnabled } = await c.req.json<{ ledEnabled: boolean }>();

  const pet = await getPetDeviceDetails(creds, c.req.param("id"));
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" }, 404);
  }

  try {
    const result = await setDeviceLedEnabled(creds, pet.device.moduleId, ledEnabled);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
});

pets.put("/:id/device/lost-mode", async (c) => {
  const creds = c.get("creds");
  const { isLost } = await c.req.json<{ isLost: boolean }>();

  const pet = await getPetDeviceDetails(creds, c.req.param("id"));
  if (!pet.device) {
    return c.json({ error: "No device found for this pet" }, 404);
  }

  try {
    const result = await setLostDogMode(creds, pet.device.moduleId, isLost);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
});

export default pets;
