import { useCallback, useState } from "react";
import { useGetChapitre } from "../../Services/Admin/Chapitres/useGetChapitres";
import { useAddChapitre } from "../../Services/Admin/Chapitres/useAddChapitre";
import { useUpdateChapitre } from "../../Services/Admin/Chapitres/useUpdateChapitre";
import { useDeleteChapitre } from "../../Services/Admin/Chapitres/useDeleteChapitre";
import { usePublishChapitre } from "../../Services/Admin/Chapitres/usePublishChapitre";
import { useGetMatiere } from "../../Services/Admin/Matieres/useGetMatiere";
import { useGetSkills } from "../../Services/Skills/useGetSkills";
import { useAddSkill } from "../../Services/Skills/useAddSkill";
import { useUpdateSkill } from "../../Services/Skills/useUpdateSkill";
import { useDeleteSkill } from "../../Services/Skills/useDeleteSkill";
import { useGetChunks } from "../../Services/Skills/useGetChunks";
import { useAddChunk } from "../../Services/Skills/useAddChunk";
import { useDeleteChunk } from "../../Services/Skills/useDeleteChunk";
import { useAddPrerequisite } from "../../Services/Skills/useAddPrerequisite";
import { useGetLessons } from "../../Services/Curriculum/Lessons/useGetLessons";
import { useAddLesson } from "../../Services/Curriculum/Lessons/useAddLesson";
import { useUpdateLesson } from "../../Services/Curriculum/Lessons/useUpdateLesson";
import { useDeleteLesson } from "../../Services/Curriculum/Lessons/useDeleteLesson";
import { usePublishLesson } from "../../Services/Curriculum/Lessons/usePublishLesson";
import { useGetGoals } from "../../Services/Curriculum/Goals/useGetGoals";
import { useAddGoal } from "../../Services/Curriculum/Goals/useAddGoal";
import type { typeChapitre } from "../../Services/Admin/Chapitres/typeChapitre";
import type { Skill } from "../../Services/Skills/typeSkill";
import FatinModal from "../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../ui/FatinChrome";

const STEPS = ["الوحدة", "الدرس", "الأهداف", "المهارات", "المتطلبات", "القطع", "النشر"];

