import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/lib/session";
import { apiSetPetLedColor } from "~/lib/api-client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { petId } = await params;
  const { ledColorCode } = await req.json();

  const creds = {
    sessionId: session.sessionId,
    fiCookies: session.fiCookies,
  };

  const result = await apiSetPetLedColor(creds, petId, ledColorCode);
  return NextResponse.json(result);
}
