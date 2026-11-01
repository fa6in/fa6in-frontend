import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useContentChunks, useContentSave, useContentSkills } from "../../../Services/Fatin/useTeacherContent";
import type { CChunk, CSkill, ChunkType } from "../../../Services/Fatin/types";
import FatinModal from "../../../ui/FatinModal";
import { CHUNK_TYPES, Field, Pill, StepFooter, chunkTypeLabel, nextCode } from "./contentUi";

type Props = { lessonId: number; onNext: () => void; onBack: () => void };

const skillIdOf = (chunk: CChunk) => (typeof chunk.skill === "number" ? chunk.skill : chunk.skill.id);

// Minimum de publication par skill : 1 règle, 1 exemple, 2 exercices.
const REQUIRED: { type: ChunkType; label: string; min: number }[] = [
  { type: "rule", label: "قاعدة", min: 1 },
  { type: "example", label: "مثال", min: 1 },
  { type: "practice", label: "تمارين", min: 2 },
];

// Étape 6 (écrans T8 / T8b) : chunks de chaque skill + liste de contrôle.
export default function StepChunks({ lessonId, onNext, onBack }: Props) {
  const { data: skills = [] } = useContentSkills(lessonId);
  const { data: chunks = [] } = useContentChunks(lessonId);
  const save = useContentSave();
  const [skillId, setSkillId] = useState<number | null>(null);
  const [editor, setEditor] = useState<{ chunk?: CChunk } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CChunk | null>(null);

  useEffect(() => {
    if (!skillId && skills.length) setSkillId(skills[0].id);
  }, [skills, skillId]);

  const skill = skills.find((item) => item.id === skillId);
  const own = chunks.filter((chunk) => skillIdOf(chunk) === skillId).sort((a, b) => a.order_index - b.order_index);
  const count = (type: ChunkType) => own.filter((chunk) => chunk.chunk_type === type).length;
  const missing = REQUIRED.find((rule) => count(rule.type) < rule.min);
  const incompleteSkills = skills.filter((item) => !item.chunks_ready);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((item) => (
          <Pill key={item.id} active={item.id === skillId} onClick={() => setSkillId(item.id)}>
            {item.chunks_ready ? "✓ " : "! "}
            {item.name}
          </Pill>
        ))}
      </div>

      {skill && (
        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <section className="rounded-2xl border border-[#E7F2ED] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-extrabold">قطع المحتوى · <span dir="ltr">{skill.code}</span></h3>
              <button type="button" onClick={() => setEditor({})} className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-extrabold text-[#0F5C47]">
                + قطعة
              </button>
            </div>
            {own.length === 0 && <p className="py-4 text-center text-sm text-[#8CA39C]">ابدأ بإضافة قاعدة.</p>}
            <div className="space-y-2">
              {own.map((chunk) => (
                <div key={chunk.id} className="flex items-start justify-between gap-2 rounded-xl bg-[#F3F7F5] px-3 py-2">
                  <div className="min-w-0">
                    <span className="me-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#0F5C47]">{chunkTypeLabel(chunk.chunk_type)}</span>
                    <span className="text-sm" dir="auto">{chunk.title || chunk.content}</span>
                    {chunk.chunk_type === "practice" && (
                      <div className="mt-1 text-xs text-[#4C6A63]" dir="auto">
                        الإجابة: {chunk.correct_answer} {chunk.options?.length ? `· ${chunk.options.join(" ، ")}` : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setEditor({ chunk })} aria-label="تعديل">✎</button>
                    <button type="button" className="text-[#C4564A]" onClick={() => setRemoveTarget(chunk)} aria-label="حذف">⌫</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-2xl bg-[#F3F7F5] p-3">
            <h3 className="mb-2 font-extrabold">قائمة النشر</h3>
            {REQUIRED.map((rule) => {
              const ok = count(rule.type) >= rule.min;
              return (
                <div key={rule.type} className="flex items-center justify-between py-1 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white ${ok ? "bg-[#1B7F5C]" : "bg-[#E0A526]"}`}>{ok ? "✓" : "!"}</span>
                    {rule.label}
                  </span>
                  <b>{Math.min(count(rule.type), rule.min)}/{rule.min}</b>
                </div>
              );
            })}
            {missing && (
              <p className="mt-2 text-xs text-[#8A5A00]">
                أضف {missing.type === "practice" && count("practice") === 1 ? "تمرينًا واحدًا" : chunkTypeLabel(missing.type)} لتفعيل النشر
              </p>
            )}
          </aside>
        </div>
      )}

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        disabled={incompleteSkills.length > 0}
        blockedReason={`مهارات ينقصها محتوى: ${incompleteSkills.map((item) => item.name).join("، ")}`}
        nextLabel="التالي ← النشر"
      />

      {editor && skill && (
        <ChunkEditor
          key={editor.chunk?.id ?? "new"}
          skill={skill}
          chunk={editor.chunk}
          usedCodes={chunks.map((chunk) => chunk.code)}
          order={own.length + 1}
          defaultType={missing?.type ?? "practice"}
          onClose={() => setEditor(null)}
        />
      )}

      <FatinModal
        open={removeTarget !== null}
        title="حذف القطعة؟"
        onClose={() => setRemoveTarget(null)}
        okText="حذف"
        loading={save.isPending}
        onOk={() =>
          removeTarget &&
          save.mutate(
            { method: "delete", url: API_ENDPOINTS.content.chunkDetail(removeTarget.id), success: "تم حذف القطعة" },
            { onSuccess: () => setRemoveTarget(null) },
          )
        }
      >
        <p className="text-sm text-[#4C6A63]">سيُحذف هذا المحتوى نهائيًا.</p>
      </FatinModal>
    </div>
  );
}

type EditorProps = {
  skill: CSkill;
  chunk?: CChunk;
  usedCodes: string[];
  order: number;
  defaultType: ChunkType;
  onClose: () => void;
};

function ChunkEditor({ skill, chunk, usedCodes, order, defaultType, onClose }: EditorProps) {
  const save = useContentSave();
  const [form, setForm] = useState({
    chunk_type: chunk?.chunk_type ?? defaultType,
    title: chunk?.title ?? "",
    content: chunk?.content ?? "",
    correct_answer: chunk?.correct_answer ?? "",
    options: (chunk?.options ?? []).join(" ، "),
    difficulty: chunk?.difficulty ?? 2,
    points: chunk?.points ?? 1,
    time_limit: chunk?.time_limit ?? 60,
  });
  const isPractice = form.chunk_type === "practice";

  const submit = () => {
    const options = form.options.split(/[،,]/).map((item) => item.trim()).filter(Boolean);
    const data = {
      skill: skill.id,
      chunk_type: form.chunk_type,
      title: form.title,
      content: form.content,
      difficulty: form.difficulty,
      points: form.points,
      correct_answer: isPractice ? form.correct_answer : null,
      // La bonne réponse fait toujours partie des choix proposés (QCM).
      options: isPractice && options.length && !options.includes(form.correct_answer.trim())
        ? [...options, form.correct_answer.trim()]
        : isPractice ? options : [],
      time_limit: isPractice ? form.time_limit : null,
      ...(chunk ? {} : { code: nextCode(`${skill.code.replace(/^SK-/, "CH-")}-`, usedCodes), order_index: order }),
    };
    save.mutate(
      chunk
        ? { method: "patch", url: API_ENDPOINTS.content.chunkDetail(chunk.id), data, success: "تم حفظ القطعة" }
        : { method: "post", url: API_ENDPOINTS.skills.chunks, data, success: "تمت إضافة القطعة" },
      { onSuccess: onClose },
    );
  };

  return (
    <FatinModal open wide title={chunk ? "تعديل القطعة" : "قطعة جديدة"} onClose={onClose} okText="حفظ القطعة" loading={save.isPending} onOk={submit}>
      <div className="mb-3 flex flex-wrap gap-2">
        {CHUNK_TYPES.map((type) => (
          <Pill key={type.id} active={form.chunk_type === type.id} onClick={() => setForm({ ...form, chunk_type: type.id })}>
            {type.label}
          </Pill>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="العنوان" className="sm:col-span-2">
          <input className="fatin-field" value={form.title} placeholder={isPractice ? "تمرين جمع 2" : ""} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </Field>
        <Field label="المحتوى" className="sm:col-span-2">
          <textarea className="fatin-field h-24" dir="auto" value={form.content} placeholder={isPractice ? "4/9 + 3/9 = ؟" : ""} onChange={(event) => setForm({ ...form, content: event.target.value })} />
        </Field>
        {isPractice && (
          <>
            <Field label="الإجابة الصحيحة">
              <input className="fatin-field" dir="auto" value={form.correct_answer} placeholder="7/9" onChange={(event) => setForm({ ...form, correct_answer: event.target.value })} />
            </Field>
            <Field label="الخيارات (اختياري)">
              <input className="fatin-field" dir="auto" value={form.options} placeholder="7/18 ، 7/9 ، 1/9 ، 12/9" onChange={(event) => setForm({ ...form, options: event.target.value })} />
            </Field>
          </>
        )}
        <Field label="الصعوبة">
          <select className="fatin-field" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: Number(event.target.value) })}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </Field>
        {isPractice && (
          <>
            <Field label="النقاط">
              <input className="fatin-field" type="number" min={1} value={form.points} onChange={(event) => setForm({ ...form, points: Number(event.target.value) })} />
            </Field>
            <Field label="الحد الزمني (ث)">
              <input className="fatin-field" type="number" min={10} value={form.time_limit} onChange={(event) => setForm({ ...form, time_limit: Number(event.target.value) })} />
            </Field>
          </>
        )}
      </div>
      {isPractice && form.difficulty > 2 && (
        <p className="mt-3 text-xs text-[#8A5A00]">
          تنبيه: يبدأ الطالب بتمارين صعوبتها 1–2، والتمارين الأصعب تظهر بعد ارتفاع الإتقان.
        </p>
      )}
    </FatinModal>
  );
}
