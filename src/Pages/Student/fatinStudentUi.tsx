import type { ReactNode } from "react";
import { Spin } from "antd";
import type { ErrorCategory, SkillStatus } from "../../Services/Fatin/types";

export const pct = (value: number | string | null | undefined) => Math.round(Number(value ?? 0) * 100);

export const SKILL_STATUS: Record<SkillStatus, { label: string; bg: string; fg: string; dot: string }> = {
  mastered: { label: "متقنة", bg: "#E3F4EC", fg: "#1B7F5C", dot: "#1B7F5C" },
  in_progress: { label: "قيد التقدم", bg: "#FFF4D6", fg: "#8A5A00", dot: "#E0A526" },
  available: { label: "متاحة", bg: "#E7F2ED", fg: "#0F5C47", dot: "#0F5C47" },
  locked: { label: "مقفلة", bg: "#EEF3F1", fg: "#4C6A63", dot: "#9DB1AA" },
};

export const ERROR_LABEL: Record<ErrorCategory, string> = {
  concept: "خطأ مفاهيمي",
  procedure: "خطأ إجرائي",
  careless: "خطأ إهمالي",
};

export const ERROR_COLOR: Record<ErrorCategory, string> = {
  concept: "#C4564A",
  procedure: "#E0A526",
  careless: "#3B82C4",
};

export function Chip({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full px-3 py-0.5 text-[13px] font-semibold" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

/** Bandeau vert des écrans élève (fil d'Ariane + titre), comme dans le design. */
export function StudentBanner({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="bg-[#0F5C47] px-5 pb-4 pt-6 text-white lg:mx-7 lg:rounded-2xl">
      <p className="text-[13px] text-white/85">{kicker}</p>
      <h1 className="mt-0.5 text-[22px] font-extrabold">{title}</h1>
      {children}
    </header>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spin />
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-white p-5 text-center text-sm text-[#4C6A63]">{children}</p>;
}

/** Feuille modale en bas d'écran (fiche d'erreur, redirection). */
export function BottomSheet({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0b1f1a]/70 sm:items-center" dir="rtl">
      <div className="flex w-full max-w-[520px] flex-col gap-3 rounded-t-3xl bg-white px-5 pb-7 pt-5 sm:rounded-3xl">{children}</div>
    </div>
  );
}

export function PrimaryButton(props: { onClick?: () => void; disabled?: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={`min-h-[48px] rounded-xl bg-[#0F5C47] px-5 text-base font-extrabold text-white disabled:opacity-50 ${props.className ?? ""}`}
    >
      {props.children}
    </button>
  );
}

export function SecondaryButton(props: { onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`min-h-[48px] rounded-xl border-2 border-[#0F5C47] bg-white px-5 text-base font-extrabold text-[#0F5C47] ${props.className ?? ""}`}
    >
      {props.children}
    </button>
  );
}
