import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FiSession } from "~/types/session";
import { sessionOptions } from "~/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession<FiSession>(cookieStore, sessionOptions);
  session.destroy();
  return NextResponse.json({ success: true });
}
