import { useState } from "react";
import { message } from "antd";
import { API_ENDPOINTS } from "../../../api/endpoints";
import {
  useContentLessons,
  useContentPrerequisites,
  useContentSave,
  useContentSkills,
  usePrerequisiteCandidates,
} from "../../../Services/Fatin/useTeacherContent";
import type { CSkill, PrereqCandidate } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";
import { Instruction, StepFooter } from "./contentUi";

type Props = { unitId: number; lessonId: number; onNext: () => void; onBack: () => void };

const STATE_LABEL: Record<PrereqCandidate["state"] | "unpublished", { label: string; cls: string }> = {
  available: { label: "متاحة", cls: "bg-[#E3F4EC] text-[#1B7F5C]" },
  linked: { label: "مضافة", cls: "bg-[#E7F2ED] text-[#0F5C47]" },
  cycle: { label: "تُنشئ دورة — محظورة", cls: "bg-[#FDECEA] text-[#B3392F]" },
  unpublished: { label: "غير متاحة", cls: "bg-[#F3F7F5] text-[#8CA39C]" },
};

// Étape 5 (écran T7) : prérequis de chaque skill, sans cycle.
export default function StepPrerequisites({ unitId, lessonId, onNext, onBack }: Props) {
  const { data: skills = [] } = useContentSkills(lessonId);
  const { data: links = [] } = useContentPrerequisites(lessonId);
  const { data: unitLessons = [] } = useContentLessons(unitId);
  const publishedLessonCodes = new Set(unitLessons.filter((item) => item.is_published).map((item) => item.code));
  const save = useContentSave();
  const [target, setTarget] = useState<CSkill | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleExpanded = (skillId: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });

  const COLLAPSED_COUNT = 3;

  return (
    <div className="space-y-3">
      <Instruction>
        حدّد ما يجب أن يتقنه الطالب قبل كل مهارة (اختياري). عند التعثر، يوجّه النظام الطالب تلقائيًا إلى هذه المتطلبات.
      </Instruction>
      <div className="space-y-2.5">
        {skills.map((skill) => {
          const own = links.filter((link) => link.skill.id === skill.id);
          const isExpanded = expanded.has(skill.id);
          const visible = isExpanded ? own : own.slice(0, COLLAPSED_COUNT);
          const hiddenCount = own.length - visible.length;
          return (
            <div key={skill.id} className="rounded-2xl border border-[#E7F2ED] bg-white p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#F3F7F5] px-1.5 py-0.5 text-[11px] font-bold text-[#4C6A63]" dir="ltr">{skill.code}</span>
                  <b className="text-[#12302B]">{skill.name}</b>
                  {own.length > 0 && (
                    <span className="rounded-full bg-[#E7F2ED] px-2 py-0.5 text-[11px] font-bold text-[#0F5C47]">{own.length}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setTarget(skill)}
                  className="shrink-0 rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-extrabold text-[#0F5C47] transition-colors hover:bg-[#F3F7F5]"
                >
                  + متطلب
                </button>
              </div>
              <div className="mt-2.5">
                {own.length === 0 ? (
                  <p className="text-xs text-[#8CA39C]">لا متطلبات لهذه المهارة بعد</p>
                ) : (
                  <>
                    <ol className="space-y-1">
                      {visible.map((link, index) => (
                        <li
                          key={link.id}
                          className="flex items-center gap-2 rounded-lg bg-[#F8FAF9] px-2.5 py-1.5 text-sm text-[#12302B]"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E7F2ED] text-[10px] font-bold text-[#0F5C47]">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-bold">{link.prerequisite.name}</span>
                          <span className="shrink-0 text-[11px] text-[#8CA39C]" dir="ltr">{link.prerequisite.code}</span>
                          <button
                            type="button"
                            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#8CA39C] transition-colors hover:bg-[#FDECEA] hover:text-[#C4564A]"
                            aria-label="إزالة"
                            onClick={() => save.mutate({ method: "delete", url: API_ENDPOINTS.content.prerequisiteDetail(link.id), success: "تمت إزالة المتطلب" })}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ol>
                    {own.length > COLLAPSED_COUNT && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(skill.id)}
                        className="mt-1.5 text-xs font-bold text-[#0F5C47] hover:underline"
                      >
                        {isExpanded ? "عرض أقل ↑" : `+${hiddenCount} أخرى ↓`}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextLabel="التالي ← القطع" />
      {target && (
        <PrerequisitePicker skill={target} publishedLessonCodes={publishedLessonCodes} onClose={() => setTarget(null)} />
      )}
    </div>
  );
}

function PrerequisitePicker({
  skill,
  publishedLessonCodes,
  onClose,
}: {
  skill: CSkill;
  publishedLessonCodes: Set<string>;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const { data: rawCandidates = [], isFetching } = usePrerequisiteCandidates(skill.id, search);
  const save = useContentSave();

  const rank: Record<string, number> = { available: 0, linked: 1, unpublished: 2, cycle: 3 };
  const candidates = [...rawCandidates].sort((a, b) => {
    const stateOf = (c: PrereqCandidate) => (publishedLessonCodes.has(c.lesson_code) ? c.state : "unpublished");
    return rank[stateOf(a)] - rank[stateOf(b)];
  });

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const addAll = async () => {
    for (const prerequisite of selected) {
      await save.mutateAsync({
        method: "post",
        url: API_ENDPOINTS.skills.prerequisites,
        data: { skill: skill.id, prerequisite },
      });
    }
    message.success(selected.length > 1 ? "تمت إضافة المتطلبات" : "تمت إضافة المتطلب");
    onClose();
  };

  return (
    <FatinModal
      open
      title="إضافة متطلب سابق"
      subtitle={`المهارة: ${skill.name} — اختر مهارة أو أكثر يجب إتقانها أولًا`}
      onClose={onClose}
      okText={selected.length > 1 ? `إضافة ${selected.length} متطلبات` : "إضافة المتطلب"}
      loading={save.isPending}
      onOk={() => selected.length > 0 && addAll()}
    >
      <div className="mb-3 flex items-center gap-2">
        <input
          className="fatin-field flex-1"
          placeholder="ابحث بالاسم أو الرمز"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {selected.length > 0 && (
          <span className="shrink-0 rounded-full bg-[#0F5C47] px-2.5 py-1 text-xs font-bold text-white">
            {selected.length} محدّدة
          </span>
        )}
      </div>

      <div className="max-h-72 space-y-1.5 overflow-auto rounded-xl border border-[#E7F2ED] bg-[#FAFCFB] p-1.5">
        {isFetching && candidates.length === 0 && <p className="py-4 text-center text-sm text-[#4C6A63]">جارٍ التحميل...</p>}
        {!isFetching && candidates.length === 0 && <p className="py-4 text-center text-sm text-[#8CA39C]">لا توجد نتائج</p>}
        {candidates.map((candidate) => {
          const published = publishedLessonCodes.has(candidate.lesson_code);
          const state = STATE_LABEL[published ? candidate.state : "unpublished"];
          const disabled = !published || candidate.state !== "available";
          const checked = selected.includes(candidate.id);
          return (
            <button
              key={candidate.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(candidate.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-start text-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed border-transparent bg-transparent opacity-50"
                  : checked
                    ? "border-[#0F5C47] bg-[#E7F2ED]"
                    : "border-transparent bg-white hover:border-[#E7F2ED]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${
                    checked ? "border-[#0F5C47] bg-[#0F5C47] text-white" : "border-[#C9D9D3] bg-white text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-[#12302B]">{candidate.name}</span>
                  <span className="text-xs text-[#8CA39C]" dir="ltr">{candidate.code} · {candidate.lesson_code}</span>
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${state.cls}`}>{state.label}</span>
            </button>
          );
        })}
      </div>
    </FatinModal>
  );
}
