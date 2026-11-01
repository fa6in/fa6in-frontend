import { useProgressSummary } from "../../Services/Fatin/useStudentLearning";
import type { ErrorCategory } from "../../Services/Fatin/types";
import { useFatinChrome } from "../../ui/FatinChrome";
import { ERROR_COLOR, ERROR_LABEL, Loading } from "./fatinStudentUi";

const WEEKDAY = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

// Écran S8 du design : répartition des skills, activité de la semaine, erreurs par type.
export default function FatinStudentProgress() {
  useFatinChrome({ subtitle: "ملخص أدائك" });
  const { data, isLoading } = useProgressSummary();

  if (isLoading || !data) return <Loading />;
  const percent = Math.round(data.completion * 100);
  const maxAttempts = Math.max(1, ...data.weekly_activity.map((day) => day.attempts));
  const totalErrors = Object.values(data.errors_by_category).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-3 px-4 pb-6 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:px-7">
      <div className="fatin-panel flex items-center justify-between">
        <div className="space-y-1 text-sm text-[#4C6A63]">
          <div>
            <b className="text-[#1B7F5C]">متقنة:</b> {data.skills_mastered} مهارة
          </div>
          <div>
            <b className="text-[#8A5A00]">قيد التقدم:</b> {data.skills_in_progress}
          </div>
          <div>
            <b>لم تبدأ:</b> {data.skills_not_started}
          </div>
        </div>
        <div
          className="grid h-24 w-24 place-items-center rounded-full text-xl font-extrabold text-[#0F5C47]"
          style={{ background: `conic-gradient(#1B7F5C ${percent * 3.6}deg, #E7F2ED 0)` }}
          aria-label={`${percent}٪ من المهارات متقنة`}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white">{percent}٪</span>
        </div>
      </div>

      <div className="fatin-panel">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-extrabold text-[#12302B]">نشاط الأسبوع</span>
          <span className="text-xs text-[#4C6A63]">{data.streak_days} أيام متتالية</span>
        </div>
        <div className="flex h-32 items-end gap-2">
          {data.weekly_activity.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1" title={`${day.attempts} محاولة`}>
              <span className="text-[10px] text-[#4C6A63]">{day.attempts || ""}</span>
              <div
                className="w-full rounded-t-lg bg-[#1B7F5C]"
                style={{ height: `${Math.max(4, (day.attempts / maxAttempts) * 90)}px`, opacity: day.attempts ? 1 : 0.25 }}
              />
              <span className="text-xs text-[#4C6A63]">{WEEKDAY[new Date(`${day.date}T12:00:00`).getDay()]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fatin-panel space-y-3 lg:col-span-2">
        <div className="font-extrabold text-[#12302B]">أخطائي حسب النوع</div>
        {totalErrors === 0 && <p className="text-sm text-[#4C6A63]">لا أخطاء مسجلة بعد.</p>}
        {totalErrors > 0 &&
          (Object.keys(ERROR_LABEL) as ErrorCategory[]).map((category) => {
            const value = data.errors_by_category[category] ?? 0;
            const share = Math.round((value / totalErrors) * 100);
            return (
              <div key={category}>
                <div className="mb-1 flex justify-between text-xs text-[#4C6A63]">
                  <span>{ERROR_LABEL[category].replace("خطأ ", "")}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#E7F2ED]">
                  <div className="h-full rounded-full" style={{ width: `${share}%`, background: ERROR_COLOR[category] }} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
