import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/lib/session";
import { apiSetPetLedEnabled } from "~/lib/api-client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { petId } = await params;
  const { ledEnabled } = await req.json();

  const creds = {
    sessionId: session.sessionId,
    fiCookies: session.fiCookies,
  };

  try {
    const result = await apiSetPetLedEnabled(creds, petId, ledEnabled);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
