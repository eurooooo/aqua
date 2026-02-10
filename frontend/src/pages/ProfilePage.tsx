import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Select from "@/components/ui/Select";
import StatusMessage from "@/components/ui/StatusMessage";
import { useProfileStore } from "@/stores/profileStore";
import type { ActivityLevel, Gender, Goal, ProfilePayload } from "@/types/profile";

type FormState = {
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  goal: Goal;
  activity_level: ActivityLevel;
  dietary_restrictions: string;
  allergies: string;
  preferences: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultFormState: FormState = {
  age: "",
  gender: "male",
  height: "",
  weight: "",
  goal: "maintain",
  activity_level: "sedentary",
  dietary_restrictions: "",
  allergies: "",
  preferences: "",
};

function toCommaInput(values: string[]) {
  return values.join(", ");
}

function toStringList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function validateForm(formState: FormState): FormErrors {
  const errors: FormErrors = {};
  const age = Number(formState.age);
  const height = Number(formState.height);
  const weight = Number(formState.weight);

  if (!Number.isFinite(age) || age < 1 || age > 150) {
    errors.age = "年龄范围必须在 1-150";
  }
  if (!Number.isFinite(height) || height <= 0 || height > 300) {
    errors.height = "身高范围必须在 0-300cm";
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
    errors.weight = "体重范围必须在 0-500kg";
  }

  return errors;
}

function ProfilePage() {
  const { profile, isLoading, isSaving, error, loadProfile, saveProfile, clearError } =
    useProfileStore();
  const [formDraft, setFormDraft] = useState<Partial<FormState>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const baseFormState = useMemo<FormState>(() => {
    if (!profile) {
      return defaultFormState;
    }
    return {
      age: String(profile.age),
      gender: profile.gender,
      height: String(profile.height),
      weight: String(profile.weight),
      goal: profile.goal,
      activity_level: profile.activity_level,
      dietary_restrictions: toCommaInput(profile.dietary_restrictions),
      allergies: toCommaInput(profile.allergies),
      preferences: toCommaInput(profile.preferences),
    };
  }, [profile]);

  const formState = useMemo<FormState>(
    () => ({ ...baseFormState, ...formDraft }),
    [baseFormState, formDraft],
  );

  const nutritionPreview = useMemo(() => {
    if (!profile) {
      return null;
    }
    return [
      `卡路里: ${profile.target_calories ?? "-"}`,
      `蛋白质: ${profile.target_protein ?? "-"} g`,
      `碳水: ${profile.target_carbs ?? "-"} g`,
      `脂肪: ${profile.target_fat ?? "-"} g`,
    ];
  }, [profile]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormDraft((current) => {
      const next: Partial<FormState> = { ...current };
      next[key] = value;
      return next;
    });
    if (formErrors[key]) {
      setFormErrors((current) => ({ ...current, [key]: undefined }));
    }
    if (error) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateForm(formState);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: ProfilePayload = {
      age: Number(formState.age),
      gender: formState.gender,
      height: Number(formState.height),
      weight: Number(formState.weight),
      goal: formState.goal,
      activity_level: formState.activity_level,
      dietary_restrictions: toStringList(formState.dietary_restrictions),
      allergies: toStringList(formState.allergies),
      preferences: toStringList(formState.preferences),
    };

    try {
      await saveProfile(payload);
      setFormDraft({});
      setFormErrors({});
      setSuccessMessage("档案已保存");
    } catch {
      // Errors are already stored in zustand state.
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-bold tracking-tight">用户档案</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        填写一次后可随时更新，系统会自动计算每日营养目标。
      </p>

      {isLoading ? <StatusMessage variant="info">正在加载档案...</StatusMessage> : null}
      {error ? <StatusMessage variant="error">{error}</StatusMessage> : null}
      {successMessage ? (
        <StatusMessage variant="success">{successMessage}</StatusMessage>
      ) : null}

      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <FormField label="年龄" error={formErrors.age}>
          <Input
            type="number"
            min={1}
            max={150}
            value={formState.age}
            onChange={(event) => setField("age", event.target.value)}
            required
          />
        </FormField>

        <FormField label="性别">
          <Select
            value={formState.gender}
            onChange={(event) => setField("gender", event.target.value as Gender)}
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </Select>
        </FormField>

        <FormField label="身高 (cm)" error={formErrors.height}>
          <Input
            type="number"
            min={1}
            max={300}
            step="0.1"
            value={formState.height}
            onChange={(event) => setField("height", event.target.value)}
            required
          />
        </FormField>

        <FormField label="体重 (kg)" error={formErrors.weight}>
          <Input
            type="number"
            min={1}
            max={500}
            step="0.1"
            value={formState.weight}
            onChange={(event) => setField("weight", event.target.value)}
            required
          />
        </FormField>

        <FormField label="目标">
          <Select
            value={formState.goal}
            onChange={(event) => setField("goal", event.target.value as Goal)}
          >
            <option value="maintain">维持</option>
            <option value="lose_weight">减重</option>
            <option value="gain_weight">增重</option>
          </Select>
        </FormField>

        <FormField label="活动水平">
          <Select
            value={formState.activity_level}
            onChange={(event) =>
              setField("activity_level", event.target.value as ActivityLevel)
            }
          >
            <option value="sedentary">久坐</option>
            <option value="light">轻度活动</option>
            <option value="moderate">中度活动</option>
            <option value="active">高度活动</option>
          </Select>
        </FormField>

        <FormField label="饮食限制 (逗号分隔)" className="md:col-span-2">
          <Input
            type="text"
            value={formState.dietary_restrictions}
            onChange={(event) =>
              setField("dietary_restrictions", event.target.value)
            }
            placeholder="vegetarian, gluten_free"
          />
        </FormField>

        <FormField label="过敏原 (逗号分隔)" className="md:col-span-2">
          <Input
            type="text"
            value={formState.allergies}
            onChange={(event) => setField("allergies", event.target.value)}
            placeholder="peanuts, dairy"
          />
        </FormField>

        <FormField label="口味偏好 (逗号分隔)" className="md:col-span-2">
          <Input
            type="text"
            value={formState.preferences}
            onChange={(event) => setField("preferences", event.target.value)}
            placeholder="spicy, mild"
          />
        </FormField>

        <PrimaryButton className="md:col-span-2" type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "保存档案"}
        </PrimaryButton>
      </form>

      {nutritionPreview ? (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <h3 className="text-base font-semibold text-slate-900">当前营养目标</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {nutritionPreview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

export default ProfilePage;
