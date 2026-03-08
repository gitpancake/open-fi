import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FiSession } from "~/types/session";
import { sessionOptions } from "~/lib/session";
import { createFiTools } from "~/lib/ai-tools";
import { apiGetPets } from "~/lib/api-client";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await getIronSession<FiSession>(cookieStore, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await request.json();

  // Fetch pet list for system prompt context
  let petContext = "";
  try {
    const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };
    const pets = await apiGetPets<Array<{ id: string; name: string; breed?: { name: string }; gender: string; weight: number }>>(creds);
    petContext = pets
      .map(
        (p) =>
          `- ${p.name} (ID: ${p.id}, Breed: ${p.breed?.name}, Gender: ${p.gender}, Weight: ${p.weight}lb)`
      )
      .join("\n");
  } catch {
    petContext = "Unable to fetch pet list. Ask the user to re-login if tools fail.";
  }

  const tools = createFiTools({ sessionId: session.sessionId, fiCookies: session.fiCookies });

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a helpful assistant for the open-fi app, which connects to TryFi dog collar data. You help users check on their dogs by querying the Fi API using your tools.

The user's pets:
${petContext}

Guidelines:
- When the user asks about "my dog" and they have one pet, use that pet's ID automatically.
- If they have multiple pets, ask which one unless it's obvious from context.
- Convert distances from meters to miles when presenting to the user.
- Convert sleep/nap durations from minutes to hours and minutes for readability.
- Be friendly and concise. Use the dog's name in responses.
- If a tool returns no data, let the user know gently.
- For step goals, mention the percentage of the daily goal achieved.
- You can call multiple tools if needed to answer a comprehensive question.`,
    messages: await convertToModelMessages(messages),
    tools,
  });

  return result.toUIMessageStreamResponse();
}
