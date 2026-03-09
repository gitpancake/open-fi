// All queries and fragments copied from pytryfi/const.py
// These are the exact strings proven to work against the undocumented Fi API

export const API_HOST = "https://api.tryfi.com";
export const API_GRAPHQL = "/graphql";
export const API_LOGIN = "/auth/login";

export const VAR_PET_ID = "__PET_ID__";

// --- Fragments ---

export const FRAGMENT_USER_DETAILS =
  "fragment UserDetails on User {  __typename   id  email  firstName  lastName  phoneNumber }";

export const FRAGMENT_BREED_DETAILS =
  "fragment BreedDetails on Breed {  __typename  id  name  }";

export const FRAGMENT_PHOTO_DETAILS =
  "fragment PhotoDetails on Photo {  __typename  id  date  image {    __typename    fullSize  }}";

export const FRAGMENT_BASE_PET_PROFILE =
  "fragment BasePetProfile on BasePet {  __typename  id  name  homeCityState  yearOfBirth  monthOfBirth  dayOfBirth  gender  weight  isPurebred  breed {    __typename    ...BreedDetails  }  photos {    __typename    first {      __typename      ...PhotoDetails    }    items {      __typename      ...PhotoDetails    }  }  }";

export const FRAGMENT_LED_DETAILS =
  "fragment LedColorDetails on LedColor {  __typename  ledColorCode  hexCode  name}";

export const FRAGMENT_CONNECTION_STATE_DETAILS =
  "fragment ConnectionStateDetails on ConnectionState {  __typename  date  ... on ConnectedToUser {    user {      __typename      ...UserDetails    }  }  ... on ConnectedToBase {    chargingBase {      __typename      id    }  }  ... on ConnectedToCellular {    signalStrengthPercent  }  ... on UnknownConnectivity {    unknownConnectivity  }}";

export const FRAGMENT_OPERATIONAL_DETAILS =
  "fragment OperationParamsDetails on OperationParams {  __typename  mode  ledEnabled  ledOffAt}";

export const FRAGMENT_DEVICE_DETAILS =
  "fragment DeviceDetails on Device {  __typename  id  moduleId  info  nextLocationUpdateExpectedBy  operationParams {    __typename    ...OperationParamsDetails  }  lastConnectionState {    __typename    ...ConnectionStateDetails  }  ledColor {    __typename    ...LedColorDetails  }  availableLedColors {    __typename    ...LedColorDetails  }}";

export const FRAGMENT_PET_PROFILE =
  "fragment PetProfile on Pet {  __typename  ...BasePetProfile  chip {    __typename    shortId  }  device {    __typename    ...DeviceDetails  }}";

export const FRAGMENT_USER_FULL_DETAILS =
  "fragment UserFullDetails on User {  __typename  ...UserDetails  userHouseholds {    __typename    household {      __typename      pets {        __typename        ...PetProfile      }      bases {        __typename        ...BaseDetails      }    }  }}";

export const FRAGMENT_BASE_DETAILS =
  "fragment BaseDetails on ChargingBase {  __typename  baseId  name  position {    __typename    ...PositionCoordinates  }  infoLastUpdated  networkName  online  onlineQuality}";

export const FRAGMENT_POSITION_COORDINATES =
  "fragment PositionCoordinates on Position {  __typename  latitude  longitude}";

export const FRAGMENT_ONGOING_ACTIVITY_DETAILS =
  "fragment OngoingActivityDetails on OngoingActivity {  __typename  start  lastReportTimestamp  areaName  ... on OngoingWalk {    distance    positions {      __typename      ...LocationPoint    }    path {      __typename      ...PositionCoordinates    }  }  ... on OngoingRest {    position {      __typename      ...PositionCoordinates    }    place {      __typename      ...PlaceDetails    }  }}";

export const FRAGMENT_LOCATION_POINT =
  "fragment LocationPoint on Location {  __typename  date  errorRadius  position {    __typename    ...PositionCoordinates  }}";

export const FRAGMENT_PLACE_DETAILS =
  "fragment PlaceDetails on Place {  __typename  id  name  address  position {    __typename    ...PositionCoordinates  }  radius}";

