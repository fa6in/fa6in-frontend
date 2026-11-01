import { useCallback, useEffect, useState } from "react";
import { useGetStages } from "../../../Services/Curriculum/Stages/useGetStages";
import { useAddStage } from "../../../Services/Curriculum/Stages/useAddStage";
import { useUpdateStage } from "../../../Services/Curriculum/Stages/useUpdateStage";
import { useDeleteStage } from "../../../Services/Curriculum/Stages/useDeleteStage";
import { useGetLevels } from "../../../Services/Curriculum/Levels/useGetLevels";
import { useAddLevel } from "../../../Services/Curriculum/Levels/useAddLevel";
import { useUpdateLevel } from "../../../Services/Curriculum/Levels/useUpdateLevel";
import { useDeleteLevel } from "../../../Services/Curriculum/Levels/useDeleteLevel";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import { useAddMatiere } from "../../../Services/Admin/Matieres/useAddmatiere";
import { useUpdateMatiere } from "../../../Services/Admin/Matieres/useUpdateMatiere";
import { usedeleteMatiere } from "../../../Services/Admin/Matieres/useDeleteMatiere";
import FatinModal from "../../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../../ui/FatinChrome";
import type { Stage } from "../../../Services/Curriculum/Stages/typeStage";
import type { Level } from "../../../Services/Curriculum/Levels/typeLevel";
import { getMatiereLevelId, type typeMatiere } from "../../../Services/Admin/Matieres/typeMatiere";
import { Loading } from "../../Student/fatinStudentUi";
import { normalizeRelationId } from "../../../ui/RelationSelect";
import { Field, Pill } from "../../Teacher/Content/contentUi";

type Kind = "stage" | "level" | "subject";
type Selection =
  | { kind: "stage"; item: Stage }
  | { kind: "level"; item: Level }
  | { kind: "subject"; item: typeMatiere };

const KIND_LABEL: Record<Kind, string> = { stage: "مرحلة", level: "سنة دراسية", subject: "مادة" };
const COLORS = ["#1B7F5C", "#3B82C4", "#E0A526", "#7A5AF8", "#C4564A", "#12302B"];

type Form = { name: string; code: string; description: string; color: string; active: boolean; parent: string };
const EMPTY: Form = { name: "", code: "", description: "", color: COLORS[0], active: true, parent: "" };

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-7 w-7 rounded-full"
          style={{ background: color, outline: value === color ? "3px solid #12302B" : "none", outlineOffset: 2 }}
          aria-label={color}
        />
      ))}
    </div>
  );
}

