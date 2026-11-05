import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "../../api/endpoints";
import {
  useContentLessons,
  useContentSave,
  useContentUnit,
  useContentUnits,
} from "../../Services/Fatin/useTeacherContent";
import type { CUnit } from "../../Services/Fatin/types";
import FatinModal from "../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../ui/FatinChrome";
import { EmptyNote, Loading } from "../Student/fatinStudentUi";
import { Pill, STEPS } from "./Content/contentUi";
import StepUnit from "./Content/StepUnit";
import StepLesson from "./Content/StepLesson";
import StepGoals from "./Content/StepGoals";
import StepSkills from "./Content/StepSkills";
import StepPrerequisites from "./Content/StepPrerequisites";
import StepChunks from "./Content/StepChunks";
import StepPublish from "./Content/StepPublish";

type Filter = "all" | "published" | "draft";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "published", label: "منشورة" },
  { id: "draft", label: "مسودة" },
];

const subjectIdOf = (unit: CUnit) => (typeof unit.subject === "number" ? unit.subject : unit.subject.id);

/**
 * Écrans T2 → T9 du design : liste des unités puis éditeur en 7 étapes
 * (unité → leçon → objectifs → compétences → prérequis → chunks → publication).
 * L'état de l'éditeur vit dans l'URL (?unit=&lesson=&step=) pour que les
 * liens « إصلاح » des tableaux de bord ouvrent directement la bonne étape.
 */
export default function FatinContentPage() {
  const [params, setParams] = useSearchParams();
  const editing = params.has("unit") || params.get("new") === "1";
  const unitId = Number(params.get("unit")) || null;
  const lessonId = Number(params.get("lesson")) || null;
  const step = Math.min(6, Math.max(0, Number(params.get("step")) || 0));

  const go = useCallback(
    (next: { unit?: number | null; lesson?: number | null; step?: number } | null) => {
      if (!next) {
        setParams({});
        return;
      }
      const query: Record<string, string> = {};
      if (next.unit) query.unit = String(next.unit);
      else query.new = "1";
      if (next.lesson) query.lesson = String(next.lesson);
      query.step = String(next.step ?? 0);
      setParams(query);
    },
    [setParams],
  );

  return editing ? (
    <Editor unitId={unitId} lessonId={lessonId} step={step} go={go} />
  ) : (
    <UnitList onOpen={(unit, nextStep) => go({ unit: unit?.id ?? null, step: nextStep })} />
  );
}

// ==================== T2 : mes unités ====================

