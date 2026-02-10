import { create } from "zustand";

import { createMealRecord, getTodayMealRecords } from "@/lib/api";
import type { MealRecord, MealRecordPayload } from "@/types/meal";

interface MealStore {
  todayMeals: MealRecord[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadTodayMeals: () => Promise<void>;
  saveMealRecord: (payload: MealRecordPayload) => Promise<MealRecord>;
  clearError: () => void;
}

export const useMealStore = create<MealStore>((set) => ({
  todayMeals: [],
  isLoading: false,
  isSaving: false,
  error: null,
  loadTodayMeals: async () => {
    set({ isLoading: true, error: null });
    try {
      const todayMeals = await getTodayMealRecords();
      set({ todayMeals, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载今日记录失败";
      set({ isLoading: false, error: message });
    }
  },
  saveMealRecord: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const mealRecord = await createMealRecord(payload);
      set((state) => ({
        todayMeals: [mealRecord, ...state.todayMeals.filter((meal) => meal.id !== mealRecord.id)],
        isSaving: false,
      }));
      return mealRecord;
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存饮食记录失败";
      set({ isSaving: false, error: message });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));

