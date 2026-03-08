import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { serve } from "@hono/node-server";
import auth from "./routes/auth.js";
import pets from "./routes/pets.js";

const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "X-Fi-Cookies", "X-Session-Id"],
  })
);

app.route("/auth", auth);
app.route("/pets", pets);

app.get("/", (c) => c.redirect("/reference"));
app.get("/health", (c) => c.json({ status: "ok" }));

// OpenAPI spec
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "fi-open-api",
    version: "1.0.0",
    description:
      "REST API wrapping TryFi's GraphQL API. Provides endpoints for pet tracking, activity, sleep, device management, and base stations.",
  },
  servers: [{ url: "http://localhost:3001", description: "Local development" }],
});

// Interactive API reference UI
app.get(
  "/reference",
  Scalar({
    url: "/doc",
    pageTitle: "fi-open-api Reference",
  })
);

const port = Number(process.env.PORT) || 3001;
console.log(`fi-open-api running on port ${port}`);
serve({ fetch: app.fetch, port });