export const FRAGMENT_ACTIVITY_SUMMARY_DETAILS =
  "fragment ActivitySummaryDetails on ActivitySummary {  __typename  totalSteps  stepGoal  totalDistance}";

export const FRAGMENT_REST_SUMMARY_DETAILS =
  "fragment RestSummaryDetails on RestSummary {  __typename  start  end  data {    __typename    ... on ConcreteRestSummaryData {      sleepAmounts {        __typename        type        duration      }    }  }}";

// --- Queries ---

export const QUERY_CURRENT_USER =
  "query {  currentUser {    ...UserDetails  }}";

export const QUERY_CURRENT_USER_FULL_DETAIL =
  "query {  currentUser {    ...UserFullDetails  }}";

export const QUERY_PET_ACTIVE_DETAILS =
  `query {  pet (id: "${VAR_PET_ID}") { ongoingActivity { __typename ...OngoingActivityDetails } dailyStepStat: currentActivitySummary (period: DAILY) { ...ActivitySummaryDetails } weeklyStepStat: currentActivitySummary (period: WEEKLY) { ...ActivitySummaryDetails } monthlyStepStat: currentActivitySummary (period: MONTHLY) { ...ActivitySummaryDetails } device { __typename moduleId info operationParams {    __typename    ...OperationParamsDetails  }  nextLocationUpdateExpectedBy  lastConnectionState {    __typename    ...ConnectionStateDetails  }  ledColor {    __typename    ...LedColorDetails }  availableLedColors {    __typename    ...LedColorDetails }} dailySleepStat: restSummaryFeed(cursor: null, period: DAILY, limit: 1) {      __typename      restSummaries {        __typename        ...RestSummaryDetails }} monthlySleepStat: restSummaryFeed(cursor: null, period: MONTHLY, limit: 1) {      __typename      restSummaries {        __typename        ...RestSummaryDetails }} }}`;

export const QUERY_PET_CURRENT_LOCATION =
  `query {  pet (id: "${VAR_PET_ID}") {    ongoingActivity {      __typename      ...OngoingActivityDetails    }  }}`;

export const QUERY_PET_ACTIVITY =
  `query {  pet (id: "${VAR_PET_ID}") {       dailyStat: currentActivitySummary (period: DAILY) {      ...ActivitySummaryDetails    }    weeklyStat: currentActivitySummary (period: WEEKLY) {      ...ActivitySummaryDetails    }    monthlyStat: currentActivitySummary (period: MONTHLY) {      ...ActivitySummaryDetails    }  }}`;

export const QUERY_PET_REST =
  `query {  pet (id: "${VAR_PET_ID}") {	dailyStat: restSummaryFeed(cursor: null, period: DAILY, limit: 1) {      __typename      restSummaries {        __typename        ...RestSummaryDetails      }    }	weeklyStat: restSummaryFeed(cursor: null, period: WEEKLY, limit: 1) {      __typename      restSummaries {        __typename        ...RestSummaryDetails      }    }	monthlyStat: restSummaryFeed(cursor: null, period: MONTHLY, limit: 1) {      __typename      restSummaries {        __typename        ...RestSummaryDetails      }    }  }}`;

export const QUERY_PET_DEVICE_DETAILS =
  `query {  pet (id: "${VAR_PET_ID}") {    __typename    ...PetProfile  }}`;

// --- Timeline query (reverse-engineered from Fi app via mitmproxy) ---

export const QUERY_TIMELINE =
  `query Timeline($pagingInstruction: PagingInstruction, $includeTravel: Boolean!, $filter: FiFeedFilter) {
  currentUser {
    __typename
    fiFeed(pagingInstruction: $pagingInstruction, includeTravel: $includeTravel, filter: $filter) {
      __typename
      feedItems {
        __typename
        id
        timestamp
        ... on FiFeedActivityItem {
          __typename
          activity {
            __typename
            id
            start
            end
            areaName
            presentUserString
            totalSteps
            ... on Walk {
              __typename
              distance
              neighborhood
              cityState
            }
            ... on Rest {
              __typename
              position { __typename ...PositionCoordinates }
              place { __typename ...PlaceDetails }
            }
            ... on Travel {
              __typename
              distance
              positions { __typename ...PositionCoordinates }
            }
            ... on Play {
              __typename
              position { __typename ...PositionCoordinates }
              place { __typename ...PlaceDetails }
            }
          }
          pet {
            __typename
            id
            name
          }
        }
        ... on FiFeedGenericNotificationItem {
          __typename
          title
          body { __typename text }
        }
      }
      pageInfo {
        __typename
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
}`;

