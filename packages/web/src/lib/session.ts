import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { FiSession } from "~/types/session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "open-fi-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getServerSession(): Promise<FiSession | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<FiSession>(cookieStore, sessionOptions);
  if (!session.userId) return null;
  return session;
}
