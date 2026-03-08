import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import auth from "./routes/auth.js";
import pets from "./routes/pets.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "X-Fi-Cookies", "X-Session-Id"],
  })
);

app.route("/auth", auth);
app.route("/pets", pets);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3001;
console.log(`fi-open-api running on port ${port}`);
serve({ fetch: app.fetch, port });
