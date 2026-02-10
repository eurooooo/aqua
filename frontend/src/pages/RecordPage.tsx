import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Select from "@/components/ui/Select";
import StatusMessage from "@/components/ui/StatusMessage";
import { useMealStore } from "@/stores/mealStore";
import type { MealRecordPayload, MealType } from "@/types/meal";

type FoodItemDraft = {
  name: string;
  quantity: string;
  unit: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

const emptyFoodItem = (): FoodItemDraft => ({
  name: "",
  quantity: "",
  unit: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
});

function RecordPage() {
  const { todayMeals, isLoading, isSaving, error, loadTodayMeals, saveMealRecord, clearError } =
    useMealStore();

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [eatenAt, setEatenAt] = useState("");
  const [notes, setNotes] = useState("");
  const [foodItems, setFoodItems] = useState<FoodItemDraft[]>([emptyFoodItem()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void loadTodayMeals();
  }, [loadTodayMeals]);

  const todaySummary = useMemo(() => {
    return todayMeals.reduce(
      (summary, meal) => ({
        calories: summary.calories + meal.total_calories,
        protein: summary.protein + meal.total_protein,
        carbs: summary.carbs + meal.total_carbs,
        fat: summary.fat + meal.total_fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [todayMeals]);

  function updateFoodItem(index: number, patch: Partial<FoodItemDraft>) {
    setFoodItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
    if (formError) {
      setFormError(null);
    }
    if (error) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  function addFoodItem() {
    setFoodItems((current) => [...current, emptyFoodItem()]);
  }

  function removeFoodItem(index: number) {
    setFoodItems((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
  }

  function buildPayload(): MealRecordPayload | null {
    const mappedItems = foodItems
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity ? Number(item.quantity) : undefined,
        unit: item.unit.trim() || undefined,
        calories: Number(item.calories),
        protein: item.protein ? Number(item.protein) : 0,
        carbs: item.carbs ? Number(item.carbs) : 0,
        fat: item.fat ? Number(item.fat) : 0,
      }))
      .filter((item) => item.name.length > 0);

    if (mappedItems.length === 0) {
      setFormError("请至少填写一项食物名称");
      return null;
    }

    const hasInvalidNumber = mappedItems.some(
      (item) =>
        Number.isNaN(item.calories) ||
        Number.isNaN(item.protein) ||
        Number.isNaN(item.carbs) ||
        Number.isNaN(item.fat) ||
        item.calories < 0 ||
        item.protein < 0 ||
        item.carbs < 0 ||
        item.fat < 0,
    );

    if (hasInvalidNumber) {
      setFormError("营养数值必须是大于等于 0 的数字");
      return null;
    }

    return {
      meal_type: mealType,
      eaten_at: eatenAt ? new Date(eatenAt).toISOString() : undefined,
      notes: notes.trim() || undefined,
      food_items: mappedItems,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    try {
      await saveMealRecord(payload);
      setFoodItems([emptyFoodItem()]);
      setMealType("breakfast");
      setEatenAt("");
      setNotes("");
      setFormError(null);
      setSuccessMessage("记录已保存");
    } catch {
      // Store holds request error.
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <Card>
        <h2 className="text-xl font-bold tracking-tight">记录饮食</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">先手动录入，后续会接入图片识别。</p>

        {formError ? <StatusMessage variant="error">{formError}</StatusMessage> : null}
        {error ? <StatusMessage variant="error">{error}</StatusMessage> : null}
        {successMessage ? <StatusMessage variant="success">{successMessage}</StatusMessage> : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="餐次">
              <Select value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </Select>
            </FormField>
            <FormField label="进食时间（可选）">
              <Input
                type="datetime-local"
                value={eatenAt}
                onChange={(event) => setEatenAt(event.target.value)}
              />
            </FormField>
          </div>

          <FormField label="备注（可选）">
            <Input type="text" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>

          <div className="space-y-3">
            {foodItems.map((item, index) => (
              <div key={`food-item-${index}`} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">食物 {index + 1}</h3>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-700 disabled:text-slate-400"
                    onClick={() => removeFoodItem(index)}
                    disabled={foodItems.length === 1}
                  >
                    删除
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="食物名称">
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(event) => updateFoodItem(index, { name: event.target.value })}
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="份量">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(event) => updateFoodItem(index, { quantity: event.target.value })}
                      />
                    </FormField>
                    <FormField label="单位">
                      <Input
                        type="text"
                        value={item.unit}
                        onChange={(event) => updateFoodItem(index, { unit: event.target.value })}
                      />
                    </FormField>
                  </div>
                  <FormField label="卡路里">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.calories}
                      onChange={(event) => updateFoodItem(index, { calories: event.target.value })}
                    />
                  </FormField>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="蛋白质">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.protein}
                        onChange={(event) => updateFoodItem(index, { protein: event.target.value })}
                      />
                    </FormField>
                    <FormField label="碳水">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.carbs}
                        onChange={(event) => updateFoodItem(index, { carbs: event.target.value })}
                      />
                    </FormField>
                    <FormField label="脂肪">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.fat}
                        onChange={(event) => updateFoodItem(index, { fat: event.target.value })}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={addFoodItem}
            >
              添加食物
            </button>
            <PrimaryButton type="submit" disabled={isSaving}>
              {isSaving ? "保存中..." : "保存记录"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">今日记录</h2>
          <button
            type="button"
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            onClick={() => void loadTodayMeals()}
          >
            刷新
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          总计 {todaySummary.calories.toFixed(1)} kcal, 蛋白质 {todaySummary.protein.toFixed(1)} g, 碳水{" "}
          {todaySummary.carbs.toFixed(1)} g, 脂肪 {todaySummary.fat.toFixed(1)} g
        </p>

        {isLoading ? <StatusMessage variant="info">正在加载今日记录...</StatusMessage> : null}

        {!isLoading && todayMeals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">今天还没有记录，先添加一餐吧。</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {todayMeals.map((meal) => (
            <article key={meal.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">
                {mealTypeLabels[meal.meal_type]} · {new Date(meal.eaten_at).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {meal.total_calories.toFixed(1)} kcal / 蛋白质 {meal.total_protein.toFixed(1)} g / 碳水{" "}
                {meal.total_carbs.toFixed(1)} g / 脂肪 {meal.total_fat.toFixed(1)} g
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {meal.food_items.map((item) => (
                  <li key={item.id}>
                    {item.name} {item.quantity ? `${item.quantity}${item.unit ?? ""}` : ""} · {item.calories} kcal
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default RecordPage;
