import { Hono } from "hono";
import { API_HOST, API_LOGIN } from "../queries.js";

const auth = new Hono();

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const fiResponse = await fetch(API_HOST + API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password }).toString(),
  });

  if (!fiResponse.ok) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const data = await fiResponse.json();

  if (data.error) {
    return c.json({ error: data.error.message || "Login failed" }, 401);
  }

  // Extract cookie name=value pairs from Set-Cookie headers
  const setCookieHeaders = fiResponse.headers.getSetCookie();
  const cookiePairs = setCookieHeaders
    .map((h: string) => h.split(";")[0])
    .join("; ");

  return c.json({
    userId: data.userId,
    sessionId: data.sessionId,
    fiCookies: cookiePairs,
  });
});

export default auth;