// --- Health Trends query (reverse-engineered from Fi app via mitmproxy) ---

export const FRAGMENT_HEALTH_TREND_SUMMARY_CHANGE =
  "fragment PetHealthTrendSummaryChangeApiModel on PetHealthTrendSummaryChange { __typename direction change }";

export const FRAGMENT_HEALTH_TREND_SUMMARY =
  "fragment PetHealthTrendSummaryApiModel on PetHealthTrendSummary { __typename placeholder eventsSummary eventsChange { __typename ...PetHealthTrendSummaryChangeApiModel } durationSummary durationChange { __typename ...PetHealthTrendSummaryChangeApiModel } }";

export const FRAGMENT_HEALTH_TREND =
  "fragment PetHealthTrendApiModel on PetHealthTrend { __typename id icon { __typename urlString: fullSize } disabled title chart { __typename ... on PetHealthTrendGraph { __typename color showAverage average minimum maximum points: intervals } ... on PetHealthTrendSegmentedTimeline { __typename length dataEnd segments: intervals { __typename offset length color intervalType } } } summaryComponents { __typename ...PetHealthTrendSummaryApiModel } }";

export const QUERY_HEALTH_TRENDS =
  "query HealthTrends($petId: ID!, $period: PetHealthTrendPeriod!) { getPetHealthTrendsForPet(petId: $petId, period: $period) { __typename period genericTrends { __typename ...PetHealthTrendApiModel } behaviorTrends { __typename ...PetHealthTrendApiModel } } }";

// --- PetCollarState query (reverse-engineered from Fi app via mitmproxy) ---

export const FRAGMENT_REVERSE_GEOCODE_ADDRESS =
  "fragment ReverseGeocodeAddress on ReverseGeocodeResult { __typename address neighborhood city state zipCode }";

export const FRAGMENT_DOG_PARK_DETAILS =
  "fragment DogParkDetails on DogPark { __typename id name position { __typename ...PositionCoordinates } boundary address { __typename ...ReverseGeocodeAddress } }";

export const FRAGMENT_COLLAR_ONGOING_ACTIVITY =
  "fragment OngoingActivityCollarDetails on OngoingActivity { __typename start presentUserString areaName cityState lastReportTimestamp totalSteps shouldShowDuration ... on OngoingWalk { __typename distance positions { __typename ...LocationPoint } path { __typename ...PositionCoordinates } } ... on OngoingRest { __typename location { __typename ...LocationPoint } place { __typename ...PlaceDetails } } }";

export const FRAGMENT_ONLINE_CONNECTION_STATE =
  "fragment OnlineConnectionStateDetails on OnlineConnectionState { __typename ... on ConnectedToUser { __typename user { __typename id firstName } } ... on ConnectedToBase { __typename chargingBase { __typename id name } } ... on ConnectedToCellular { __typename signalStrengthPercent } ... on ConnectedToWifi { __typename ssid } }";

export const FRAGMENT_COLLAR_STATUS =
  "fragment CollarStatusDetails on CollarStatus { __typename ... on OnlineCollarStatus { __typename state { __typename ...OnlineConnectionStateDetails } } ... on OfflineCollarStatus { __typename outOfBattery offlineDuration } }";

export const FRAGMENT_HAS_COLLAR_STATE =
  "fragment HasCollarStateDetails on HasReportsState { __typename collarStatus { __typename ...CollarStatusDetails } ongoingActivity { __typename ...OngoingActivityCollarDetails } ldmState }";

export const FRAGMENT_NEEDS_COLLAR_STATE =
  "fragment NeedsCollarStateDetails on NeedsReportsState { __typename needsCollar needsReports }";

