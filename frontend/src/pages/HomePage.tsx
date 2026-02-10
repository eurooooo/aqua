import { useEffect, useMemo } from "react";

import Card from "@/components/ui/Card";
import StatusMessage from "@/components/ui/StatusMessage";
import { useMealStore } from "@/stores/mealStore";
import { useProfileStore } from "@/stores/profileStore";

type NutrientKey = "calories" | "protein" | "carbs" | "fat";

function toPercent(current: number, target?: number) {
  if (!target || target <= 0) {
    return 0;
  }
  return Math.min((current / target) * 100, 100);
}

function formatDiff(current: number, target?: number, unit = "") {
  if (!target && target !== 0) {
    return "暂无目标";
  }
  const diff = target - current;
  const sign = diff >= 0 ? "剩余" : "超出";
  return `${sign} ${Math.abs(diff).toFixed(1)}${unit}`;
}

function HomePage() {
  const { profile, isLoading: isProfileLoading, error: profileError, loadProfile } = useProfileStore();
  const { todayMeals, isLoading: isMealLoading, error: mealError, loadTodayMeals } = useMealStore();

  useEffect(() => {
    void Promise.all([loadProfile(), loadTodayMeals()]);
  }, [loadProfile, loadTodayMeals]);

  const totals = useMemo(
    () =>
      todayMeals.reduce(
        (summary, meal) => ({
          calories: summary.calories + meal.total_calories,
          protein: summary.protein + meal.total_protein,
          carbs: summary.carbs + meal.total_carbs,
          fat: summary.fat + meal.total_fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [todayMeals],
  );

  const goals = useMemo(
    () => ({
      calories: profile?.target_calories,
      protein: profile?.target_protein,
      carbs: profile?.target_carbs,
      fat: profile?.target_fat,
    }),
    [profile],
  );

  const statItems: Array<{
    key: NutrientKey;
    title: string;
    unit: string;
    value: number;
    target?: number;
  }> = [
    { key: "calories", title: "卡路里", unit: "kcal", value: totals.calories, target: goals.calories },
    { key: "protein", title: "蛋白质", unit: "g", value: totals.protein, target: goals.protein },
    { key: "carbs", title: "碳水", unit: "g", value: totals.carbs, target: goals.carbs },
    { key: "fat", title: "脂肪", unit: "g", value: totals.fat, target: goals.fat },
  ];

  return (
    <div className="space-y-4 pb-6">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">今日营养概览</h2>
          <button
            type="button"
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            onClick={() => void Promise.all([loadProfile(), loadTodayMeals()])}
          >
            刷新
          </button>
        </div>

        {isProfileLoading || isMealLoading ? (
          <StatusMessage variant="info">正在加载今日数据...</StatusMessage>
        ) : null}
        {profileError ? <StatusMessage variant="error">{profileError}</StatusMessage> : null}
        {mealError ? <StatusMessage variant="error">{mealError}</StatusMessage> : null}
        {!profile ? (
          <StatusMessage variant="info">你还没有档案目标，请先到“档案”页面填写。</StatusMessage>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {statItems.map((item) => {
            const percent = toPercent(item.value, item.target);
            return (
              <article key={item.key} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <p className="text-sm text-slate-600">
                    {item.value.toFixed(1)} / {item.target?.toFixed(1) ?? "-"} {item.unit}
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-teal-600 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDiff(item.value, item.target, item.unit)}</p>
              </article>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold tracking-tight">今日已记录 {todayMeals.length} 餐</h3>
        {todayMeals.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">还没有饮食记录，去“记录”页面添加第一餐。</p>
        ) : (
          <div className="mt-3 space-y-2">
            {todayMeals.slice(0, 5).map((meal) => (
              <div key={meal.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                {new Date(meal.eaten_at).toLocaleTimeString()} · {meal.total_calories.toFixed(1)} kcal
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default HomePage;
