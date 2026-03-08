// Typed fetch wrapper for fi-open-api microservice

const API_URL = process.env.FI_API_URL || "http://localhost:3001";

export interface FiCredentials {
  sessionId: string;
  fiCookies: string;
}

export interface LoginResult {
  userId: string;
  sessionId: string;
  fiCookies: string;
}

async function apiFetch<T>(
  path: string,
  creds?: FiCredentials,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (creds) {
    headers["X-Fi-Cookies"] = creds.fiCookies;
    headers["X-Session-Id"] = creds.sessionId;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status} ${res.statusText} - ${body}`);
  }

  return res.json();
}

export async function apiLogin(
  email: string,
  password: string
): Promise<LoginResult> {
  return apiFetch<LoginResult>("/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetPets<T>(creds: FiCredentials): Promise<T> {
  return apiFetch<T>("/pets", creds);
}

export async function apiGetPetLocation<T>(
  creds: FiCredentials,
  petId: string
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/location`, creds);
}

export async function apiGetPetActivity<T>(
  creds: FiCredentials,
  petId: string
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/activity`, creds);
}

export async function apiGetPetSleep<T>(
  creds: FiCredentials,
  petId: string
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/sleep`, creds);
}

export async function apiGetPetDetails<T>(
  creds: FiCredentials,
  petId: string
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/details`, creds);
}

export async function apiGetPetDevice<T>(
  creds: FiCredentials,
  petId: string
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/device`, creds);
}

export async function apiSetPetLedColor<T>(
  creds: FiCredentials,
  petId: string,
  ledColorCode: number
): Promise<T> {
  return apiFetch<T>(`/pets/${petId}/device/led`, creds, {
    method: "PUT",
    body: JSON.stringify({ ledColorCode }),
  });
}