export const FRAGMENT_PET_COLLAR_STATE =
  "fragment PetCollarStateDetails on PetCollarState { __typename timestamp ... on NeedsReportsState { __typename ...NeedsCollarStateDetails } ... on HasReportsState { __typename ...HasCollarStateDetails } }";

export const QUERY_PET_COLLAR_STATE =
  "query PetCollarState($petId: ID!) { pet(id: $petId) { __typename petCollarState { __typename ...PetCollarStateDetails } } }";

// --- RankingsPackFeed query (reverse-engineered from Fi app via mitmproxy) ---

export const FRAGMENT_PACK_RANKING =
  "fragment PackRankingApiModel on PackRanking { __typename isPending stepCount rankNumber rankPercentile rankChange { __typename amount } }";

export const FRAGMENT_PACK_AVATAR =
  "fragment RankingsPackAvatarApiModel on PackAvatar { __typename ... on AvatarImage { __typename image { __typename fullSize } } ... on AvatarAbbreviation { __typename abbreviation } }";

export const FRAGMENT_RANKINGS_PACK =
  `fragment RankingsPackApiModel on Pack { __typename id name avatar { __typename ...RankingsPackAvatarApiModel } actingPetCanJoin actingPetCanLeave actingPetIsMember actingPetCannotJoinReason all: petRanking(petId: $petId) { __typename ...PackRankingApiModel } puppies: petRanking(petId: $petId, packAgeFilter: PUPPY) { __typename ...PackRankingApiModel } adults: petRanking(petId: $petId, packAgeFilter: ADULT) { __typename ...PackRankingApiModel } seniors: petRanking(petId: $petId, packAgeFilter: SENIOR) { __typename ...PackRankingApiModel } category totalRankedPets ageFiltersWithEnoughRankedPets totalRankedSteps highlightColorHex }`;

export const QUERY_RANKINGS_PACK_FEED =
  "query RankingsPackFeed($petId: ID!, $isUserPet: Boolean!) { pet(id: $petId) @include(if: $isUserPet) { __typename packFeed { __typename rankingsPacks: packs { __typename ...RankingsPackApiModel } } } }";

// --- Mutations ---

export const MUTATION_SET_DEVICE_LED =
  "mutation SetDeviceLed($moduleId: String!, $ledColorCode: Int!) { setDeviceLed(moduleId: $moduleId, ledColorCode: $ledColorCode) { __typename ...DeviceDetails }}";

export const MUTATION_UPDATE_DEVICE_OPS =
  "mutation UpdateDeviceOperationParams($input: UpdateDeviceOperationParamsInput!) { updateDeviceOperationParams(input: $input) { __typename ...DeviceDetails }}";

// --- Query builders ---

export function buildHouseholdsQuery(): string {
  return (
    QUERY_CURRENT_USER_FULL_DETAIL +
    FRAGMENT_USER_DETAILS +
    FRAGMENT_USER_FULL_DETAILS +
    FRAGMENT_PET_PROFILE +
    FRAGMENT_BASE_PET_PROFILE +
    FRAGMENT_BASE_DETAILS +
    FRAGMENT_POSITION_COORDINATES +
    FRAGMENT_BREED_DETAILS +
    FRAGMENT_PHOTO_DETAILS +
    FRAGMENT_DEVICE_DETAILS +
    FRAGMENT_LED_DETAILS +
    FRAGMENT_OPERATIONAL_DETAILS +
    FRAGMENT_CONNECTION_STATE_DETAILS
  );
}

export function buildPetLocationQuery(petId: string): string {
  return (
    QUERY_PET_CURRENT_LOCATION.replace(VAR_PET_ID, petId) +
    FRAGMENT_ONGOING_ACTIVITY_DETAILS +
    FRAGMENT_LOCATION_POINT +
    FRAGMENT_PLACE_DETAILS +
    FRAGMENT_POSITION_COORDINATES
  );
}

export function buildPetActivityQuery(petId: string): string {
  return (
    QUERY_PET_ACTIVITY.replace(VAR_PET_ID, petId) +
    FRAGMENT_ACTIVITY_SUMMARY_DETAILS
  );
}

