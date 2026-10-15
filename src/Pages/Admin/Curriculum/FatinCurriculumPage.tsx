import { useCallback, useState } from "react";
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
import { useFatinChrome } from "../../../ui/FatinChrome";
import type { Stage } from "../../../Services/Curriculum/Stages/typeStage";
import type { Level } from "../../../Services/Curriculum/Levels/typeLevel";
import type { typeMatiere } from "../../../Services/Admin/Matieres/typeMatiere";

type Kind = "stage" | "level" | "subject";
type Selection =
  | { kind: "stage"; item: Stage }
  | { kind: "level"; item: Level }
  | { kind: "subject"; item: typeMatiere };

const COLORS = ["#1B7F5C", "#3B82C4", "#E0A526", "#7A5AF8", "#C4564A"];

export default function FatinCurriculumPage() {
  const { data: stages = [] } = useGetStages();
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

  const [selected, setSelected] = useState<Selection | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("subject");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [parent, setParent] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const openAdd = useCallback(() => setAddOpen(true), []);
  useFatinChrome({ subtitle: "المرحلة · السنة · المادة", actionLabel: "+ إضافة", onAction: openAdd });

  const openEdit = (selection: Selection) => {
    setSelected(selection);
    if (selection.kind === "subject") {
      setName(selection.item.name);
      setCode(selection.item.code);
      setColor(selection.item.color || COLORS[0]);
      setDescription(selection.item.description || "");
      setActive(selection.item.is_active);
      setKind("subject");
    } else {
      setName(selection.item.name);
      setCode(selection.item.code);
      setDescription(selection.item.description || "");
      setKind(selection.kind);
    }
  };

  const saveEdit = () => {
    if (!selected?.item.id) return;
    const id = selected.item.id;
    if (selected.kind === "stage") {
      updateStage.mutate({ ...selected.item, id, name, code, description });
    } else if (selected.kind === "level") {
      updateLevel.mutate({ ...selected.item, id, name, code, description });
    } else {
      updateSubject.mutate({ ...selected.item, id, name, code, color, description, is_active: active });
    }
  };

  const createItem = () => {
    if (kind === "stage") {
      addStage.mutate({ name, code: code || name, order_index: stages.length + 1, description }, { onSuccess: () => setAddOpen(false) });
    } else if (kind === "level") {
      addLevel.mutate({ name, code: code || name, stage: Number(parent), order_index: levels.length + 1, description }, { onSuccess: () => setAddOpen(false) });
    } else {
      addSubject.mutate({ name, code: code || name, level: Number(parent), description, icon: "book", color, is_active: active }, { onSuccess: () => setAddOpen(false) });
    }
  };

  const remove = () => {
    if (!selected?.item.id) return;
    const done = () => {
      setDeleteOpen(false);
      setSelected(null);
    };
    if (selected.kind === "stage") deleteStage.mutate(selected.item.id, { onSuccess: done });
    else if (selected.kind === "level") deleteLevel.mutate(selected.item.id, { onSuccess: done });
    else deleteSubject.mutate({ id: selected.item.id }, { onSuccess: done });
  };

  return (
    <div className="grid gap-4 px-3 pb-8 sm:px-4 md:px-7 lg:grid-cols-[280px_1fr]" dir="rtl">
      <aside className="fatin-panel h-fit">
        <h2 className="mb-3 font-extrabold">{selected ? `تعديل: ${name}` : "اختر عنصراً"}</h2>
        <label className="text-sm">الاسم<input className="fatin-field mt-1" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <div className="mt-3 flex gap-2">
          {COLORS.map((item) => (
            <button key={item} type="button" onClick={() => setColor(item)} className="h-6 w-6 rounded-full" style={{ background: item, outline: color === item ? "2px solid #12302B" : "none" }} />
          ))}
        </div>
        <button type="button" onClick={() => setActive((value) => !value)} className="mt-3 rounded-full bg-[#E7F6EE] px-3 py-1 text-xs font-bold text-[#1B7F5C]">
          {active ? "نشطة" : "متوقفة"}
        </button>
        <button type="button" onClick={saveEdit} className="mt-4 w-full rounded-2xl bg-[#0F5C47] py-3 font-extrabold text-white">حفظ التعديلات</button>
        <button type="button" onClick={() => setDeleteOpen(true)} className="mt-2 w-full rounded-2xl border border-[#C4564A] py-2 font-bold text-[#C4564A]">حذف</button>
      </aside>

      <section>
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.id} className="rounded-2xl bg-[#E7F2ED] p-3">
              <button type="button" className="font-extrabold" onClick={() => openEdit({ kind: "stage", item: stage })}>{stage.name}</button>
              <div className="mt-2 space-y-2">
                {levels.filter((level) => level.stage === stage.id).map((level) => (
                  <div key={level.id} className="rounded-xl bg-white p-3">
                    <button type="button" onClick={() => openEdit({ kind: "level", item: level })}>{level.name}</button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subjects.filter((subject) => (typeof subject.level === "number" ? subject.level : subject.level?.id) === level.id).map((subject) => (
                        <button key={subject.id} type="button" onClick={() => openEdit({ kind: "subject", item: subject })} className="rounded-full bg-[#F3F7F5] px-3 py-1 text-sm">
                          {subject.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <FatinModal open={addOpen} title="إضافة إلى المنهج" onClose={() => setAddOpen(false)} okText={kind === "subject" ? "إضافة المادة" : "إضافة"} onOk={createItem} loading={addStage.isPending || addLevel.isPending || addSubject.isPending}>
        <div className="mb-3 flex justify-end gap-2">
          {([["stage", "مرحلة"], ["level", "سنة دراسية"], ["subject", "مادة"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setKind(id)} className={`rounded-full px-3 py-1 text-sm ${kind === id ? "bg-[#0F5C47] text-white" : "bg-[#F3F7F5]"}`}>{label}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {kind !== "stage" && (
            <label className="text-sm">{kind === "level" ? "المرحلة" : "السنة"}
              <select className="fatin-field mt-1" value={parent} onChange={(event) => setParent(event.target.value)}>
                <option value="">اختر</option>
                {(kind === "level" ? stages : levels).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          )}
          <label className="text-sm">الاسم<input className="fatin-field mt-1" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="text-sm">الرمز / الأيقونة<input className="fatin-field mt-1" value={code} onChange={(event) => setCode(event.target.value)} /></label>
        </div>
        <label className="mt-3 block text-sm">الوصف<textarea className="fatin-field mt-1 h-20 py-2" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      </FatinModal>

      <FatinModal open={deleteOpen} title="حذف هذا العنصر؟" onClose={() => setDeleteOpen(false)} okText="حذف" onOk={remove} loading={deleteStage.isPending || deleteLevel.isPending || deleteSubject.isPending}>
        <p className="text-sm text-[#4C6A63]">لا يمكن التراجع عن الحذف.</p>
      </FatinModal>
    </div>
  );
}
