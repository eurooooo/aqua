export type Gender = "male" | "female";
export type Goal = "lose_weight" | "gain_weight" | "maintain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export interface ProfilePayload {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  goal: Goal;
  activity_level: ActivityLevel;
  dietary_restrictions: string[];
  allergies: string[];
  preferences: string[];
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

export interface Profile extends ProfilePayload {
  id: string;
  created_at: string;
  updated_at: string;
}

