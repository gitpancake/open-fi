import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FiSession } from "~/types/session";
import { sessionOptions } from "~/lib/session";
import { apiGetTimeline } from "~/lib/api-client";
import type { FiTimelineFeed } from "~/types/fi";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = await getIronSession<FiSession>(cookieStore, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };
  const feed = await apiGetTimeline<FiTimelineFeed>(creds, cursor);

  return NextResponse.json(feed);
}