function UnitList({ onOpen }: { onOpen: (unit: CUnit | null, step: number) => void }) {
  const { data: units = [], isLoading, isError } = useContentUnits();
  const save = useContentSave();
  const query = useFatinQuery();
  const [filter, setFilter] = useState<Filter>("all");
  const [subject, setSubject] = useState<number | "all">("all");
  const [removeTarget, setRemoveTarget] = useState<CUnit | null>(null);

  const openNew = useCallback(() => onOpen(null, 0), [onOpen]);
  const published = units.filter((unit) => unit.is_published).length;
  useFatinChrome({
    subtitle: units.length ? `${units.length} وحدات · ${published} منشورة` : "وحداتك التعليمية",
    actionLabel: "+ وحدة جديدة",
    onAction: openNew,
  });

  const subjects = useMemo(() => {
    const map = new Map<number, string>();
    units.forEach((unit) => map.set(subjectIdOf(unit), unit.subject_name));
    return [...map.entries()];
  }, [units]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return units
      .filter((unit) => filter === "all" || (filter === "published" ? unit.is_published : !unit.is_published))
      .filter((unit) => subject === "all" || subjectIdOf(unit) === subject)
      .filter((unit) => !q || `${unit.code} ${unit.title} ${unit.subject_name}`.toLowerCase().includes(q))
      .sort((a, b) => a.subject_name.localeCompare(b.subject_name, "ar") || a.order_index - b.order_index);
  }, [units, filter, subject, query]);

  if (isLoading) return <Loading />;

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {subjects.length > 1 && (
            <select
              className="fatin-field !h-9 !w-auto !rounded-full !bg-white text-sm"
              value={subject}
              onChange={(event) => setSubject(event.target.value === "all" ? "all" : Number(event.target.value))}
              aria-label="المادة"
            >
              <option value="all">كل المواد</option>
              {subjects.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Pill key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}
            </Pill>
          ))}
        </div>
      </div>

      {isError && <EmptyNote>تعذر تحميل الوحدات.</EmptyNote>}

      {!isError && units.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <p className="text-lg font-extrabold text-[#12302B]">لم تُنشئ أي وحدة بعد</p>
          <p className="mt-1 text-sm text-[#4C6A63]">ابدأ بوحدة، ثم أضف درسًا وأهدافه ومهاراته وقطع المحتوى.</p>
          <button type="button" onClick={openNew} className="mt-4 rounded-full bg-[#0F5C47] px-5 py-2.5 text-sm font-extrabold text-white">
            + وحدة جديدة
          </button>
        </div>
      )}

      {units.length > 0 && (
        <div className="fatin-table-wrap rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead className="bg-[#F3F7F5] text-[#4C6A63]">
              <tr>
                <th className="px-4 py-3 text-start">الرمز</th>
                <th className="px-4 py-3 text-start">العنوان</th>
                <th className="px-4 py-3 text-start">المادة</th>
                <th className="px-4 py-3 text-start">الدروس</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4C6A63]">لا توجد وحدات في هذا العرض.</td>
                </tr>
              )}
              {rows.map((unit) => (
                <tr key={unit.id} className="border-t border-[#E7F2ED]">
                  <td className="px-4 py-3 font-bold text-[#0F5C47]" dir="ltr">{unit.code}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onOpen(unit, 1)} className="text-start font-bold text-[#12302B] hover:underline">
                      {unit.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">{unit.subject_name || "—"}</td>
                  <td className="px-4 py-3">{unit.lessons_count}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${unit.is_published ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
                      {unit.is_published ? "منشورة" : "مسودة"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => onOpen(unit, 1)} className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-bold text-[#0F5C47]">
                        الدروس
                      </button>
                      <button type="button" onClick={() => onOpen(unit, 0)} className="px-2" aria-label="تعديل الوحدة" title="تعديل الوحدة">✎</button>
                      <button type="button" onClick={() => setRemoveTarget(unit)} className="px-2 text-[#C4564A]" aria-label="حذف" title="حذف">⌫</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FatinModal
        open={removeTarget !== null}
        title="حذف الوحدة؟"
        subtitle={removeTarget ? `${removeTarget.code} · ${removeTarget.title}` : ""}
        onClose={() => setRemoveTarget(null)}
        okText="حذف"
        loading={save.isPending}
        onOk={() =>
          removeTarget &&
          save.mutate(
            { method: "delete", url: API_ENDPOINTS.content.unitDetail(removeTarget.id), success: "تم حذف الوحدة" },
            { onSuccess: () => setRemoveTarget(null) },
          )
        }
      >
        <p className="text-sm text-[#4C6A63]">ستُحذف دروسها وأهدافها ومهاراتها وقطعها نهائيًا.</p>
      </FatinModal>
    </div>
  );
}

// ==================== T3 → T9 : éditeur ====================

type EditorProps = {
  unitId: number | null;
  lessonId: number | null;
  step: number;
  go: (next: { unit?: number | null; lesson?: number | null; step?: number } | null) => void;
};

function Editor({ unitId, lessonId, step, go }: EditorProps) {
  const { data: units = [] } = useContentUnits();
  const { data: unit } = useContentUnit(unitId);
  const { data: lessons, isLoading: loadingLessons } = useContentLessons(unitId);
  const lesson = lessons?.find((item) => item.id === lessonId);

  useFatinChrome({ subtitle: unit ? `${unit.code} · ${unit.title}` : "وحدة جديدة" });

  // Sans unité ou sans leçon, les étapes suivantes ne sont pas accessibles.
  const current = !unitId ? 0 : step >= 2 && !lessonId ? 1 : step;
  const reachable = (index: number) => index === 0 || (index === 1 ? !!unitId : !!unitId && !!lessonId);

  const toList = () => go(null);
  const toStep = (index: number) => go({ unit: unitId, lesson: lessonId, step: index });
  const toNewLesson = () => go({ unit: unitId, lesson: null, step: 1 });

  let body;
  if (current === 0) {
    body = <StepUnit unitId={unitId} units={units} onCancel={toList} onSaved={(id) => go({ unit: id, lesson: lessonId, step: 1 })} />;
  } else if (current === 1) {
    body = <StepLesson unitId={unitId!} lessonId={lessonId} onBack={() => toStep(0)} onSelect={(id) => go({ unit: unitId, lesson: id, step: 2 })} onNew={toNewLesson} />;
  } else if (!lesson) {
    body = loadingLessons ? <Loading /> : <EmptyNote>الدرس غير موجود. اختر درسًا من الخطوة 2.</EmptyNote>;
  } else if (current === 2) {
    body = <StepGoals lessonId={lesson.id} onBack={() => toStep(1)} onNext={() => toStep(3)} />;
  } else if (current === 3) {
    body = <StepSkills lesson={lesson} onBack={() => toStep(2)} onNext={() => toStep(4)} />;
  } else if (current === 4) {
    body = <StepPrerequisites lessonId={lesson.id} onBack={() => toStep(3)} onNext={() => toStep(5)} />;
  } else if (current === 5) {
    body = <StepChunks lessonId={lesson.id} onBack={() => toStep(4)} onNext={() => toStep(6)} />;
  } else {
    body = <StepPublish unitId={unitId!} lesson={lesson} onBack={() => toStep(5)} onGoTo={toStep} onNewLesson={toNewLesson} onDone={toList} />;
  }

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={toList} className="text-sm font-bold text-[#0F5C47]">
          → وحداتي
        </button>
        {lesson && (
          <span className="rounded-full bg-white px-3 py-1 text-xs text-[#4C6A63]">
            الدرس: <b className="text-[#12302B]" dir="ltr">{lesson.code}</b> · {lesson.title}
          </span>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:p-5">
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
                  onClick={() => toStep(index)}
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
        {body}
      </div>
    </div>
  );
}
