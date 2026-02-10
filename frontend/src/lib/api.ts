import type { Profile, ProfilePayload } from "@/types/profile";
import type { MealRecord, MealRecordPayload } from "@/types/meal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = (await response.json()) as { detail?: string };
      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default message when response body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export { ApiError };

export function getProfile() {
  return request<Profile>("/api/user/profile");
}

export function upsertProfile(payload: ProfilePayload) {
  return request<Profile>("/api/user/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchProfile(payload: Partial<ProfilePayload>) {
  return request<Profile>("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createMealRecord(payload: MealRecordPayload) {
  return request<MealRecord>("/api/meals/record", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTodayMealRecords() {
  return request<MealRecord[]>("/api/meals/today");
}

export function getMealHistory(days = 7) {
  return request<MealRecord[]>(`/api/meals/history?days=${days}`);
}
