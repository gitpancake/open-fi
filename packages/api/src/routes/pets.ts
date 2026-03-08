import { Hono } from "hono";
import type { FiCredentials } from "../client.js";
import {
  getAllPets,
  getPetLocation,
  getPetActivity,
  getPetSleep,
  getPetAllInfo,
  getPetDeviceDetails,
  setDeviceLed,
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
  const petsList = await getAllPets(creds);
  return c.json(petsList);
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

  const result = await setDeviceLed(creds, pet.device.moduleId, ledColorCode);
  return c.json(result);
});

export default pets;