// Écran A3 du design : arborescence Étape › Année › Matière, avec édition latérale.
export default function FatinCurriculumPage() {
  const { data: stages = [], isLoading: loadingStages } = useGetStages();
  const { data: levels = [] } = useGetLevels();
  const { data: subjects = [] } = useGetMatiere();
  const addStage = useAddStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const addLevel = useAddLevel();
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();
  const addSubject = useAddMatiere();
  const updateSubject = useUpdateMatiere();
  const deleteSubject = usedeleteMatiere();
  const query = useFatinQuery().trim().toLowerCase();

  const [selected, setSelected] = useState<Selection | null>(null);
  const [edit, setEdit] = useState<Form>(EMPTY);
  const [adding, setAdding] = useState<{ kind: Kind; form: Form } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openAdd = useCallback((kind: Kind = "subject", parent = "") => setAdding({ kind, form: { ...EMPTY, parent } }), []);
  const openAddDefault = useCallback(() => openAdd("subject"), [openAdd]);
  useFatinChrome({
    subtitle: `${stages.length} مراحل · ${levels.length} سنوات · ${subjects.length} مواد`,
    actionLabel: "+ إضافة",
    onAction: openAddDefault,
  });

  useEffect(() => {
    if (!selected) return;
    const item = selected.item;
    setEdit({
      name: item.name,
      code: item.code,
      description: item.description || "",
      color: selected.kind === "subject" ? selected.item.color || COLORS[0] : COLORS[0],
      active: selected.kind === "subject" ? selected.item.is_active : true,
      parent: "",
    });
  }, [selected]);

  const saveEdit = () => {
    if (!selected?.item.id) return;
    const id = selected.item.id;
    const base = { name: edit.name.trim(), code: edit.code.trim(), description: edit.description };
    if (selected.kind === "stage") updateStage.mutate({ ...selected.item, ...base, id });
    // L'API renvoie stage/level imbriqués ; on renvoie uniquement l'id au PUT.
    else if (selected.kind === "level")
      updateLevel.mutate({ ...selected.item, ...base, id, stage: normalizeRelationId(selected.item.stage) as number });
    else
      updateSubject.mutate({ ...selected.item, ...base, id, level: normalizeRelationId(selected.item.level) as number, color: edit.color, is_active: edit.active });
  };

  const create = () => {
    if (!adding) return;
    const { kind, form } = adding;
    const done = { onSuccess: () => setAdding(null) };
    const base = { name: form.name.trim(), code: form.code.trim() || form.name.trim(), description: form.description };
    if (kind === "stage") addStage.mutate({ ...base, order_index: stages.length + 1 }, done);
    else if (kind === "level") {
      const siblings = levels.filter((level) => String(normalizeRelationId(level.stage)) === form.parent).length;
      addLevel.mutate({ ...base, stage: Number(form.parent), order_index: siblings + 1 }, done);
    } else addSubject.mutate({ ...base, level: Number(form.parent), icon: "book", color: form.color, is_active: form.active }, done);
  };

  const remove = () => {
    if (!selected?.item.id) return;
    const done = {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelected(null);
      },
    };
    if (selected.kind === "stage") deleteStage.mutate(selected.item.id, done);
    else if (selected.kind === "level") deleteLevel.mutate(selected.item.id, done);
    else deleteSubject.mutate({ id: selected.item.id }, done);
  };

  const isSelected = (kind: Kind, id?: number) => selected?.kind === kind && selected.item.id === id;
  const matches = (text: string) => !query || text.toLowerCase().includes(query);
  const addValid = adding && adding.form.name.trim() && (adding.kind === "stage" || adding.form.parent);
  const saving = updateStage.isPending || updateLevel.isPending || updateSubject.isPending;

  if (loadingStages) return <Loading />;

  return (
    <div className="grid gap-4 px-3 pb-8 sm:px-4 md:px-7 lg:grid-cols-[1fr_300px]" dir="rtl">
      <section className="space-y-3">
        {stages.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="font-extrabold">المنهج فارغ</p>
            <button type="button" onClick={() => openAdd("stage")} className="mt-3 rounded-full bg-[#0F5C47] px-4 py-2 text-sm font-extrabold text-white">
              + أضف مرحلة
            </button>
          </div>
        )}
        {stages.map((stage) => {
          const stageLevels = levels.filter((level) => normalizeRelationId(level.stage) === stage.id);
          return (
            <div key={stage.id} className="rounded-2xl bg-[#E7F2ED] p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelected({ kind: "stage", item: stage })}
                  className={`rounded-lg px-2 py-1 text-start font-extrabold ${isSelected("stage", stage.id) ? "bg-white text-[#0F5C47]" : "text-[#12302B]"}`}
                >
                  {stage.name} <span className="text-xs font-normal text-[#4C6A63]">· {stageLevels.length} سنوات</span>
                </button>
                <button type="button" onClick={() => openAdd("level", String(stage.id))} className="text-xs font-bold text-[#0F5C47]">
                  + سنة
                </button>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {stageLevels.map((level) => {
                  const levelSubjects = subjects.filter((subject) => getMatiereLevelId(subject.level) === level.id && matches(`${subject.name} ${subject.code}`));
                  return (
                    <div key={level.id} className={`rounded-xl bg-white p-3 ${isSelected("level", level.id) ? "ring-2 ring-[#0F5C47]" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <button type="button" onClick={() => setSelected({ kind: "level", item: level })} className="font-bold text-[#12302B]">
                          {level.name}
                        </button>
                        <button type="button" onClick={() => openAdd("subject", String(level.id))} className="text-xs font-bold text-[#0F5C47]">
                          + مادة
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {levelSubjects.length === 0 && <span className="text-xs text-[#8CA39C]">{query ? "لا نتائج" : "لا مواد بعد"}</span>}
                        {levelSubjects.map((subject) => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => setSelected({ kind: "subject", item: subject })}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${isSelected("subject", subject.id) ? "bg-[#0F5C47] text-white" : "bg-[#F3F7F5] text-[#12302B]"} ${subject.is_active ? "" : "opacity-60"}`}
                          >
                            <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: subject.color || COLORS[0] }} />
                            {subject.name}
                            {typeof subject.unit_count === "number" && <span className="text-[11px] opacity-70">({subject.unit_count})</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {stageLevels.length === 0 && <p className="text-xs text-[#4C6A63]">لا سنوات دراسية في هذه المرحلة.</p>}
              </div>
            </div>
          );
        })}
      </section>

      <aside className="fatin-panel h-fit lg:sticky lg:top-28">
        {!selected ? (
          <div className="py-6 text-center text-sm text-[#4C6A63]">
            <p className="font-extrabold text-[#12302B]">اختر عنصرًا لتعديله</p>
            <p className="mt-1">مرحلة، سنة دراسية أو مادة من الشجرة.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#12302B]">تعديل {KIND_LABEL[selected.kind]}</h2>
              <button type="button" onClick={() => setSelected(null)} className="text-lg text-[#4C6A63]" aria-label="إغلاق">×</button>
            </div>
            <Field label="الاسم">
              <input className="fatin-field" value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} />
            </Field>
            <Field label="الرمز">
              <input className="fatin-field" dir="ltr" value={edit.code} onChange={(event) => setEdit({ ...edit, code: event.target.value })} />
            </Field>
            <Field label="الوصف">
              <textarea className="fatin-field h-20" value={edit.description} onChange={(event) => setEdit({ ...edit, description: event.target.value })} />
            </Field>
            {selected.kind === "subject" && (
              <>
                <Field label="اللون">
                  <ColorPicker value={edit.color} onChange={(color) => setEdit({ ...edit, color })} />
                </Field>
                <label className="flex items-center justify-between rounded-xl bg-[#F3F7F5] px-3 py-2 text-sm">
                  <span>{edit.active ? "نشطة — تظهر للطلاب" : "متوقفة — مخفية عن الطلاب"}</span>
                  <input type="checkbox" checked={edit.active} onChange={(event) => setEdit({ ...edit, active: event.target.checked })} className="h-5 w-5 accent-[#0F5C47]" />
                </label>
              </>
            )}
            <button type="button" onClick={saveEdit} disabled={!edit.name.trim() || saving} className="w-full rounded-2xl bg-[#0F5C47] py-3 font-extrabold text-white disabled:opacity-50">
              {saving ? "..." : "حفظ التعديلات"}
            </button>
            <button type="button" onClick={() => setDeleteOpen(true)} className="w-full rounded-2xl border border-[#C4564A] py-2 font-bold text-[#C4564A]">
              حذف
            </button>
          </div>
        )}
      </aside>

      <FatinModal
        open={adding !== null}
        title="إضافة إلى المنهج"
        onClose={() => setAdding(null)}
        okText={`إضافة ${adding ? KIND_LABEL[adding.kind] : ""}`}
        onOk={() => addValid && create()}
        loading={addStage.isPending || addLevel.isPending || addSubject.isPending}
      >
        {adding && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {(Object.keys(KIND_LABEL) as Kind[]).map((kind) => (
                <Pill key={kind} active={adding.kind === kind} onClick={() => setAdding({ kind, form: { ...adding.form, parent: "" } })}>
                  {KIND_LABEL[kind]}
                </Pill>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {adding.kind !== "stage" && (
                <Field label={adding.kind === "level" ? "المرحلة" : "السنة الدراسية"} className="sm:col-span-2">
                  <select className="fatin-field" value={adding.form.parent} onChange={(event) => setAdding({ ...adding, form: { ...adding.form, parent: event.target.value } })}>
                    <option value="">اختر</option>
                    {adding.kind === "level"
                      ? stages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)
                      : levels.map((item) => (
                          <option key={item.id} value={item.id}>
                            {stages.find((stage) => stage.id === normalizeRelationId(item.stage))?.name} › {item.name}
                          </option>
                        ))}
                  </select>
                </Field>
              )}
              <Field label="الاسم">
                <input className="fatin-field" value={adding.form.name} onChange={(event) => setAdding({ ...adding, form: { ...adding.form, name: event.target.value } })} />
              </Field>
              <Field label="الرمز">
                <input className="fatin-field" dir="ltr" placeholder="MATH-1" value={adding.form.code} onChange={(event) => setAdding({ ...adding, form: { ...adding.form, code: event.target.value } })} />
              </Field>
              <Field label="الوصف" className="sm:col-span-2">
                <textarea className="fatin-field h-20" value={adding.form.description} onChange={(event) => setAdding({ ...adding, form: { ...adding.form, description: event.target.value } })} />
              </Field>
              {adding.kind === "subject" && (
                <Field label="اللون" className="sm:col-span-2">
                  <ColorPicker value={adding.form.color} onChange={(color) => setAdding({ ...adding, form: { ...adding.form, color } })} />
                </Field>
              )}
            </div>
            {!addValid && <p className="mt-3 text-xs text-[#8A5A00]">أدخل الاسم{adding.kind !== "stage" ? " واختر العنصر الأب" : ""}.</p>}
          </>
        )}
      </FatinModal>

      <FatinModal
        open={deleteOpen}
        title={`حذف ${selected ? KIND_LABEL[selected.kind] : ""}؟`}
        subtitle={selected?.item.name}
        onClose={() => setDeleteOpen(false)}
        okText="حذف"
        onOk={remove}
        loading={deleteStage.isPending || deleteLevel.isPending || deleteSubject.isPending}
      >
        <p className="text-sm text-[#4C6A63]">
          {selected?.kind === "subject" ? "ستُحذف وحدات هذه المادة ومحتواها." : "سيُحذف كل ما بداخله."} لا يمكن التراجع عن الحذف.
        </p>
      </FatinModal>
    </div>
  );
}
