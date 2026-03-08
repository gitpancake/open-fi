// TypeScript interfaces matching the Fi GraphQL API response shapes

export interface FiBreed {
  __typename: string;
  id: string;
  name: string;
}

export interface FiPhoto {
  __typename: string;
  id: string;
  date: string;
  image: {
    __typename: string;
    fullSize: string;
  };
}

export interface FiLedColor {
  __typename: string;
  ledColorCode: number;
  hexCode: string;
  name: string;
}

export interface FiConnectionState {
  __typename: string;
  date: string;
  user?: { __typename: string; id: string; firstName: string };
  chargingBase?: { __typename: string; id: string };
  signalStrengthPercent?: number;
  unknownConnectivity?: boolean;
}

export interface FiOperationParams {
  __typename: string;
  mode: string;
  ledEnabled: boolean;
  ledOffAt: string | null;
}

export interface FiDevice {
  __typename: string;
  id: string;
  moduleId: string;
  info: string;
  nextLocationUpdateExpectedBy: string;
  operationParams: FiOperationParams;
  lastConnectionState: FiConnectionState;
  ledColor: FiLedColor;
  availableLedColors: FiLedColor[];
}

export interface FiPosition {
  __typename: string;
  latitude: number;
  longitude: number;
}

export interface FiPlace {
  __typename: string;
  id: string;
  name: string;
  address: string;
  position: FiPosition;
  radius: number;
}

export interface FiLocationPoint {
  __typename: string;
  date: string;
  errorRadius: number;
  position: FiPosition;
}

export interface FiOngoingActivity {
  __typename: string;
  start: string;
  lastReportTimestamp: string;
  areaName: string;
  // OngoingWalk fields
  distance?: number;
  positions?: FiLocationPoint[];
  path?: FiPosition[];
  // OngoingRest fields
  position?: FiPosition;
  place?: FiPlace;
}

export interface FiActivitySummary {
  __typename: string;
  totalSteps: number;
  stepGoal: number;
  totalDistance: number;
}

export interface FiSleepAmount {
  __typename: string;
  type: "SLEEP" | "NAP";
  duration: number;
}

export interface FiRestSummary {
  __typename: string;
  start: string;
  end: string;
  data: {
    __typename: string;
    sleepAmounts: FiSleepAmount[];
  };
}

export interface FiPet {
  __typename: string;
  id: string;
  name: string;
  homeCityState: string;
  yearOfBirth: number;
  monthOfBirth: number;
  dayOfBirth: number;
  gender: string;
  weight: number;
  isPurebred: boolean;
  breed: FiBreed;
  photos: {
    __typename: string;
    first: FiPhoto | null;
    items: FiPhoto[];
  };
  chip?: { __typename: string; shortId: string };
  device: FiDevice | null;
}

export interface FiBase {
  __typename: string;
  baseId: string;
  name: string;
  position: FiPosition;
  infoLastUpdated: string;
  networkName: string;
  online: boolean;
  onlineQuality: string;
}

export interface FiHousehold {
  __typename: string;
  household: {
    __typename: string;
    pets: FiPet[];
    bases: FiBase[];
  };
}

export interface FiUser {
  __typename: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userHouseholds: FiHousehold[];
}

// Response wrappers

export interface HouseholdsResponse {
  data: {
    currentUser: FiUser;
  };
}

export interface PetLocationResponse {
  data: {
    pet: {
      ongoingActivity: FiOngoingActivity | null;
    };
  };
}

export interface PetActivityResponse {
  data: {
    pet: {
      dailyStat: FiActivitySummary;
      weeklyStat: FiActivitySummary;
      monthlyStat: FiActivitySummary;
    };
  };
}

export interface PetRestResponse {
  data: {
    pet: {
      dailyStat: { restSummaries: FiRestSummary[] };
      weeklyStat: { restSummaries: FiRestSummary[] };
      monthlyStat: { restSummaries: FiRestSummary[] };
    };
  };
}

export interface PetAllInfoResponse {
  data: {
    pet: {
      ongoingActivity: FiOngoingActivity | null;
      dailyStepStat: FiActivitySummary;
      weeklyStepStat: FiActivitySummary;
      monthlyStepStat: FiActivitySummary;
      device: {
        __typename: string;
        moduleId: string;
        info: string;
        operationParams: FiOperationParams;
        nextLocationUpdateExpectedBy: string;
        lastConnectionState: FiConnectionState;
        ledColor: FiLedColor;
        availableLedColors: FiLedColor[];
      };
      dailySleepStat: { restSummaries: FiRestSummary[] };
      monthlySleepStat: { restSummaries: FiRestSummary[] };
    };
  };
}
