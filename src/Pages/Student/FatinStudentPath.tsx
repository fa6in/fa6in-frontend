import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStudentPath } from "../../Services/Fatin/useStudentLearning";
import type { LessonStatus, PathUnit } from "../../Services/Fatin/types";
import { useFatinChrome } from "../../ui/FatinChrome";
import { EmptyNote, Loading } from "./fatinStudentUi";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "progress", label: "قيد التقدم" },
  { id: "done", label: "مكتملة" },
] as const;

const UNIT_CHIP: Record<PathUnit["status"], { label: string; cls: string }> = {
  done: { label: "مكتملة", cls: "bg-[#E7F6EE] text-[#1B7F5C]" },
  in_progress: { label: "قيد التقدم", cls: "bg-[#FFF4D6] text-[#8A5A00]" },
  available: { label: "ابدأ الآن", cls: "bg-[#E7F2ED] text-[#0F5C47]" },
  locked: { label: "مقفلة", cls: "bg-[#EEF3F1] text-[#4C6A63]" },
};

const LESSON_MARK: Record<LessonStatus, { mark: string; cls: string }> = {
  done: { mark: "✓", cls: "bg-[#1B7F5C] text-white" },
  current: { mark: "●", cls: "bg-[#E0A526] text-white" },
  locked: { mark: "○", cls: "bg-[#EEF3F1] text-[#9DB1AA]" },
};

// Écran S2 du design : unités d'une matière, leçons et verrouillage par maîtrise.
export default function FatinStudentPath() {
  const [params, setParams] = useSearchParams();
  const subjectId = Number(params.get("subject")) || undefined;
  const { data, isLoading } = useStudentPath(subjectId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const levelName = data?.subject?.level_name || "مساري";
  useFatinChrome({ subtitle: data?.subject ? `${levelName} · ${data.subject.name}` : levelName });

  if (isLoading || !data) return <Loading />;

  const rows = data.units.filter((unit) => {
    if (filter === "done") return unit.status === "done";
    if (filter === "progress") return unit.status === "in_progress" || unit.status === "available";
    return true;
  });

  return (
    <div>
      <header className="bg-[#0F5C47] px-5 pb-8 pt-8 text-white lg:hidden">
        <p className="text-[13px] text-white/80">{levelName}</p>
        <h1 className="mt-1 text-[26px] font-extrabold sm:text-[28px]">{data.subject?.name || "موادي"}</h1>
      </header>
      <div className="-mt-4 space-y-3 px-4 pb-6 lg:mt-0 lg:px-7">
        {data.subjects.length > 1 && (
          <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2">
            {data.subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => setParams({ subject: String(subject.id) })}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${subject.id === data.subject?.id ? "bg-[#0F5C47] font-extrabold text-white" : "bg-[#F3F7F5] text-[#4C6A63]"}`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
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
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
        {rows.length === 0 && <EmptyNote>لا توجد وحدات في هذا العرض بعد.</EmptyNote>}
      </div>
    </div>
  );
}

function UnitCard({ unit }: { unit: PathUnit }) {
  const chip = UNIT_CHIP[unit.status];
  const locked = unit.status === "locked";

  return (
    <article className={`rounded-2xl bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] ${locked ? "opacity-70" : ""}`}>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-[#0F5C47]">{unit.code}</span>
        <span className={`rounded-full px-2 py-1 font-bold ${chip.cls}`}>{chip.label}</span>
      </div>
      <h2 className="text-base font-extrabold text-[#12302B]">{unit.title}</h2>
      {unit.central_question && <p className="mt-1 text-sm text-[#4C6A63]">{unit.central_question}</p>}

      {locked ? (
        <p className="mt-3 rounded-xl bg-[#F3F7F5] px-3 py-2 text-sm text-[#4C6A63]">
          🔒 تُفتح بعد إتمام {unit.locked_by_unit?.code ?? "الوحدة السابقة"}
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {unit.lessons.map((lesson) => {
              const mark = LESSON_MARK[lesson.status];
              return (
                <li key={lesson.id} className={`flex items-center gap-2 text-sm ${lesson.status === "locked" ? "text-[#9DB1AA]" : "text-[#12302B]"}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${mark.cls}`}>{mark.mark}</span>
                  <span className={lesson.status === "current" ? "font-extrabold" : ""}>
                    {lesson.code.split("-").pop()} · {lesson.title}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7F2ED]">
            <div className="h-full rounded-full bg-[#1B7F5C]" style={{ width: `${Math.round(unit.progress * 100)}%` }} />
          </div>
          <Link to={`/units/${unit.id}`} className="fatin-btn mt-3 flex items-center justify-center">
            خريطة المهارات
          </Link>
        </>
      )}
    </article>
  );
}
