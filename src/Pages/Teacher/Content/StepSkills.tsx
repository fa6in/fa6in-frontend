import { useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useContentGoals, useContentSave, useContentSkills } from "../../../Services/Fatin/useTeacherContent";
import type { CGoal, CLesson, CSkill } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";
import { Field, GOAL_LABEL, Instruction, StepFooter, nextCode } from "./contentUi";

type Props = { lesson: CLesson; onNext: () => void; onBack: () => void };

const goalIdOf = (skill: CSkill) => (typeof skill.goal === "number" ? skill.goal : skill.goal.id);

// Étape 4 (écrans T6 / T6b) : skills de chaque goal, le type est hérité du goal.
export default function StepSkills({ lesson, onNext, onBack }: Props) {
  const { data: goals = [] } = useContentGoals(lesson.id);
  const { data: skills = [] } = useContentSkills(lesson.id);
  const save = useContentSave();
  const [editor, setEditor] = useState<{ goal: CGoal; skill?: CSkill } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CSkill | null>(null);
  const goalsWithoutSkill = goals.filter((goal) => !skills.some((skill) => goalIdOf(skill) === goal.id));

  return (
    <div className="space-y-3">
      <Instruction>أضف مهارة واحدة على الأقل لكل هدف. نوع المهارة يُورث من هدفها.</Instruction>
      <div className="grid gap-3 lg:grid-cols-2">
        {goals.map((goal) => (
          <section key={goal.id} className="rounded-2xl bg-[#F3F7F5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-extrabold">{GOAL_LABEL[goal.goal_type]}</h3>
              <button type="button" onClick={() => setEditor({ goal })} className="rounded-full border border-[#0F5C47] bg-white px-3 py-1 text-xs font-extrabold text-[#0F5C47]">
                + مهارة
              </button>
            </div>
            <p className="mb-2 text-xs text-[#4C6A63]">{goal.title}</p>
            <div className="space-y-2">
              {skills.filter((skill) => goalIdOf(skill) === goal.id).map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-xs text-[#8CA39C]" dir="ltr">{skill.code}</div>
                    <div className="truncate font-bold">{skill.name}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${skill.chunks_ready ? "bg-[#E3F4EC] text-[#1B7F5C]" : "bg-[#FFF4D6] text-[#8A5A00]"}`}>
                      {skill.chunks_ready ? "قطع كافية" : "قطع ناقصة"}
                    </span>
                    <button type="button" onClick={() => setEditor({ goal, skill })} aria-label="تعديل">✎</button>
                    <button type="button" className="text-[#C4564A]" onClick={() => setRemoveTarget(skill)} aria-label="حذف">⌫</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        disabled={goalsWithoutSkill.length > 0 || goals.length < 2}
        blockedReason={`أضف مهارة للهدف ${goalsWithoutSkill.map((goal) => GOAL_LABEL[goal.goal_type]).join(" و")}`}
        nextLabel="التالي ← المتطلبات"
      />

      {editor && (
        <SkillEditor
          key={editor.skill?.id ?? `new-${editor.goal.id}`}
          lesson={lesson}
          goal={editor.goal}
          skill={editor.skill}
          usedCodes={skills.map((skill) => skill.code)}
          order={skills.filter((skill) => goalIdOf(skill) === editor.goal.id).length + 1}
          onClose={() => setEditor(null)}
        />
      )}

      <FatinModal
        open={removeTarget !== null}
        title="حذف المهارة؟"
        subtitle={removeTarget?.name}
        onClose={() => setRemoveTarget(null)}
        okText="حذف"
        loading={save.isPending}
        onOk={() =>
          removeTarget &&
          save.mutate(
            { method: "delete", url: API_ENDPOINTS.content.skillDetail(removeTarget.id), success: "تم حذف المهارة" },
            { onSuccess: () => setRemoveTarget(null) },
          )
        }
      >
        <p className="text-sm text-[#4C6A63]">ستُحذف قطعها ومتطلباتها أيضًا.</p>
      </FatinModal>
    </div>
  );
}

type EditorProps = {
  lesson: CLesson;
  goal: CGoal;
  skill?: CSkill;
  usedCodes: string[];
  order: number;
  onClose: () => void;
};

function SkillEditor({ lesson, goal, skill, usedCodes, order, onClose }: EditorProps) {
  const save = useContentSave();
  const letter = goal.goal_type === "conceptual" ? "C" : "O";
  const [form, setForm] = useState({
    code: skill?.code ?? nextCode(`SK-${lesson.code}-${letter}`, usedCodes),
    name: skill?.name ?? "",
    description: skill?.description ?? "",
    difficulty: skill?.difficulty ?? 2,
    threshold: Math.round((skill?.mastery_threshold ?? 0.8) * 100),
    consecutive: skill?.required_consecutive_correct ?? 3,
  });

  const submit = () => {
    const data = {
      code: form.code,
      name: form.name,
      description: form.description,
      difficulty: form.difficulty,
      mastery_threshold: form.threshold / 100,
      required_consecutive_correct: form.consecutive,
      goal: goal.id,
      skill_type: goal.goal_type,
      ...(skill ? {} : { order_index: order }),
    };
    save.mutate(
      skill
        ? { method: "patch", url: API_ENDPOINTS.content.skillDetail(skill.id), data, success: "تم حفظ المهارة" }
        : { method: "post", url: API_ENDPOINTS.skills.skills, data, success: "تمت إضافة المهارة" },
      { onSuccess: onClose },
    );
  };

  return (
    <FatinModal
      open
      title={skill ? "تعديل المهارة" : `مهارة جديدة — هدف ${GOAL_LABEL[goal.goal_type]}`}
      onClose={onClose}
      okText="حفظ المهارة"
      loading={save.isPending}
      onOk={submit}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="رمز المهارة">
          <input className="fatin-field" dir="ltr" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
        </Field>
        <Field label="نوع المهارة">
          <input className="fatin-field opacity-70" readOnly value={`${GOAL_LABEL[goal.goal_type]} (موروث من الهدف)`} />
        </Field>
        <Field label="اسم المهارة" className="sm:col-span-2">
          <input className="fatin-field" value={form.name} placeholder="جمع كسرين مع الاختصار" onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="الوصف" className="sm:col-span-2">
          <textarea className="fatin-field h-16" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <Field label="الصعوبة" className="sm:col-span-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, difficulty: value })}
                className={`h-9 w-9 rounded-full font-bold ${form.difficulty === value ? "bg-[#E0A526] text-white" : "bg-[#E7F2ED]"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </Field>
        <Field label="عتبة الإتقان (٪)">
          <input className="fatin-field" type="number" min={50} max={100} value={form.threshold} onChange={(event) => setForm({ ...form, threshold: Number(event.target.value) })} />
        </Field>
        <Field label="صحيحة متتالية">
          <input className="fatin-field" type="number" min={1} max={10} value={form.consecutive} onChange={(event) => setForm({ ...form, consecutive: Number(event.target.value) })} />
        </Field>
      </div>
    </FatinModal>
  );
}
