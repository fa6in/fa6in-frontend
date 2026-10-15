import { useState } from "react";
import { useGetChapitre } from "../../Services/Admin/Chapitres/useGetChapitres";
import { useGetMatiere } from "../../Services/Admin/Matieres/useGetMatiere";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import { useFatinChrome } from "../../ui/FatinChrome";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "progress", label: "قيد التقدم" },
  { id: "done", label: "مكتملة" },
] as const;

export default function FatinStudentPath() {
  const { data: units = [] } = useGetChapitre();
  const { data: subjects = [] } = useGetMatiere();
  const { data: profile } = useGetProfile();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const subject = subjects[0];
  useFatinChrome({ subtitle: profile?.grade ? `السنة ${profile.grade}` : subject?.level_name || "مسارك" });

  const rows = units.filter((unit) => {
    if (filter === "done") return unit.is_published;
    if (filter === "progress") return !unit.is_published;
    return true;
  });

  return (
    <div>
      <header className="bg-[#0F5C47] px-5 pb-8 pt-8 text-white lg:hidden">
        <p className="text-[13px] text-white/80">{profile?.grade ? `السنة ${profile.grade}` : subject?.level_name || "مسارك"}</p>
        <h1 className="mt-1 text-[26px] font-extrabold sm:text-[28px]">{subject?.name || "موادي"}</h1>
      </header>
      <div className="-mt-4 space-y-3 px-4 pb-6 lg:mt-0 lg:px-7">
        <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-sm ${filter === item.id ? "bg-[#0F5C47] font-extrabold text-white" : "bg-white text-[#4C6A63]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((unit) => (
          <article key={unit.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={`rounded-full px-2 py-1 font-bold ${unit.is_published ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FBF6E8] text-[#8A5A00]"}`}>
                {unit.is_published ? "مكتملة" : "قيد التقدم"}
              </span>
              <span className="font-bold text-[#0F5C47]">{unit.code}</span>
            </div>
            <h2 className="text-base font-extrabold text-[#12302B]">{unit.title}</h2>
            {unit.central_question && <p className="mt-1 text-sm text-[#4C6A63]">{unit.central_question}</p>}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7F2ED]">
              <div className="h-full rounded-full bg-[#1B7F5C]" style={{ width: unit.is_published ? "100%" : "38%" }} />
            </div>
          </article>
        ))}
        {rows.length === 0 &&
          subjects.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <h2 className="font-extrabold text-[#12302B]">{item.name}</h2>
              <p className="mt-1 text-sm text-[#4C6A63]">{item.description || "لا توجد وحدات في هذا العرض بعد."}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
