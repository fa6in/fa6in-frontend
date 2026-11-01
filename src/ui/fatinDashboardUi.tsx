import type { ReactNode } from "react";
import type { AttentionReason, ErrorCategory, StudentRow } from "../Services/Fatin/types";

/**
 * Les statistiques arrivent soit en ratio (0–1), soit déjà en pourcentage
 * selon l'endpoint : on ramène tout en pourcentage entier.
 */
export function asPercent(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n <= 1 ? n * 100 : n);
}

export function masteryColor(percent: number) {
  if (percent >= 70) return "#1B7F5C";
  if (percent >= 45) return "#E0A526";
  return "#C4564A";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar", { day: "numeric", month: "short" });
}

export function personName(row: { first_name?: string; last_name?: string; username?: string }) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ") || row.username || "—";
}

export function attentionText(row: Pick<StudentRow, "attention_reason" | "inactive_days" | "concept_errors_14d" | "blocked_skills">) {
  switch (row.attention_reason as AttentionReason | null) {
    case "concept_errors":
      return `${row.concept_errors_14d} أخطاء مفاهيمية خلال 14 يومًا`;
    case "redirects":
      return `متعثر في ${row.blocked_skills} مهارة — يُعاد توجيهه للمتطلبات`;
    case "inactive":
      return `غير نشط منذ ${row.inactive_days ?? "؟"} يومًا`;
    case "low_mastery":
      return "إتقان منخفض";
    default:
      return "";
  }
}

export const ERROR_TEXT: Record<ErrorCategory, string> = {
  concept: "مفاهيمي",
  procedure: "إجرائي",
  careless: "إهمالي",
};

export const ERROR_TINT: Record<ErrorCategory, string> = {
  concept: "#C4564A",
  procedure: "#E0A526",
  careless: "#3B82C4",
};

export function MasteryBar({ value, width = "w-24" }: { value: number; width?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 ${width} overflow-hidden rounded-full bg-[#E7F2ED]`}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: masteryColor(value) }} />
      </div>
      <span className="tabular-nums">{value}٪</span>
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: string }) {
  return (
    <article className="fatin-stat">
      <span>{label}</span>
      <b style={tone ? { color: tone } : undefined}>{value}</b>
      {hint && <span>{hint}</span>}
    </article>
  );
}

export function Initial({ name, tone = "#0F5C47" }: { name: string; tone?: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: tone }}>
      {name.slice(0, 1)}
    </span>
  );
}

/** Histogramme simple (activité quotidienne) aux couleurs du design. */
export function DailyBars({ days, height = 160 }: { days: { date: string; attempts: number; correct?: number }[]; height?: number }) {
  const max = Math.max(1, ...days.map((day) => day.attempts));
  const dense = days.length > 14;
  return (
    <div className="flex items-end gap-1.5" style={{ height: height + 36 }}>
      {days.map((day, index) => {
        const date = new Date(`${day.date}T12:00:00`);
        const label = Number.isNaN(date.getTime())
          ? day.date
          : dense
            ? String(date.getDate())
            : date.toLocaleDateString("ar", { weekday: "short" });
        const showLabel = !dense || index % Math.ceil(days.length / 10) === 0 || index === days.length - 1;
        const correct = day.correct ?? 0;
        return (
          <div key={day.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${day.date} · ${day.attempts} محاولة · ${correct} صحيحة`}>
            {!dense && <span className="text-[10px] text-[#4C6A63]">{day.attempts || ""}</span>}
            <div className="relative w-full overflow-hidden rounded-t-md bg-[#CFE7DD]" style={{ height: Math.max(4, (day.attempts / max) * height), opacity: day.attempts ? 1 : 0.35 }}>
              {day.attempts > 0 && (
                <div className="absolute inset-x-0 bottom-0 bg-[#1B7F5C]" style={{ height: `${(correct / day.attempts) * 100}%` }} />
              )}
            </div>
            <span className="h-4 text-[10px] text-[#4C6A63]">{showLabel ? label : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

export function BarsLegend() {
  return (
    <div className="flex gap-3 text-xs text-[#4C6A63]">
      <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-[#1B7F5C]" /> صحيحة</span>
      <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-[#CFE7DD]" /> محاولات</span>
    </div>
  );
}