export function buildPetRestQuery(petId: string): string {
  return (
    QUERY_PET_REST.replace(VAR_PET_ID, petId) +
    FRAGMENT_REST_SUMMARY_DETAILS
  );
}

export function buildPetAllInfoQuery(petId: string): string {
  return (
    QUERY_PET_ACTIVE_DETAILS.replace(VAR_PET_ID, petId) +
    FRAGMENT_ACTIVITY_SUMMARY_DETAILS +
    FRAGMENT_ONGOING_ACTIVITY_DETAILS +
    FRAGMENT_OPERATIONAL_DETAILS +
    FRAGMENT_CONNECTION_STATE_DETAILS +
    FRAGMENT_LED_DETAILS +
    FRAGMENT_REST_SUMMARY_DETAILS +
    FRAGMENT_POSITION_COORDINATES +
    FRAGMENT_LOCATION_POINT +
    FRAGMENT_USER_DETAILS +
    FRAGMENT_PLACE_DETAILS
  );
}

export function buildPetDeviceQuery(petId: string): string {
  return (
    QUERY_PET_DEVICE_DETAILS.replace(VAR_PET_ID, petId) +
    FRAGMENT_PET_PROFILE +
    FRAGMENT_BASE_PET_PROFILE +
    FRAGMENT_DEVICE_DETAILS +
    FRAGMENT_LED_DETAILS +
    FRAGMENT_OPERATIONAL_DETAILS +
    FRAGMENT_CONNECTION_STATE_DETAILS +
    FRAGMENT_USER_DETAILS +
    FRAGMENT_BREED_DETAILS +
    FRAGMENT_PHOTO_DETAILS
  );
}

export function buildTimelineQuery(): string {
  return (
    QUERY_TIMELINE +
    FRAGMENT_POSITION_COORDINATES +
    FRAGMENT_PLACE_DETAILS
  );
}

export function buildHealthTrendsQuery(): string {
  return (
    QUERY_HEALTH_TRENDS +
    FRAGMENT_HEALTH_TREND +
    FRAGMENT_HEALTH_TREND_SUMMARY +
    FRAGMENT_HEALTH_TREND_SUMMARY_CHANGE
  );
}

export function buildPetCollarStateQuery(): string {
  return (
    QUERY_PET_COLLAR_STATE +
    FRAGMENT_PET_COLLAR_STATE +
    FRAGMENT_NEEDS_COLLAR_STATE +
    FRAGMENT_HAS_COLLAR_STATE +
    FRAGMENT_COLLAR_STATUS +
    FRAGMENT_ONLINE_CONNECTION_STATE +
    FRAGMENT_COLLAR_ONGOING_ACTIVITY +
    FRAGMENT_DOG_PARK_DETAILS +
    FRAGMENT_REVERSE_GEOCODE_ADDRESS +
    FRAGMENT_POSITION_COORDINATES +
    FRAGMENT_LOCATION_POINT +
    FRAGMENT_PLACE_DETAILS
  );
}

export function buildRankingsPackFeedQuery(): string {
  return (
    QUERY_RANKINGS_PACK_FEED +
    FRAGMENT_RANKINGS_PACK +
    FRAGMENT_PACK_AVATAR +
    FRAGMENT_PACK_RANKING
  );
}

export function buildSetLedMutation(): string {
  return (
    MUTATION_SET_DEVICE_LED +
    FRAGMENT_DEVICE_DETAILS +
    FRAGMENT_LED_DETAILS +
    FRAGMENT_OPERATIONAL_DETAILS +
    FRAGMENT_CONNECTION_STATE_DETAILS +
    FRAGMENT_USER_DETAILS
  );
}

export function buildUpdateDeviceOpsMutation(): string {
  return (
    MUTATION_UPDATE_DEVICE_OPS +
    FRAGMENT_DEVICE_DETAILS +
    FRAGMENT_LED_DETAILS +
    FRAGMENT_OPERATIONAL_DETAILS +
    FRAGMENT_CONNECTION_STATE_DETAILS +
    FRAGMENT_USER_DETAILS
  );
}
