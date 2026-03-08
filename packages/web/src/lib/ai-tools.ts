import { tool } from "ai";
import { z } from "zod";
import {
  apiGetPets,
  apiGetPetLocation,
  apiGetPetActivity,
  apiGetPetSleep,
  apiGetPetDetails,
  apiGetPetDevice,
  apiSetPetLedColor,
  type FiCredentials,
} from "~/lib/api-client";

// Types matching fi-open-api responses
interface PetBasic {
  id: string;
  name: string;
  breed?: { name: string };
  gender: string;
  weight: number;
  yearOfBirth: number;
  monthOfBirth: number;
  homeCityState: string;
  photos?: { first?: { image?: { fullSize?: string } } };
  device: { lastConnectionState?: { __typename: string } } | null;
}

interface OngoingActivity {
  __typename: string;
  start: string;
  lastReportTimestamp: string;
  areaName: string;
  distance?: number;
  positions?: Array<{ position: { latitude: number; longitude: number } }>;
  path?: Array<{ latitude: number; longitude: number }>;
  position?: { latitude: number; longitude: number };
  place?: { name: string; address: string };
}

interface ActivityStats {
  dailyStat: { totalSteps: number; stepGoal: number; totalDistance: number };
  weeklyStat: { totalSteps: number; stepGoal: number; totalDistance: number };
  monthlyStat: { totalSteps: number; stepGoal: number; totalDistance: number };
}

interface SleepStats {
  dailyStat: { restSummaries: RestSummary[] };
  weeklyStat: { restSummaries: RestSummary[] };
  monthlyStat: { restSummaries: RestSummary[] };
}

interface RestSummary {
  data?: { sleepAmounts?: Array<{ type: string; duration: number }> };
}

interface PetAllInfo {
  ongoingActivity: OngoingActivity | null;
  dailyStepStat: { totalSteps: number; stepGoal: number; totalDistance: number };
  weeklyStepStat: { totalSteps: number; stepGoal: number; totalDistance: number };
  monthlyStepStat: { totalSteps: number; stepGoal: number; totalDistance: number };
  device: {
    __typename: string;
    lastConnectionState: { __typename: string; date: string };
    operationParams: { mode: string; ledEnabled: boolean };
    ledColor?: { name: string };
  };
  dailySleepStat?: { restSummaries?: Array<{ data?: { sleepAmounts?: Array<{ type: string; duration: number }> } }> };
  monthlySleepStat?: { restSummaries?: Array<{ data?: { sleepAmounts?: Array<{ type: string; duration: number }> } }> };
}

interface LedColor {
  ledColorCode: number;
  hexCode: string;
  name: string;
}

interface PetDevice {
  device: {
    id: string;
    moduleId: string;
    info: string;
    lastConnectionState: { __typename: string; date: string; signalStrengthPercent?: number };
    operationParams: { mode: string; ledEnabled: boolean };
    ledColor?: LedColor;
    availableLedColors: LedColor[];
    nextLocationUpdateExpectedBy: string;
  } | null;
}

export { type FiCredentials } from "~/lib/api-client";

