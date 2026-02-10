import { create } from "zustand";

import { ApiError, getProfile, upsertProfile } from "@/lib/api";
import type { Profile, ProfilePayload } from "@/types/profile";

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (payload: ProfilePayload) => Promise<Profile>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ profile: null, isLoading: false, error: null });
        return;
      }
      const message = error instanceof Error ? error.message : "加载档案失败";
      set({ isLoading: false, error: message });
    }
  },
  saveProfile: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const profile = await upsertProfile(payload);
      set({ profile, isSaving: false });
      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存档案失败";
      set({ isSaving: false, error: message });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));

