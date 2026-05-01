import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { API_HOST, API_LOGIN } from "../queries.js";
import { LoginHeadersSchema, LoginResponseSchema, ErrorSchema } from "../schemas.js";

const auth = new OpenAPIHono();

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  summary: "Login with Fi credentials",
  description:
    "Authenticate with TryFi email and password supplied via X-Fi-Email and X-Fi-Password headers. Returns session cookies needed for all pet endpoints.",
  request: {
    headers: LoginHeadersSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: LoginResponseSchema } },
      description: "Login successful",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Invalid credentials",
    },
  },
});

auth.openapi(loginRoute, async (c) => {
  const headers = c.req.valid("header");
  const email = headers["x-fi-email"];
  const password = headers["x-fi-password"];

  const fiResponse = await fetch(API_HOST + API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password }).toString(),
  });

  if (!fiResponse.ok) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const data = (await fiResponse.json()) as {
    userId?: string;
    sessionId?: string;
    error?: { message?: string };
  };

  if (data.error) {
    return c.json({ error: data.error.message || "Login failed" }, 401);
  }

  const setCookieHeaders = fiResponse.headers.getSetCookie();
  const cookiePairs = setCookieHeaders
    .map((h: string) => h.split(";")[0])
    .join("; ");

  return c.json(
    { userId: data.userId!, sessionId: data.sessionId!, fiCookies: cookiePairs } as any,
  );
});

export default auth;
