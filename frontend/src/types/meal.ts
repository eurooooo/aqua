export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItemPayload {
  name: string;
  quantity?: number;
  unit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealRecordPayload {
  meal_type: MealType;
  eaten_at?: string;
  notes?: string;
  food_items: FoodItemPayload[];
}

export interface FoodItem extends FoodItemPayload {
  id: string;
}

export interface MealRecord {
  id: string;
  meal_type: MealType;
  eaten_at: string;
  notes?: string | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: FoodItem[];
  created_at: string;
  updated_at: string;
}