export function createFiTools(creds: FiCredentials) {
  return {
    get_pets: tool({
      description:
        "List all pets in the user's household with their basic info (name, breed, gender, weight, age, photo). Use this when the user asks about their pets or you need to find a pet ID.",
      inputSchema: z.object({}),
      execute: async () => {
        const pets = await apiGetPets<PetBasic[]>(creds);
        return pets.map((p) => ({
          id: p.id,
          name: p.name,
          breed: p.breed?.name,
          gender: p.gender,
          weight: p.weight,
          yearOfBirth: p.yearOfBirth,
          monthOfBirth: p.monthOfBirth,
          homeCityState: p.homeCityState,
          photoUrl: p.photos?.first?.image?.fullSize ?? null,
          hasDevice: p.device !== null,
          connectionState: p.device?.lastConnectionState?.__typename,
        }));
      },
    }),

    get_pet_location: tool({
      description:
        "Get the current location of a specific pet. Returns their current activity (walking or resting), GPS coordinates, place name, and area. Use when the user asks where their dog is.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID to get location for"),
      }),
      execute: async ({ petId }) => {
        const activity = await apiGetPetLocation<OngoingActivity | { status: string }>(creds, petId);
        if ("status" in activity) return { status: "no_data", message: "No current activity data available" };

        const result: Record<string, unknown> = {
          activityType: activity.__typename,
          startTime: activity.start,
          lastReport: activity.lastReportTimestamp,
          areaName: activity.areaName,
        };

        if (activity.__typename === "OngoingWalk") {
          result.distance = activity.distance;
          result.pathLength = activity.path?.length ?? 0;
          if (activity.positions?.length) {
            const latest = activity.positions[activity.positions.length - 1];
            result.latitude = latest.position.latitude;
            result.longitude = latest.position.longitude;
          }
        } else if (activity.__typename === "OngoingRest") {
          if (activity.position) {
            result.latitude = activity.position.latitude;
            result.longitude = activity.position.longitude;
          }
          if (activity.place) {
            result.placeName = activity.place.name;
            result.placeAddress = activity.place.address;
          }
        }

        return result;
      },
    }),

    get_pet_activity: tool({
      description:
        "Get step count and distance stats for a pet. Returns daily, weekly, and monthly totals with step goals. Use when the user asks about steps, distance walked, or activity levels.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID to get activity stats for"),
      }),
      execute: async ({ petId }) => {
        const stats = await apiGetPetActivity<ActivityStats>(creds, petId);
        return {
          daily: {
            steps: stats.dailyStat.totalSteps,
            goal: stats.dailyStat.stepGoal,
            goalPercent: Math.round(
              (stats.dailyStat.totalSteps / stats.dailyStat.stepGoal) * 100
            ),
            distanceMeters: stats.dailyStat.totalDistance,
            distanceMiles: +(stats.dailyStat.totalDistance * 0.000621371).toFixed(2),
          },
          weekly: {
            steps: stats.weeklyStat.totalSteps,
            goal: stats.weeklyStat.stepGoal,
            distanceMeters: stats.weeklyStat.totalDistance,
            distanceMiles: +(stats.weeklyStat.totalDistance * 0.000621371).toFixed(2),
          },
          monthly: {
            steps: stats.monthlyStat.totalSteps,
            goal: stats.monthlyStat.stepGoal,
            distanceMeters: stats.monthlyStat.totalDistance,
            distanceMiles: +(stats.monthlyStat.totalDistance * 0.000621371).toFixed(2),
          },
        };
      },
    }),

    get_pet_sleep: tool({
      description:
        "Get sleep and nap data for a pet. Returns daily, weekly, and monthly sleep/nap durations in minutes. Use when the user asks about sleep, naps, or rest patterns.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID to get sleep data for"),
      }),
      execute: async ({ petId }) => {
        const stats = await apiGetPetSleep<SleepStats>(creds, petId);

        function parseSleep(restSummaries: RestSummary[]) {
          if (!restSummaries?.length) return { sleepMinutes: 0, napMinutes: 0 };
          const amounts = restSummaries[0]?.data?.sleepAmounts ?? [];
          const sleep = amounts.find((a) => a.type === "SLEEP");
          const nap = amounts.find((a) => a.type === "NAP");
          return {
            sleepMinutes: sleep ? Math.round(sleep.duration / 60) : 0,
            napMinutes: nap ? Math.round(nap.duration / 60) : 0,
          };
        }

        return {
          daily: parseSleep(stats.dailyStat.restSummaries),
          weekly: parseSleep(stats.weeklyStat.restSummaries),
          monthly: parseSleep(stats.monthlyStat.restSummaries),
        };
      },
    }),

    get_pet_details: tool({
      description:
        "Get comprehensive info about a pet including activity, sleep, location, and device status all at once. Use when the user asks a general question about their dog or wants an overview.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID to get full details for"),
      }),
      execute: async ({ petId }) => {
        const info = await apiGetPetDetails<PetAllInfo>(creds, petId);
        return {
          activity: {
            daily: {
              steps: info.dailyStepStat.totalSteps,
              goal: info.dailyStepStat.stepGoal,
              distanceMiles: +(info.dailyStepStat.totalDistance * 0.000621371).toFixed(2),
            },
            weekly: {
              steps: info.weeklyStepStat.totalSteps,
              distanceMiles: +(info.weeklyStepStat.totalDistance * 0.000621371).toFixed(2),
            },
            monthly: {
              steps: info.monthlyStepStat.totalSteps,
              distanceMiles: +(info.monthlyStepStat.totalDistance * 0.000621371).toFixed(2),
            },
          },
          location: info.ongoingActivity
            ? {
                type: info.ongoingActivity.__typename,
                areaName: info.ongoingActivity.areaName,
                placeName: info.ongoingActivity.place?.name,
              }
            : null,
          device: {
            connectionType: info.device.lastConnectionState.__typename,
            connectionDate: info.device.lastConnectionState.date,
            mode: info.device.operationParams.mode,
            ledEnabled: info.device.operationParams.ledEnabled,
            ledColor: info.device.ledColor?.name,
          },
          sleep: {
            daily: info.dailySleepStat?.restSummaries?.[0]?.data?.sleepAmounts ?? [],
            monthly: info.monthlySleepStat?.restSummaries?.[0]?.data?.sleepAmounts ?? [],
          },
        };
      },
    }),

    get_device_status: tool({
      description:
        "Get the collar/device status for a pet including battery, connection state, LED status, and operational mode. Use when the user asks about their dog's collar, battery, or connection.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID to get device status for"),
      }),
      execute: async ({ petId }) => {
        const pet = await apiGetPetDevice<PetDevice>(creds, petId);
        if (!pet.device) return { error: "No device found for this pet" };

        const d = pet.device;
        return {
          deviceId: d.id,
          moduleId: d.moduleId,
          firmwareInfo: d.info,
          connectionState: d.lastConnectionState.__typename,
          connectionDate: d.lastConnectionState.date,
          signalStrength: d.lastConnectionState.signalStrengthPercent,
          mode: d.operationParams.mode,
          ledEnabled: d.operationParams.ledEnabled,
          ledColor: d.ledColor?.name,
          ledHexCode: d.ledColor?.hexCode,
          availableColors: d.availableLedColors.map((c) => c.name),
          nextLocationUpdate: d.nextLocationUpdateExpectedBy,
        };
      },
    }),

    set_led_color: tool({
      description:
        "Change the LED color on a pet's Fi collar. Use when the user asks to change their dog's collar color/light. Available colors can be found via get_device_status.",
      inputSchema: z.object({
        petId: z.string().describe("The pet ID whose collar LED to change"),
        colorName: z.string().describe("The color name to set (e.g. 'Red', 'Blue', 'Green'). Must match one of the available colors."),
      }),
      execute: async ({ petId, colorName }) => {
        const pet = await apiGetPetDevice<PetDevice>(creds, petId);
        if (!pet.device) return { error: "No device found for this pet" };

        const available = pet.device.availableLedColors;
        const match = available.find(
          (c) => c.name.toLowerCase() === colorName.toLowerCase()
        );

        if (!match) {
          return {
            error: `Color "${colorName}" not available. Available colors: ${available.map((c) => c.name).join(", ")}`,
          };
        }

        await apiSetPetLedColor(creds, petId, match.ledColorCode);
        return {
          success: true,
          message: `LED color changed to ${match.name}`,
          color: match.name,
          hexCode: match.hexCode,
        };
      },
    }),
  };
}
