import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FiSession } from "~/types/session";
import { sessionOptions } from "~/lib/session";
import { apiLogin } from "~/lib/api-client";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const result = await apiLogin(email, password);

    const cookieStore = await cookies();
    const session = await getIronSession<FiSession>(cookieStore, sessionOptions);
    session.userId = result.userId;
    session.sessionId = result.sessionId;
    session.fiCookies = result.fiCookies;
    session.email = email;
    await session.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
