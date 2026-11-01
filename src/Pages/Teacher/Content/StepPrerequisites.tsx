import { useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import {
  useContentPrerequisites,
  useContentSave,
  useContentSkills,
  usePrerequisiteCandidates,
} from "../../../Services/Fatin/useTeacherContent";
import type { CSkill, PrereqCandidate } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";
import { Instruction, StepFooter } from "./contentUi";

type Props = { lessonId: number; onNext: () => void; onBack: () => void };

const STATE_LABEL: Record<PrereqCandidate["state"], { label: string; cls: string }> = {
  available: { label: "متاحة", cls: "bg-[#E3F4EC] text-[#1B7F5C]" },
  linked: { label: "مضافة", cls: "bg-[#E7F2ED] text-[#0F5C47]" },
  cycle: { label: "تُنشئ دورة — محظورة", cls: "bg-[#FDECEA] text-[#B3392F]" },
};

// Étape 5 (écran T7) : prérequis de chaque skill, sans cycle.
export default function StepPrerequisites({ lessonId, onNext, onBack }: Props) {
  const { data: skills = [] } = useContentSkills(lessonId);
  const { data: links = [] } = useContentPrerequisites(lessonId);
  const save = useContentSave();
  const [target, setTarget] = useState<CSkill | null>(null);

  return (
    <div className="space-y-3">
      <Instruction>
        حدّد ما يجب أن يتقنه الطالب قبل كل مهارة (اختياري). عند التعثر، يوجّه النظام الطالب تلقائيًا إلى هذه المتطلبات.
      </Instruction>
      <div className="space-y-2">
        {skills.map((skill) => {
          const own = links.filter((link) => link.skill.id === skill.id);
          return (
            <div key={skill.id} className="rounded-2xl border border-[#E7F2ED] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="me-2 text-xs text-[#8CA39C]" dir="ltr">{skill.code}</span>
                  <b>{skill.name}</b>
                </div>
                <button type="button" onClick={() => setTarget(skill)} className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-extrabold text-[#0F5C47]">
                  + متطلب
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {own.length === 0 && <span className="text-xs text-[#8CA39C]">لا متطلبات</span>}
                {own.map((link) => (
                  <span key={link.id} className="flex items-center gap-1 rounded-full bg-[#F3F7F5] px-3 py-1 text-xs">
                    ← {link.prerequisite.name}
                    <button
                      type="button"
                      className="ms-1 text-[#C4564A]"
                      aria-label="إزالة"
                      onClick={() => save.mutate({ method: "delete", url: API_ENDPOINTS.content.prerequisiteDetail(link.id), success: "تمت إزالة المتطلب" })}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextLabel="التالي ← القطع" />
      {target && <PrerequisitePicker skill={target} onClose={() => setTarget(null)} />}
    </div>
  );
}

function PrerequisitePicker({ skill, onClose }: { skill: CSkill; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const { data: candidates = [], isFetching } = usePrerequisiteCandidates(skill.id, search);
  const save = useContentSave();

  return (
    <FatinModal
      open
      title="إضافة متطلب سابق"
      subtitle={`المهارة: ${skill.name} — اختر المهارة التي يجب إتقانها أولًا`}
      onClose={onClose}
      okText="إضافة المتطلب"
      loading={save.isPending}
      onOk={() =>
        selected &&
        save.mutate(
          { method: "post", url: API_ENDPOINTS.skills.prerequisites, data: { skill: skill.id, prerequisite: selected }, success: "تمت إضافة المتطلب" },
          { onSuccess: onClose },
        )
      }
    >
      <input className="fatin-field mb-3" placeholder="بحث" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="max-h-72 space-y-2 overflow-auto">
        {isFetching && candidates.length === 0 && <p className="text-sm text-[#4C6A63]">...</p>}
        {candidates.map((candidate) => {
          const state = STATE_LABEL[candidate.state];
          const disabled = candidate.state !== "available";
          return (
            <button
              key={candidate.id}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(candidate.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-sm ${selected === candidate.id ? "border-[#0F5C47] bg-[#E7F2ED]" : "border-[#E7F2ED]"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span>
                <span className="block text-xs text-[#8CA39C]" dir="ltr">{candidate.code}</span>
                {candidate.name}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${state.cls}`}>{state.label}</span>
            </button>
          );
        })}
      </div>
    </FatinModal>
  );
}
