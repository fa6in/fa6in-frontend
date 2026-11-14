import type { ReactNode } from "react";
import type { ChunkType } from "../../../Services/Fatin/types";

export const STEPS = ["الوحدة", "الدرس", "الأهداف", "المهارات", "المتطلبات", "القطع", "النشر"];

export const GOAL_LABEL = { conceptual: "مفاهيمي", operational: "عمليّاتي" } as const;

export const CHUNK_TYPES: { id: ChunkType; label: string }[] = [
  { id: "rule", label: "قاعدة" },
  { id: "example", label: "مثال" },
  { id: "practice", label: "تمرين" },
  { id: "error", label: "خطأ" },
  { id: "hint", label: "تلميح" },
  { id: "real_life", label: "تطبيق" },
];

export const chunkTypeLabel = (type: ChunkType) => CHUNK_TYPES.find((item) => item.id === type)?.label ?? type;

/**
 * Prochain code libre d'une série (ex : SK-U01-L02-O01 → SK-U01-L02-O02),
 * à partir des codes déjà utilisés.
 */
export function nextCode(prefix: string, used: string[], width = 2) {
  const numbers = used
    .filter((code) => code.startsWith(prefix))
    .map((code) => Number(code.slice(prefix.length)))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${prefix}${String(next).padStart(width, "0")}`;
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm text-[#4C6A63] ${className ?? ""}`}>
      {label}
      <div className="mt-1 text-[#12302B]">{children}</div>
    </label>
  );
}

export function Instruction({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#FFF4D6] px-4 py-3 text-[15px]">
      <b className="text-[#8A5A00]">المطلوب الآن: </b>
      {children}
    </div>
  );
}

export function StepBar({ current, reachable, onStep }: { current: number; reachable: (index: number) => boolean; onStep: (index: number) => void }) {
  return (
    <ol className="mb-5 flex items-start gap-1 overflow-x-auto pb-1">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const enabled = reachable(index);
        return (
          <li key={label} className="flex min-w-[64px] flex-1 flex-col items-center gap-1">
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onStep(index)}
              aria-current={active ? "step" : undefined}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold transition ${
                active ? "bg-[#E0A526] text-white" : done ? "bg-[#1B7F5C] text-white" : "bg-[#E7F2ED] text-[#4C6A63]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {done ? "✓" : index + 1}
            </button>
            <span className={`whitespace-nowrap text-[11px] ${active ? "font-extrabold text-[#12302B]" : "text-[#4C6A63]"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm ${active ? "bg-[#0F5C47] font-extrabold text-white" : "bg-[#F3F7F5] text-[#4C6A63]"}`}
    >
      {children}
    </button>
  );
}

export function StepFooter({
  onNext,
  nextLabel,
  disabled,
  blockedReason,
  onBack,
  loading,
}: {
  onNext: () => void;
  nextLabel: string;
  disabled?: boolean;
  blockedReason?: string;
  onBack?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mt-5 flex flex-col gap-2 border-t border-[#E7F2ED] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-[#C4564A]">{disabled && blockedReason ? blockedReason : ""}</div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {onBack && (
          <button type="button" onClick={onBack} className="rounded-full border border-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-[#0F5C47]">
            رجوع
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || loading}
          className="rounded-full bg-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {loading ? "..." : nextLabel}
        </button>
      </div>
    </div>
  );
}
