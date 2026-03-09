import {
  API_HOST,
  API_GRAPHQL,
  buildHouseholdsQuery,
  buildPetLocationQuery,
  buildPetActivityQuery,
  buildPetRestQuery,
  buildPetAllInfoQuery,
  buildPetDeviceQuery,
  buildSetLedMutation,
  buildUpdateDeviceOpsMutation,
  buildTimelineQuery,
} from "./queries.js";
import type {
  HouseholdsResponse,
  PetLocationResponse,
  PetActivityResponse,
  PetRestResponse,
  PetAllInfoResponse,
  FiUser,
  FiPet,
} from "./types.js";

const GRAPHQL_URL = API_HOST + API_GRAPHQL;

export interface FiCredentials {
  sessionId: string;
  fiCookies: string;
}

async function fiQuery<T>(
  creds: FiCredentials,
  queryString: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const body: Record<string, unknown> = { query: queryString };
  if (variables) body.variables = variables;

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: creds.fiCookies,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fi API error: ${res.status} ${res.statusText} - ${body}`);
  }

  return res.json();
}

export async function getHouseholds(creds: FiCredentials): Promise<FiUser> {
  const query = buildHouseholdsQuery();
  const res = await fiQuery<HouseholdsResponse>(creds, query);
  return res.data.currentUser;
}

export async function getAllPets(creds: FiCredentials): Promise<FiPet[]> {
  const user = await getHouseholds(creds);
  return user.userHouseholds.flatMap((h) =>
    h.household.pets.filter((p) => p.device !== null)
  );
}

export async function getPetsAndBases(creds: FiCredentials) {
  const user = await getHouseholds(creds);
  const pets = user.userHouseholds.flatMap((h) =>
    h.household.pets.filter((p) => p.device !== null)
  );
  const bases = user.userHouseholds.flatMap((h) => h.household.bases ?? []);
  return { pets, bases };
}

export async function getPetLocation(creds: FiCredentials, petId: string) {
  const query = buildPetLocationQuery(petId);
  const res = await fiQuery<PetLocationResponse>(creds, query);
  return res.data.pet.ongoingActivity;
}

export async function getPetActivity(creds: FiCredentials, petId: string) {
  const query = buildPetActivityQuery(petId);
  const res = await fiQuery<PetActivityResponse>(creds, query);
  return res.data.pet;
}

export async function getPetSleep(creds: FiCredentials, petId: string) {
  const query = buildPetRestQuery(petId);
  const res = await fiQuery<PetRestResponse>(creds, query);
  return res.data.pet;
}

export async function getPetAllInfo(creds: FiCredentials, petId: string) {
  const query = buildPetAllInfoQuery(petId);
  const res = await fiQuery<PetAllInfoResponse>(creds, query);
  return res.data.pet;
}

export async function getPetDeviceDetails(creds: FiCredentials, petId: string) {
  const query = buildPetDeviceQuery(petId);
  const res = await fiQuery<{ data: { pet: FiPet } }>(creds, query);
  return res.data.pet;
}

export async function setDeviceLed(
  creds: FiCredentials,
  moduleId: string,
  ledColorCode: number
) {
  const query = buildSetLedMutation();
  const res = await fiQuery<{ data: { setDeviceLed: FiPet["device"] } }>(
    creds,
    query,
    { moduleId, ledColorCode }
  );
  return res.data.setDeviceLed;
}

export async function setDeviceLedEnabled(
  creds: FiCredentials,
  moduleId: string,
  ledEnabled: boolean
) {
  const query = buildUpdateDeviceOpsMutation();
  const res = await fiQuery<{ data: { updateDeviceOperationParams: FiPet["device"] } }>(
    creds,
    query,
    { input: { moduleId, ledEnabled } }
  );
  return res.data.updateDeviceOperationParams;
}

export async function getTimeline(
  creds: FiCredentials,
  cursor?: string | null,
  includeTravel = true
) {
  const query = buildTimelineQuery();
  const variables: Record<string, unknown> = {
    filter: "ALL",
    includeTravel,
    pagingInstruction: cursor ? { cursor, direction: "BACKWARD" } : null,
  };
  const res = await fiQuery<{
    data: {
      currentUser: {
        fiFeed: {
          feedItems: unknown[];
          pageInfo: {
            startCursor: string;
            endCursor: string;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
          };
        };
      };
    };
  }>(creds, query, variables);
  return res.data.currentUser.fiFeed;
}

export async function setLostDogMode(
  creds: FiCredentials,
  moduleId: string,
  isLost: boolean
) {
  const query = buildUpdateDeviceOpsMutation();
  const mode = isLost ? "LOST_DOG" : "NORMAL";
  const res = await fiQuery<{ data: { updateDeviceOperationParams: FiPet["device"] } }>(
    creds,
    query,
    { input: { moduleId, mode } }
  );
  return res.data.updateDeviceOperationParams;
}