export default function FatinContentPage() {
  const { data: units = [] } = useGetChapitre();
  const { data: subjects = [] } = useGetMatiere();
  const { data: skills = [] } = useGetSkills();
  const { data: chunks = [] } = useGetChunks();
  const addUnit = useAddChapitre();
  const updateUnit = useUpdateChapitre();
  const deleteUnit = useDeleteChapitre();
  const publishUnit = usePublishChapitre();
  const addSkill = useAddSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const addChunk = useAddChunk();
  const deleteChunk = useDeleteChunk();
  const addPrereq = useAddPrerequisite();
  const { data: lessons = [] } = useGetLessons();
  const { data: goals = [] } = useGetGoals();
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const publishLesson = usePublishLesson();
  const addGoal = useAddGoal();

  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const query = useFatinQuery();
  const [wizard, setWizard] = useState<typeChapitre | "new" | null>(null);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ code: "", title: "", subject: "", question: "" });
  const [skillOpen, setSkillOpen] = useState<Skill | "new" | null>(null);
  const [skillForm, setSkillForm] = useState({ code: "", name: "", description: "", difficulty: 3, skill_type: "operational" as "operational" | "conceptual" });
  const [chunkOpen, setChunkOpen] = useState(false);
  const [chunkForm, setChunkForm] = useState({ title: "", content: "", correct_answer: "", options: "", chunk_type: "practice" as "practice" | "rule" | "example" | "error" | "hint" | "real_life" });
  const [prereqOpen, setPrereqOpen] = useState(false);
  const [prereqId, setPrereqId] = useState<number | "">("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ kind: "unit" | "skill" | "chunk" | "lesson"; id: number } | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({ code: "", title: "", content: "" });
  const [goalForm, setGoalForm] = useState({ conceptual: "", operational: "" });

  const rows = units.filter((unit) => {
    const status = filter === "all" || (filter === "published" ? unit.is_published : !unit.is_published);
    return status && `${unit.code} ${unit.title}`.toLowerCase().includes(query.toLowerCase());
  });

  const openNew = useCallback(() => {
    setDraft({ code: "", title: "", subject: "", question: "" });
    setStep(0);
    setWizard("new");
  }, []);
  useFatinChrome({ subtitle: "وحداتك التعليمية", actionLabel: "+ وحدة جديدة", onAction: openNew });

  const openEdit = (unit: typeChapitre) => {
    setDraft({
      code: unit.code || "",
      title: unit.title,
      subject: String(typeof unit.subject === "number" ? unit.subject : unit.subject?.id || ""),
      question: unit.central_question || "",
    });
    setStep(0);
    setUnitId(unit.id ?? null);
    setWizard(unit);
  };

  const saveUnit = () => {
    const payload = {
      code: draft.code,
      title: draft.title,
      subject: Number(draft.subject),
      central_question: draft.question,
      order_index: units.length + 1,
      is_published: false,
    };
    if (wizard && wizard !== "new" && wizard.id) {
      updateUnit.mutate({ ...wizard, ...payload, id: wizard.id }, { onSuccess: () => { setUnitId(wizard.id ?? null); setStep(1); } });
    } else {
      addUnit.mutate(payload, {
        onSuccess: (created) => {
          const createdId = (created as { id?: number } | undefined)?.id ?? null;
          setUnitId(createdId);
          setStep(1);
        },
      });
    }
  };

  const saveLesson = () => {
    if (!unitId) {
      setStep(2);
      return;
    }
    const body = { code: lessonForm.code, title: lessonForm.title, unit: unitId, content: lessonForm.content, is_published: false };
    if (lessonId) {
      updateLesson.mutate({ ...body, id: lessonId }, { onSuccess: () => setStep(2) });
    } else {
      addLesson.mutate(body, {
        onSuccess: (created) => {
          setLessonId((created as { id?: number } | undefined)?.id ?? null);
          setStep(2);
        },
      });
    }
  };

  const saveGoals = () => {
    if (!lessonId) {
      setStep(3);
      return;
    }
    if (goalForm.conceptual) {
      addGoal.mutate({ lesson: lessonId, goal_type: "conceptual", title: goalForm.conceptual, description: goalForm.conceptual, order_index: 1 });
    }
    if (goalForm.operational) {
      addGoal.mutate({ lesson: lessonId, goal_type: "operational", title: goalForm.operational, description: goalForm.operational, order_index: 2 }, { onSuccess: () => setStep(3) });
    } else {
      setStep(3);
    }
  };

  const saveSkill = () => {
    const goal = skills[0]?.goal || 1;
    const body = { ...skillForm, goal, order_index: skills.length + 1, description: skillForm.description };
    if (skillOpen && skillOpen !== "new" && skillOpen.id) {
      updateSkill.mutate({ ...skillOpen, ...body }, { onSuccess: () => setSkillOpen(null) });
    } else {
      addSkill.mutate(body, { onSuccess: () => setSkillOpen(null) });
    }
  };

  const saveChunk = () => {
    const skillId = skills[0]?.id || 1;
    if (chunkForm.chunk_type === "practice") {
      addChunk.mutate({
        code: `CH-${Date.now()}`,
        title: chunkForm.title,
        skill: skillId,
        difficulty: 2,
        content: chunkForm.content,
        points: 1,
        chunk_type: "practice",
        correct_answer: chunkForm.correct_answer,
        options: chunkForm.options.split("،").map((item) => item.trim()).filter(Boolean),
        time_limit: 60,
      }, { onSuccess: () => setChunkOpen(false) });
    } else {
      addChunk.mutate({
        code: `CH-${Date.now()}`,
        title: chunkForm.title,
        skill: skillId,
        difficulty: 2,
        content: chunkForm.content,
        points: 1,
        chunk_type: chunkForm.chunk_type,
      }, { onSuccess: () => setChunkOpen(false) });
    }
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    const close = () => setRemoveTarget(null);
    if (removeTarget.kind === "unit") deleteUnit.mutate({ id: removeTarget.id }, { onSuccess: close });
    else if (removeTarget.kind === "skill") deleteSkill.mutate(removeTarget.id, { onSuccess: close });
    else if (removeTarget.kind === "lesson") deleteLesson.mutate(removeTarget.id, { onSuccess: close });
    else deleteChunk.mutate(removeTarget.id, { onSuccess: close });
  };

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        {([["all", "الكل"], ["published", "منشورة"], ["draft", "مسودة"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 text-sm ${filter === id ? "bg-[#0F5C47] text-white" : "bg-white"}`}>{label}</button>
        ))}
      </div>
      <div className="fatin-table-wrap rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F7F5] text-[#4C6A63]">
            <tr>
              <th className="px-4 py-3 text-start">الرمز</th>
              <th className="px-4 py-3 text-start">العنوان</th>
              <th className="px-4 py-3 text-start">المادة</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((unit) => (
              <tr key={unit.id} className="border-t border-[#E7F2ED]">
                <td className="px-4 py-3">{unit.code}</td>
                <td className="px-4 py-3 font-bold">{unit.title}</td>
                <td className="px-4 py-3">{unit.subject_name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${unit.is_published ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
                    {unit.is_published ? "منشورة" : "مسودة"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(unit)} aria-label="تعديل">✎</button>
                  <button type="button" className="ms-3 text-[#C4564A]" onClick={() => unit.id && setRemoveTarget({ kind: "unit", id: unit.id })} aria-label="حذف">⌫</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FatinModal open={wizard !== null} wide title="وحدة جديدة" onClose={() => setWizard(null)} okText={step === 6 ? "نشر الدرس" : "حفظ — الخطوة التالية"} onOk={() => { if (step === 0) saveUnit(); else if (step === 1) saveLesson(); else if (step === 2) saveGoals(); else if (step === 6) setPublishOpen(true); else setStep((value) => Math.min(6, value + 1)); }} loading={addUnit.isPending || updateUnit.isPending || addLesson.isPending || updateLesson.isPending || addGoal.isPending}>
        <div className="mb-4 flex justify-between gap-1">
          {STEPS.map((label, index) => (
            <button key={label} type="button" onClick={() => setStep(index)} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${index === step ? "bg-[#E0A526] text-white" : index < step ? "bg-[#1B7F5C] text-white" : "bg-[#E7F2ED]"}`}>{index + 1}</button>
          ))}
        </div>
        {step === 0 && (
          <div className="grid gap-3">
            <label className="text-sm">المادة
              <select className="fatin-field mt-1" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>
                <option value="">اختر</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="text-sm">رمز الوحدة<input className="fatin-field mt-1" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /></label>
            <label className="text-sm">عنوان الوحدة<input className="fatin-field mt-1" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <label className="text-sm">السؤال المركزي<textarea className="fatin-field mt-1 h-20 py-2" value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} /></label>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-3">
            <label className="text-sm">رمز الدرس<input className="fatin-field mt-1" value={lessonForm.code} onChange={(event) => setLessonForm({ ...lessonForm, code: event.target.value })} /></label>
            <label className="text-sm">عنوان الدرس<input className="fatin-field mt-1" value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} /></label>
            <label className="text-sm">المحتوى<textarea className="fatin-field mt-1 h-24 py-2" value={lessonForm.content} onChange={(event) => setLessonForm({ ...lessonForm, content: event.target.value })} /></label>
            {lessons.filter((item) => item.unit === unitId).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#E7F2ED] px-3 py-2 text-sm">
                <button type="button" onClick={() => { setLessonId(item.id ?? null); setLessonForm({ code: item.code, title: item.title, content: item.content }); }}>{item.title}</button>
                {item.id && <button type="button" className="text-[#C4564A]" onClick={() => setRemoveTarget({ kind: "lesson", id: item.id! })}>⌫</button>}
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            <label className="text-sm">هدف مفاهيمي<input className="fatin-field mt-1" value={goalForm.conceptual} onChange={(event) => setGoalForm({ ...goalForm, conceptual: event.target.value })} /></label>
            <label className="text-sm">هدف عملياتي<input className="fatin-field mt-1" value={goalForm.operational} onChange={(event) => setGoalForm({ ...goalForm, operational: event.target.value })} /></label>
            {goals.filter((goal) => (typeof goal.lesson === "number" ? goal.lesson : goal.lesson?.id) === lessonId).map((goal) => (
              <p key={goal.id} className="rounded-xl bg-[#F3F7F5] px-3 py-2 text-sm">{goal.goal_type === "conceptual" ? "مفاهيمي" : "عملياتي"} — {goal.title}</p>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            <button type="button" onClick={() => { setSkillForm({ code: "", name: "", description: "", difficulty: 3, skill_type: "operational" }); setSkillOpen("new"); }} className="rounded-full border border-[#0F5C47] px-3 py-1 text-sm font-bold text-[#0F5C47]">+ مهارة</button>
            {skills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-xl border border-[#E7F2ED] px-3 py-2">
                <span>{skill.code} — {skill.name}</span>
                <span>
                  <button type="button" onClick={() => { setSkillForm({ code: skill.code, name: skill.name, description: skill.description, difficulty: skill.difficulty, skill_type: skill.skill_type }); setSkillOpen(skill); }}>✎</button>
                  <button type="button" className="ms-2" onClick={() => setPrereqOpen(true)}>+ متطلب</button>
                  {skill.id && <button type="button" className="ms-2 text-[#C4564A]" onClick={() => setRemoveTarget({ kind: "skill", id: skill.id! })}>⌫</button>}
                </span>
              </div>
            ))}
          </div>
        )}
        {step === 5 && (
          <div className="space-y-2">
            <button type="button" onClick={() => setChunkOpen(true)} className="rounded-full border border-[#0F5C47] px-3 py-1 text-sm font-bold text-[#0F5C47]">+ قطعة</button>
            {chunks.slice(0, 6).map((chunk) => (
              <div key={chunk.id} className="flex items-center justify-between rounded-xl border border-[#E7F2ED] px-3 py-2">
                <span>{chunk.title}</span>
                {chunk.id && <button type="button" className="text-[#C4564A]" onClick={() => setRemoveTarget({ kind: "chunk", id: chunk.id! })}>⌫</button>}
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-2">
            <p className="text-sm text-[#4C6A63]">اختر مهارة ثم أضف متطلباً سابقاً. المهارات التي تكوّن دورة تبقى ممنوعة.</p>
            {skills.slice(0, 8).map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-xl border border-[#E7F2ED] px-3 py-2 text-sm">
                <span>{skill.name}</span>
                <button type="button" className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-bold text-[#0F5C47]" onClick={() => setPrereqOpen(true)}>+ متطلب</button>
              </div>
            ))}
          </div>
        )}
        {step === 6 && (
          <ul className="space-y-2 text-sm text-[#12302B]">
            <li>هدف مفاهيمي وهدف عملياتي</li>
            <li>نوع كل مهارة يطابق هدفها</li>
            <li>لا دورات في المتطلبات</li>
            <li>قطع كافية: قاعدة، مثال، تمرينان</li>
          </ul>
        )}
      </FatinModal>

      <FatinModal open={skillOpen !== null} title="مهارة جديدة" onClose={() => setSkillOpen(null)} okText="حفظ المهارة" onOk={saveSkill} loading={addSkill.isPending || updateSkill.isPending}>
        <div className="grid gap-3">
          <label className="text-sm">الرمز<input className="fatin-field mt-1" value={skillForm.code} onChange={(event) => setSkillForm({ ...skillForm, code: event.target.value })} /></label>
          <label className="text-sm">الاسم<input className="fatin-field mt-1" value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} /></label>
          <label className="text-sm">الوصف<textarea className="fatin-field mt-1 h-20 py-2" value={skillForm.description} onChange={(event) => setSkillForm({ ...skillForm, description: event.target.value })} /></label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setSkillForm({ ...skillForm, difficulty: value })} className={`h-8 w-8 rounded-full ${skillForm.difficulty === value ? "bg-[#E0A526] text-white" : "bg-[#E7F2ED]"}`}>{value}</button>
            ))}
          </div>
        </div>
      </FatinModal>

      <FatinModal open={prereqOpen} title="إضافة متطلب سابق" onClose={() => setPrereqOpen(false)} okText="إضافة المتطلب" onOk={() => { const skill = skills[0]; if (skill?.id && prereqId) addPrereq.mutate({ skill: skill.id, prerequisite: Number(prereqId), strength: 1 }, { onSuccess: () => setPrereqOpen(false) }); }} loading={addPrereq.isPending}>
        <select className="fatin-field" value={prereqId} onChange={(event) => setPrereqId(Number(event.target.value))}>
          <option value="">اختر المهارة</option>
          {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
        </select>
      </FatinModal>

      <FatinModal open={chunkOpen} title="قطعة جديدة" onClose={() => setChunkOpen(false)} okText="حفظ القطعة" onOk={saveChunk} loading={addChunk.isPending}>
        <div className="mb-3 flex flex-wrap gap-2">
          {([
            ["rule", "قاعدة"],
            ["example", "مثال"],
            ["practice", "تمرين"],
            ["error", "خطأ"],
            ["hint", "تلميح"],
            ["real_life", "تطبيق"],
          ] as const).map(([type, label]) => (
            <button key={type} type="button" onClick={() => setChunkForm({ ...chunkForm, chunk_type: type })} className={`rounded-full px-3 py-1 text-sm ${chunkForm.chunk_type === type ? "bg-[#0F5C47] text-white" : "bg-[#F3F7F5]"}`}>{label}</button>
          ))}
        </div>
        <label className="text-sm">العنوان<input className="fatin-field mt-1" value={chunkForm.title} onChange={(event) => setChunkForm({ ...chunkForm, title: event.target.value })} /></label>
        <label className="mt-3 block text-sm">المحتوى<textarea className="fatin-field mt-1 h-20 py-2" value={chunkForm.content} onChange={(event) => setChunkForm({ ...chunkForm, content: event.target.value })} /></label>
        {chunkForm.chunk_type === "practice" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">الإجابة الصحيحة<input className="fatin-field mt-1" value={chunkForm.correct_answer} onChange={(event) => setChunkForm({ ...chunkForm, correct_answer: event.target.value })} /></label>
            <label className="text-sm">الخيارات<input className="fatin-field mt-1" value={chunkForm.options} onChange={(event) => setChunkForm({ ...chunkForm, options: event.target.value })} /></label>
          </div>
        )}
      </FatinModal>

      <FatinModal open={publishOpen} title="جاهز للنشر؟" onClose={() => setPublishOpen(false)} okText="نشر الدرس" onOk={() => { if (lessonId) publishLesson.mutate(lessonId, { onSuccess: () => { setPublishOpen(false); setWizard(null); } }); else if (unitId) publishUnit.mutate({ id: unitId }, { onSuccess: () => { setPublishOpen(false); setWizard(null); } }); }} loading={publishUnit.isPending || publishLesson.isPending}>
        <ul className="space-y-2 text-sm text-[#12302B]">
          <li>هدف مفاهيمي وهدف عملياتي</li>
          <li>نوع كل مهارة يطابق هدفها</li>
          <li>لا دورات في المتطلبات</li>
          <li>قطع كافية: قاعدة، مثال، تمرينان</li>
        </ul>
      </FatinModal>

      <FatinModal open={removeTarget !== null} title="تأكيد الحذف" onClose={() => setRemoveTarget(null)} okText="حذف" onOk={confirmRemove} loading={deleteUnit.isPending || deleteSkill.isPending || deleteChunk.isPending || deleteLesson.isPending}>
        <p className="text-sm text-[#4C6A63]">سيُحذف هذا العنصر نهائياً.</p>
      </FatinModal>
    </div>
  );
}
