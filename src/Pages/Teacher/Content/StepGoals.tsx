import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useContentGoals, useContentSave } from "../../../Services/Fatin/useTeacherContent";
import type { CGoal } from "../../../Services/Fatin/types";
import { Field, GOAL_LABEL, Instruction, StepFooter } from "./contentUi";

type GoalType = CGoal["goal_type"];
type Props = { lessonId: number; onNext: () => void; onBack: () => void };

const PLACEHOLDER: Record<GoalType, string> = {
  conceptual: "مثال: يفهم الطالب معنى جمع الكسور",
  operational: "مثال: يحسب مجموع كسرين متشابهين",
};

// Étape 3 (écran T5) : un goal conceptuel ET un goal opérationnel, obligatoires.
export default function StepGoals({ lessonId, onNext, onBack }: Props) {
  const { data: goals = [] } = useContentGoals(lessonId);
  const byType = (type: GoalType) => goals.find((goal) => goal.goal_type === type);
  const missing = (["conceptual", "operational"] as GoalType[]).filter((type) => !byType(type));

  return (
    <div className="space-y-3">
      <Instruction>اكتب هدفًا مفاهيميًا وهدفًا عمليّاتيًا — الدرس يحتاج الاثنين.</Instruction>
      <div className="grid gap-3 lg:grid-cols-2">
        {(["conceptual", "operational"] as GoalType[]).map((type) => (
          <GoalCard key={type} type={type} goal={byType(type)} lessonId={lessonId} />
        ))}
      </div>
      <StepFooter
        onBack={onBack}
        onNext={onNext}
        disabled={missing.length > 0}
        blockedReason={`التالي معطّل: أضف الهدف ${missing.map((type) => GOAL_LABEL[type]).join(" و")}`}
        nextLabel="التالي ← المهارات"
      />
    </div>
  );
}

function GoalCard({ type, goal, lessonId }: { type: GoalType; goal?: CGoal; lessonId: number }) {
  const save = useContentSave();
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    setForm({ title: goal?.title ?? "", description: goal?.description ?? "" });
  }, [goal]);

  const dirty = form.title !== (goal?.title ?? "") || form.description !== (goal?.description ?? "");

  const submit = () =>
    save.mutate(
      goal
        ? { method: "patch", url: API_ENDPOINTS.content.goalDetail(goal.id), data: form, success: "تم حفظ الهدف" }
        : {
            method: "post",
            url: API_ENDPOINTS.curriculum.goals,
            data: { ...form, lesson: lessonId, goal_type: type, order_index: type === "conceptual" ? 1 : 2 },
            success: "تمت إضافة الهدف",
          },
    );

  return (
    <section className={`rounded-2xl border-2 bg-white p-4 ${goal ? "border-[#CFE0DA]" : "border-dashed border-[#E0A526]"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold text-[#12302B]">هدف {GOAL_LABEL[type]}</h3>
        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${goal ? "bg-[#E3F4EC] text-[#1B7F5C]" : "bg-[#FFF4D6] text-[#8A5A00]"}`}>
          {goal ? "مكتمل ✓" : "مطلوب"}
        </span>
      </div>
      <div className="space-y-3">
        <Field label="العنوان">
          <input className="fatin-field" value={form.title} placeholder={PLACEHOLDER[type]} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </Field>
        <Field label="الوصف">
          <textarea className="fatin-field h-20" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
      </div>
      {(dirty || !goal) && (
        <button
          type="button"
          onClick={submit}
          disabled={!form.title.trim() || save.isPending}
          className="mt-3 rounded-full bg-[#0F5C47] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {save.isPending ? "..." : goal ? "حفظ التعديل" : "إضافة الهدف"}
        </button>
      )}
    </section>
  );
}
