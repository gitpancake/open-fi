import { getServerSession } from "~/lib/session";
import { apiGetPets, apiGetPetDetails, apiGetTimeline, apiGetHealthTrends, apiGetRankings } from "~/lib/api-client";
import { Dashboard } from "~/components/dashboard";
import type { FiPet, FiBase, FiTimelineFeed, FiHealthTrendsResponse, FiPack } from "~/types/fi";
import type { PetAllInfoResponse } from "~/types/fi";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  let pets: FiPet[] = [];
  let bases: FiBase[] = [];
  let petDetails: PetAllInfoResponse["data"]["pet"] | null = null;
  let timeline: FiTimelineFeed | null = null;
  let healthTrends: FiHealthTrendsResponse | null = null;
  let rankings: FiPack[] = [];

  const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };

  try {
    const data = await apiGetPets<{ pets: FiPet[]; bases: FiBase[] }>(creds);
    pets = data.pets;
    bases = data.bases;
    if (pets.length > 0) {
      const [detailsResult, feedResult, trendsResult, rankingsResult] = await Promise.allSettled([
        apiGetPetDetails<PetAllInfoResponse["data"]["pet"]>(creds, pets[0].id),
        apiGetTimeline<FiTimelineFeed>(creds),
        apiGetHealthTrends<FiHealthTrendsResponse>(creds, pets[0].id, "DAY"),
        apiGetRankings<{ packs: FiPack[] }>(creds, pets[0].id),
      ]);
      petDetails = detailsResult.status === "fulfilled" ? detailsResult.value : null;
      timeline = feedResult.status === "fulfilled" ? feedResult.value : null;
      healthTrends = trendsResult.status === "fulfilled" ? trendsResult.value : null;
      rankings = rankingsResult.status === "fulfilled" ? (rankingsResult.value.packs ?? []) : [];
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
      initialHealthTrends={healthTrends}
      initialRankings={rankings}
      userEmail={session.email}
    />
  );
}
