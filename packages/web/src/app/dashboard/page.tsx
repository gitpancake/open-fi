import { getServerSession } from "~/lib/session";
import { apiGetPets, apiGetPetDetails, apiGetTimeline } from "~/lib/api-client";
import { Dashboard } from "~/components/dashboard";
import type { FiPet, FiBase, FiTimelineFeed } from "~/types/fi";
import type { PetAllInfoResponse } from "~/types/fi";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  let pets: FiPet[] = [];
  let bases: FiBase[] = [];
  let petDetails: PetAllInfoResponse["data"]["pet"] | null = null;
  let timeline: FiTimelineFeed | null = null;

  const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };

  try {
    const data = await apiGetPets<{ pets: FiPet[]; bases: FiBase[] }>(creds);
    pets = data.pets;
    bases = data.bases;
    if (pets.length > 0) {
      const [details, feed] = await Promise.all([
        apiGetPetDetails<PetAllInfoResponse["data"]["pet"]>(creds, pets[0].id),
        apiGetTimeline<FiTimelineFeed>(creds),
      ]);
      petDetails = details;
      timeline = feed;
    }
  } catch (error) {
    console.error("Failed to fetch pet data:", error);
    pets = [];
  }

  return (
    <Dashboard
      pets={pets ?? []}
      bases={bases ?? []}
      initialPetDetails={petDetails}
      initialTimeline={timeline}
      userEmail={session.email}
    />
  );
}
