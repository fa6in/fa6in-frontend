import { useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import {
  useContentLessons,
  useContentSave,
  useContentUnit,
  usePublicationCheck,
} from "../../../Services/Fatin/useTeacherContent";
import type { CLesson, PublicationCheck } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";
import { Instruction, StepFooter } from "./contentUi";

type Props = {
  unitId: number;
  lesson: CLesson;
  onBack: () => void;
  onGoTo: (step: number) => void;
  onDone: () => void;
};

type CheckKey = PublicationCheck["checks"][number]["key"];

// Chaque contrôle renvoie à l'étape du wizard qui permet de le corriger.
const CHECKS: Record<CheckKey, { label: string; step: number }> = {
  goals: { label: "هدف مفاهيمي وهدف عمليّاتي", step: 2 },
  skill_types: { label: "نوع كل مهارة يطابق هدفها", step: 3 },
  no_cycles: { label: "لا دورات في المتطلبات", step: 4 },
  chunks: { label: "قطع كافية لكل مهارة: قاعدة، مثال، تمرينان", step: 5 },
};

const GOAL_NAME: Record<string, string> = { conceptual: "المفاهيمي", operational: "العمليّاتي" };

function detailLines(check: PublicationCheck["checks"][number]): string[] {
  const d = check.detail ?? {};
  const lines: string[] = [];
  if (d.missing?.length) lines.push(`ينقص الهدف ${d.missing.map((item) => GOAL_NAME[item] ?? item).join(" و")}`);
  if (d.goals_without_skill?.length) lines.push(`أهداف بلا مهارة: ${d.goals_without_skill.join("، ")}`);
  if (d.mismatched_skills?.length) lines.push(`مهارات بنوع مختلف عن هدفها: ${d.mismatched_skills.join("، ")}`);
  d.incomplete_skills?.forEach((item) => {
    const missing: string[] = [];
    if (item.rule < 1) missing.push("قاعدة");
    if (item.example < 1) missing.push("مثال");
    if (item.practice < 2) missing.push(`${2 - item.practice} تمرين`);
    lines.push(`${item.skill}: ينقص ${missing.join("، ")}`);
  });
  return lines;
}

// Étape 7 (écran T9) : liste de contrôle du serveur puis publication de la
// leçon ; l'unité peut être publiée dès qu'une de ses leçons l'est.
export default function StepPublish({ unitId, lesson, onBack, onGoTo, onDone }: Props) {
  const { data: check, isLoading, isError, refetch, isFetching } = usePublicationCheck(lesson.id);
  const { data: unit } = useContentUnit(unitId);
  const { data: lessons = [] } = useContentLessons(unitId);
  const save = useContentSave();
  const [confirm, setConfirm] = useState<"lesson" | "unit" | null>(null);

  const publishedLessons = lessons.filter((item) => item.is_published).length;
  const ready = !!check?.ready;

  const publish = () => {
    if (confirm === "lesson") {
      save.mutate(
        { method: "post", url: API_ENDPOINTS.content.lessonPublish(lesson.id), success: "تم نشر الدرس — أصبح متاحًا للطلاب" },
        { onSuccess: () => setConfirm(null) },
      );
    } else if (confirm === "unit") {
      save.mutate(
        { method: "post", url: API_ENDPOINTS.content.unitPublish(unitId), success: "تم نشر الوحدة" },
        { onSuccess: () => { setConfirm(null); onDone(); } },
      );
    }
  };

  return (
    <div className="space-y-3">
      <Instruction>
        {lesson.is_published
          ? "هذا الدرس منشور. يمكنك نشر الوحدة لتظهر في مسار الطلاب."
          : "راجع قائمة النشر. كل البنود يجب أن تكون مكتملة قبل نشر الدرس."}
      </Instruction>

      <section className="rounded-2xl border border-[#E7F2ED] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-[#12302B]">
            قائمة النشر · <span dir="ltr">{lesson.code}</span>
          </h3>
          <button type="button" onClick={() => refetch()} className="text-xs font-bold text-[#0F5C47]" disabled={isFetching}>
            {isFetching ? "..." : "↻ تحديث"}
          </button>
        </div>

        {isLoading && <p className="py-4 text-center text-sm text-[#4C6A63]">جارٍ التحقق...</p>}
        {isError && <p className="py-4 text-center text-sm text-[#C4564A]">تعذر التحقق من جاهزية الدرس.</p>}

        <ul className="space-y-2">
          {check?.checks.map((item) => {
            const meta = CHECKS[item.key] ?? { label: item.key, step: 2 };
            const lines = item.ok ? [] : detailLines(item);
            return (
              <li key={item.key} className={`rounded-xl px-3 py-2.5 ${item.ok ? "bg-[#F3F7F5]" : "bg-[#FFF8E6]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#12302B]">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs text-white ${item.ok ? "bg-[#1B7F5C]" : "bg-[#E0A526]"}`}>
                      {item.ok ? "✓" : "!"}
                    </span>
                    {meta.label}
                  </span>
                  {!item.ok && (
                    <button type="button" onClick={() => onGoTo(meta.step)} className="shrink-0 text-xs font-extrabold text-[#8A5A00]">
                      إصلاح ←
                    </button>
                  )}
                </div>
                {lines.map((line) => (
                  <p key={line} className="ms-8 mt-1 text-xs text-[#8A5A00]">{line}</p>
                ))}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#F3F7F5] p-4">
          <div className="text-xs text-[#4C6A63]">الدرس</div>
          <div className="mt-1 font-extrabold">{lesson.title}</div>
          <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${lesson.is_published ? "bg-[#E3F4EC] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
            {lesson.is_published ? "منشور" : "مسودة"}
          </span>
        </div>
        <div className="rounded-2xl bg-[#F3F7F5] p-4">
          <div className="text-xs text-[#4C6A63]">الوحدة</div>
          <div className="mt-1 font-extrabold">{unit?.title ?? "—"}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${unit?.is_published ? "bg-[#E3F4EC] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
              {unit?.is_published ? "منشورة" : "مسودة"}
            </span>
            <span className="text-xs text-[#4C6A63]">{publishedLessons} / {lessons.length} دروس منشورة</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {!unit?.is_published && (
          <button
            type="button"
            disabled={publishedLessons === 0}
            onClick={() => setConfirm("unit")}
            title={publishedLessons === 0 ? "انشر درسًا واحدًا على الأقل أولًا" : ""}
            className="rounded-full border border-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-[#0F5C47] disabled:opacity-40"
          >
            نشر الوحدة
          </button>
        )}
      </div>

      <StepFooter
        onBack={onBack}
        onNext={() => (lesson.is_published ? onDone() : setConfirm("lesson"))}
        disabled={!lesson.is_published && !ready}
        blockedReason="أكمل البنود الناقصة لتفعيل النشر."
        nextLabel={lesson.is_published ? "إنهاء ← العودة إلى وحداتي" : "نشر الدرس"}
      />

      <FatinModal
        open={confirm !== null}
        title={confirm === "unit" ? "نشر الوحدة؟" : "جاهز للنشر؟"}
        subtitle={confirm === "unit" ? unit?.title : lesson.title}
        onClose={() => setConfirm(null)}
        okText={confirm === "unit" ? "نشر الوحدة" : "نشر الدرس"}
        loading={save.isPending}
        onOk={publish}
      >
        <p className="text-sm leading-relaxed text-[#4C6A63]">
          {confirm === "unit"
            ? "ستظهر الوحدة في مسار الطلاب مع دروسها المنشورة."
            : "سيصبح الدرس ومهاراته متاحة للطلاب، ويبدأ محرك القرار باستخدام قطعه."}
        </p>
      </FatinModal>
    </div>
  );
}
