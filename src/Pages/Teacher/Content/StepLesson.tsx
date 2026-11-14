import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useContentLessons, useContentSave, useContentUnit } from "../../../Services/Fatin/useTeacherContent";
import { Field, StepFooter, nextCode } from "./contentUi";

type Props = {
  unitId: number;
  lessonId: number | null;
  onSelect: (lessonId: number) => void;
  onNew: () => void;
  onBack: () => void;
};

// Étape 2 : choisir une leçon existante de l'unité ou en créer une (une unité peut en contenir plusieurs).
export default function StepLesson({ unitId, lessonId, onSelect, onNew, onBack }: Props) {
  const { data: unit } = useContentUnit(unitId);
  const { data: lessonsData } = useContentLessons(unitId);
  const lessons = useMemo(() => lessonsData ?? [], [lessonsData]);
  const save = useContentSave();
  const current = lessons.find((lesson) => lesson.id === lessonId);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    programme_ref: "",
    week: "",
    programme_weeks: "",
    book_exercises: "",
  });

  useEffect(() => {
    if (current) {
      setForm({
        code: current.code,
        title: current.title,
        description: current.description ?? "",
        programme_ref: current.programme_ref ?? "",
        week: current.week != null ? String(current.week) : "",
        programme_weeks: (current.programme_weeks ?? []).join("، "),
        book_exercises: (current.book_exercises ?? []).join("، "),
      });
    } else if (unit) {
      setForm({
        code: nextCode(`${unit.code}-L`, lessons.map((lesson) => lesson.code)),
        title: "",
        description: "",
        programme_ref: "",
        week: "",
        programme_weeks: "",
        book_exercises: "",
      });
    }
  }, [current, unit, lessons]);

  const submit = () => {
    const data = {
      code: form.code,
      title: form.title,
      description: form.description,
      programme_ref: form.programme_ref,
      week: form.week.trim() ? Number(form.week) : null,
      programme_weeks: form.programme_weeks.split(/[،,]/).map((item) => item.trim()).filter(Boolean).map(Number),
      book_exercises: form.book_exercises.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
      unit: unitId,
      ...(current ? {} : { order_index: lessons.length + 1 }),
    };
    save.mutate(
      current
        ? { method: "patch", url: API_ENDPOINTS.content.lessonDetail(current.id), data, success: "تم حفظ الدرس" }
        : { method: "post", url: API_ENDPOINTS.curriculum.lessons, data, success: "تم إنشاء الدرس" },
      { onSuccess: (saved: { id: number }) => onSelect(saved.id) },
    );
  };

  return (
    <div>
      {lessons.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-bold text-[#4C6A63]">دروس الوحدة</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelect(lesson.id)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-start text-sm ${lesson.id === lessonId ? "border-[#0F5C47] bg-[#E7F2ED]" : "border-[#E7F2ED] bg-white"}`}
              >
                <span>
                  <b className="me-2 text-[#0F5C47]" dir="ltr">{lesson.code}</b>
                  {lesson.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${lesson.is_published ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
                  {lesson.is_published ? "منشور" : "مسودة"}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={onNew}
              className={`rounded-xl border border-dashed border-[#0F5C47] px-3 py-2 text-sm font-bold text-[#0F5C47] ${current ? "bg-white" : "bg-[#E7F2ED]"}`}
            >
              + درس جديد
            </button>
          </div>
          <p className="mt-3 text-sm font-bold text-[#4C6A63]">{current ? "تعديل الدرس المختار" : "أنشئ درسًا جديدًا في هذه الوحدة"}</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="رمز الدرس">
          <input className="fatin-field" dir="ltr" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
        </Field>
        <Field label="عنوان الدرس">
          <input className="fatin-field" value={form.title} placeholder="جمع الكسور المتشابهة" onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </Field>
        <Field label="الوصف" className="sm:col-span-2">
          <textarea className="fatin-field h-20" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <Field label="مرجع البرنامج">
          <input className="fatin-field" dir="ltr" value={form.programme_ref} placeholder="مثال: P2-U1-L1" onChange={(event) => setForm({ ...form, programme_ref: event.target.value })} />
        </Field>
        <Field label="الأسبوع">
          <input className="fatin-field" type="number" min={1} value={form.week} onChange={(event) => setForm({ ...form, week: event.target.value })} />
        </Field>
        <Field label="أسابيع البرنامج (مفصولة بفواصل)" className="sm:col-span-2">
          <input className="fatin-field" dir="ltr" value={form.programme_weeks} placeholder="1، 2، 3" onChange={(event) => setForm({ ...form, programme_weeks: event.target.value })} />
        </Field>
        <Field label="تمارين الكتاب (مفصولة بفواصل)" className="sm:col-span-2">
          <input className="fatin-field" value={form.book_exercises} placeholder="ص12-ت1، ص13-ت2" onChange={(event) => setForm({ ...form, book_exercises: event.target.value })} />
        </Field>
      </div>
      <StepFooter
        onBack={onBack}
        onNext={submit}
        loading={save.isPending}
        disabled={!form.code.trim() || !form.title.trim()}
        blockedReason="أدخل رمز الدرس وعنوانه."
        nextLabel={current ? "حفظ ← الأهداف" : "إنشاء الدرس ← الأهداف"}
      />
    </div>
  );
}
