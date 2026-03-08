import { getServerSession } from "~/lib/session";
import { apiGetPets, apiGetPetDetails } from "~/lib/api-client";
import { Dashboard } from "~/components/dashboard";
import type { FiPet } from "~/types/fi";
import type { PetAllInfoResponse } from "~/types/fi";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  let pets: FiPet[] = [];
  let petDetails: PetAllInfoResponse["data"]["pet"] | null = null;

  const creds = { sessionId: session.sessionId, fiCookies: session.fiCookies };

  try {
    pets = await apiGetPets<FiPet[]>(creds);
    if (pets.length > 0) {
      petDetails = await apiGetPetDetails<PetAllInfoResponse["data"]["pet"]>(creds, pets[0].id);
    }
  } catch (error) {
    console.error("Failed to fetch pet data:", error);
    pets = [];
  }

  return (
    <Dashboard
      pets={pets ?? []}
      initialPetDetails={petDetails}
      userEmail={session.email}
    />
  );
}
