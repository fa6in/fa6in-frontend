import { useMemo, useState } from "react";
import { message } from "antd";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useContentLessons, useContentSave } from "../../../Services/Fatin/useTeacherContent";
import type { CUnit } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";

const subjectIdOf = (unit: CUnit) => (typeof unit.subject === "number" ? unit.subject : unit.subject.id);

type Props = { units: CUnit[]; onClose: () => void };

// Action autonome (hors assistant d'édition) : choisir une unité source,
// cocher des leçons, choisir une unité cible de la même matière, puis
// déplacer (PATCH du champ `unit` de chaque leçon cochée).
export default function MoveLessonsModal({ units, onClose }: Props) {
  const save = useContentSave();
  const [sourceUnit, setSourceUnit] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
  const { data: lessons = [], isLoading } = useContentLessons(sourceUnit ? Number(sourceUnit) : null);

  const source = units.find((item) => item.id === Number(sourceUnit)) ?? null;
  const targetCandidates = useMemo(
    () => (source ? units.filter((item) => item.id !== source.id && subjectIdOf(item) === subjectIdOf(source)) : []),
    [units, source],
  );

  const toggleLesson = (id: number, checked: boolean) =>
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const changeSourceUnit = (value: string) => {
    setSourceUnit(value);
    setTargetUnit("");
    setSelectedLessons(new Set());
  };

  const moveSelected = () => {
    if (!targetUnit || selectedLessons.size === 0) return;
    const ids = [...selectedLessons];
    let remaining = ids.length;
    const failed = new Set<number>();
    ids.forEach((id) => {
      save.mutate(
        { method: "patch", url: API_ENDPOINTS.content.lessonDetail(id), data: { unit: Number(targetUnit) } },
        {
          onError: () => failed.add(id),
          onSettled: () => {
            remaining -= 1;
            if (remaining === 0) {
              if (failed.size === 0) {
                message.success(`تم نقل ${ids.length} درسًا إلى الوحدة الجديدة`);
                setSelectedLessons(new Set());
                setTargetUnit("");
              } else {
                const movedCount = ids.length - failed.size;
                if (movedCount > 0) {
                  message.warning(`تم نقل ${movedCount} درسًا، وفشل نقل ${failed.size}. أعد المحاولة على الدروس المحددة.`);
                } else {
                  message.error(`فشل نقل ${failed.size} درسًا.`);
                }
                setSelectedLessons(failed);
              }
            }
          },
        },
      );
    });
  };

  return (
    <FatinModal open title="نقل دروس بين الوحدات" onClose={onClose} okText="نقل المحدَّد" loading={save.isPending} onOk={moveSelected} disableOk={!targetUnit || selectedLessons.size === 0}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-[#4C6A63]">
          <span className="mb-1 block font-bold">من الوحدة</span>
          <select className="fatin-field" value={sourceUnit} onChange={(event) => changeSourceUnit(event.target.value)}>
            <option value="">اختر الوحدة المصدر</option>
            {units.map((item) => (
              <option key={item.id} value={item.id}>{item.code} · {item.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-[#4C6A63]">
          <span className="mb-1 block font-bold">إلى الوحدة</span>
          <select className="fatin-field" value={targetUnit} onChange={(event) => setTargetUnit(event.target.value)} disabled={!source}>
            <option value="">اختر الوحدة الهدف</option>
            {targetCandidates.map((item) => (
              <option key={item.id} value={item.id}>{item.code} · {item.title}</option>
            ))}
          </select>
        </label>
      </div>

      {!source && <p className="mt-4 text-sm text-[#8CA39C]">اختر الوحدة المصدر لعرض دروسها.</p>}
      {source && isLoading && <p className="mt-4 text-sm text-[#8CA39C]">جارٍ تحميل الدروس…</p>}
      {source && !isLoading && lessons.length === 0 && <p className="mt-4 text-sm text-[#8CA39C]">لا توجد دروس في هذه الوحدة.</p>}
      {source && !isLoading && lessons.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-[#4C6A63]">{selectedLessons.size} درس محدَّد من {lessons.length}</p>
          <div className="max-h-64 space-y-2 overflow-auto">
            {lessons.map((lesson) => (
              <label key={lesson.id} className="flex items-center gap-2 rounded-xl border border-[#E7F2ED] bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedLessons.has(lesson.id)}
                  onChange={(event) => toggleLesson(lesson.id, event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[#0F5C47]"
                />
                <span className="min-w-0 flex-1 truncate">
                  <b className="me-2 text-[#0F5C47]" dir="ltr">{lesson.code}</b>
                  {lesson.title}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${lesson.is_published ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
                  {lesson.is_published ? "منشور" : "مسودة"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      {source && targetCandidates.length === 0 && (
        <p className="mt-3 text-sm text-[#8A5A00]">لا توجد وحدة أخرى بنفس المادة لنقل الدروس إليها.</p>
      )}
    </FatinModal>
  );
}
