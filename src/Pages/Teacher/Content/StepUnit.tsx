import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import { useContentSave, useContentUnit } from "../../../Services/Fatin/useTeacherContent";
import type { CUnit } from "../../../Services/Fatin/types";
import { Field, StepFooter, nextCode } from "./contentUi";

type Props = {
  unitId: number | null;
  units: CUnit[];
  onSaved: (unitId: number) => void;
  onCancel: () => void;
};

// Étape 1 (écran T3) : informations de l'unité.
export default function StepUnit({ unitId, units, onSaved, onCancel }: Props) {
  const { data: subjects = [] } = useGetMatiere();
  const { data: unit } = useContentUnit(unitId);
  const save = useContentSave();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [form, setForm] = useState({
    subject: "",
    code: nextCode("U", units.map((item) => item.code)),
    title: "",
    description: "",
    main_goal_description: "",
    central_question: "",
    main_skill_domain: "",
    term: "",
    competency_ref: "",
  });

  useEffect(() => {
    if (!unit) return;
    setForm({
      subject: String(typeof unit.subject === "number" ? unit.subject : unit.subject.id),
      code: unit.code,
      title: unit.title,
      description: unit.description ?? "",
      main_goal_description: unit.main_goal_description ?? "",
      central_question: unit.central_question ?? "",
      main_skill_domain: unit.main_skill_domain ?? "",
      term: unit.term ?? "",
      competency_ref: unit.competency_ref ?? "",
    });
  }, [unit]);

  const valid = form.subject && form.code.trim() && form.title.trim();

  const submit = () => {
    const fields: Record<string, string | number> = {
      ...form,
      subject: Number(form.subject),
      ...(unitId ? {} : { order_index: units.filter((item) => String(typeof item.subject === "number" ? item.subject : item.subject.id) === form.subject).length + 1 }),
    };
    let data: FormData | Record<string, string | number> = fields;
    if (thumbnail) {
      const body = new FormData();
      Object.entries(fields).forEach(([key, value]) => body.append(key, String(value)));
      body.append("thumbnail", thumbnail);
      data = body;
    }
    save.mutate(
      unitId
        ? { method: "patch", url: API_ENDPOINTS.content.unitDetail(unitId), data, success: "تم حفظ الوحدة" }
        : { method: "post", url: API_ENDPOINTS.curriculum.units, data, success: "تم إنشاء الوحدة" },
      { onSuccess: (saved: { id: number }) => onSaved(saved.id) },
    );
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="المادة">
          <select className="fatin-field" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })}>
            <option value="">اختر المادة</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} {subject.level_name ? `· ${subject.level_name}` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="رمز الوحدة">
          <input className="fatin-field" dir="ltr" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
        </Field>
        <Field label="عنوان الوحدة" className="sm:col-span-2">
          <input className="fatin-field" value={form.title} placeholder="الأعداد العشرية" onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </Field>
        <Field label="وصف الوحدة" className="sm:col-span-2">
          <textarea className="fatin-field h-20" value={form.description} placeholder="وصف موجز لمحتوى الوحدة" onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <Field label="الهدف الرئيسي" className="sm:col-span-2">
          <textarea className="fatin-field h-20" value={form.main_goal_description} placeholder="ما الذي سيتقنه الطالب في نهاية الوحدة؟" onChange={(event) => setForm({ ...form, main_goal_description: event.target.value })} />
        </Field>
        <Field label="السؤال المركزي" className="sm:col-span-2">
          <textarea className="fatin-field h-20" value={form.central_question} placeholder="السؤال الذي يوجّه التعلّم" onChange={(event) => setForm({ ...form, central_question: event.target.value })} />
        </Field>
        <Field label="مجال المهارة الرئيسي">
          <input className="fatin-field" value={form.main_skill_domain} placeholder="مثال: الهندسة" onChange={(event) => setForm({ ...form, main_skill_domain: event.target.value })} />
        </Field>
        <Field label="الفصل الدراسي">
          <input className="fatin-field" value={form.term} placeholder="مثال: الفصل الأول" onChange={(event) => setForm({ ...form, term: event.target.value })} />
        </Field>
        <Field label="مرجع الكفاءة" className="sm:col-span-2">
          <input className="fatin-field" dir="ltr" value={form.competency_ref} placeholder="مثال: d2-k1" onChange={(event) => setForm({ ...form, competency_ref: event.target.value })} />
        </Field>
        <label className="grid min-h-24 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#CFE0DA] bg-[#F3F7F5] p-4 text-center text-sm text-[#4C6A63] sm:col-span-2">
          <input type="file" accept="image/*" className="hidden" onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)} />
          {thumbnail ? thumbnail.name : unit?.thumbnail ? "تم رفع صورة مصغرة — اضغط لتغييرها" : "اسحب الصورة المصغرة هنا أو اضغط للرفع"}
        </label>
      </div>
      <StepFooter
        onBack={onCancel}
        onNext={submit}
        loading={save.isPending}
        disabled={!valid}
        blockedReason="اختر المادة وأدخل الرمز والعنوان."
        nextLabel="حفظ ← الخطوة التالية: الدرس"
      />
    </div>
  );
}
