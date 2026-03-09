import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FiSession } from "~/types/session";
import { sessionOptions } from "~/lib/session";
import { apiGetHealthTrends } from "~/lib/api-client";
import type { FiHealthTrendsResponse } from "~/types/fi";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const cookieStore = await cookies();
  const session = await getIronSession<FiSession>(cookieStore, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { petId } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "DAY";

  const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };
  const trends = await apiGetHealthTrends<FiHealthTrendsResponse>(creds, petId, period);

  return NextResponse.json(trends);
}
