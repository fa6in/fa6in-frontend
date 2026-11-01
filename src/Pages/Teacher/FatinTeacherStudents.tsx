import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudentErrors, useStudentSummary, useTeacherStudents } from "../../Services/Fatin/useTeacherContent";
import type { ErrorCategory, StudentRow } from "../../Services/Fatin/types";
import { useFatinChrome, useFatinQuery } from "../../ui/FatinChrome";
import {
  ERROR_TEXT,
  ERROR_TINT,
  Initial,
  MasteryBar,
  Stat,
  asPercent,
  attentionText,
  formatDate,
  masteryColor,
  personName,
} from "../../ui/fatinDashboardUi";
import { EmptyNote, Loading } from "../Student/fatinStudentUi";
import { Pill } from "./Content/contentUi";

type Tab = "all" | "follow";
type Sort = "name" | "mastery" | "activity";

// Écrans T10 (liste) et T11 (fiche élève) du design.
export default function FatinTeacherStudents() {
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get("student")) || null;
  const tab: Tab = params.get("tab") === "follow" ? "follow" : "all";
  const sort = (params.get("sort") as Sort) || "name";

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
  };

  if (selectedId) return <StudentDetail studentId={selectedId} onBack={() => set({ student: null })} />;
  return <StudentList tab={tab} sort={sort} onTab={(value) => set({ tab: value === "all" ? null : value })} onSort={(value) => set({ sort: value })} onOpen={(id) => set({ student: String(id) })} />;
}

function StudentList({
  tab,
  sort,
  onTab,
  onSort,
  onOpen,
}: {
  tab: Tab;
  sort: Sort;
  onTab: (tab: Tab) => void;
  onSort: (sort: Sort) => void;
  onOpen: (id: number) => void;
}) {
  const { data = [], isLoading, isError } = useTeacherStudents();
  const query = useFatinQuery();
  const followCount = data.filter((row) => row.needs_attention).length;
  useFatinChrome({ subtitle: `${data.length} طالبًا · ${followCount} يحتاجون متابعة` });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.filter(
      (row) =>
        (tab === "all" || row.needs_attention) &&
        (!q || `${personName(row)} ${row.username} ${row.wilaya_name ?? ""}`.toLowerCase().includes(q)),
    );
    const byActivity = (row: StudentRow) => (row.last_active ? new Date(row.last_active).getTime() : 0);
    return filtered.sort((a, b) => {
      if (sort === "mastery") return asPercent(a.average_mastery) - asPercent(b.average_mastery);
      if (sort === "activity") return byActivity(b) - byActivity(a);
      return personName(a).localeCompare(personName(b), "ar");
    });
  }, [data, tab, sort, query]);

  if (isLoading) return <Loading />;

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <select
          className="fatin-field !h-9 !w-auto !rounded-full !bg-white text-sm"
          value={sort}
          onChange={(event) => onSort(event.target.value as Sort)}
          aria-label="ترتيب"
        >
          <option value="name">ترتيب: الاسم</option>
          <option value="mastery">ترتيب: الأضعف إتقانًا</option>
          <option value="activity">ترتيب: آخر نشاط</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <Pill active={tab === "all"} onClick={() => onTab("all")}>كل الطلاب</Pill>
          <Pill active={tab === "follow"} onClick={() => onTab("follow")}>
            يحتاجون متابعة {followCount > 0 && `(${followCount})`}
          </Pill>
        </div>
      </div>

      <div className="fatin-table-wrap rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F7F5] text-[#4C6A63]">
            <tr>
              <th className="px-4 py-3 text-start">الطالب</th>
              <th className="px-4 py-3 text-start">بدأ</th>
              <th className="px-4 py-3 text-start">أتقن</th>
              <th className="px-4 py-3 text-start">الإتقان</th>
              <th className="px-4 py-3 text-start">آخر نشاط</th>
              <th className="px-4 py-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4C6A63]">
                  {isError ? "تعذر تحميل الطلاب." : tab === "follow" ? "لا يوجد طلاب بحاجة متابعة." : "لا يوجد طلاب في هذا العرض."}
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const name = personName(row);
              const reason = row.needs_attention ? attentionText(row) : "";
              return (
                <tr key={row.student_id} className="cursor-pointer border-t border-[#E7F2ED] hover:bg-[#FAFCFB]" onClick={() => onOpen(row.student_id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Initial name={name} tone={row.needs_attention ? "#C4564A" : "#1B7F5C"} />
                      <span className="min-w-0">
                        <b className="block text-[#12302B]">{name}</b>
                        <span className="text-xs text-[#8CA39C]">
                          {row.wilaya_name || row.username}
                        </span>
                        {reason && <span className="block text-xs text-[#B3392F]">{reason}</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.skills_started}</td>
                  <td className="px-4 py-3">{row.skills_mastered}</td>
                  <td className="px-4 py-3"><MasteryBar value={asPercent(row.average_mastery)} width="w-20" /></td>
                  <td className="px-4 py-3">{formatDate(row.last_active)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-bold text-[#0F5C47]">التفاصيل</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SEVERITY: Record<string, { label: string; cls: string }> = {
  high: { label: "مرتفعة", cls: "bg-[#FDECEA] text-[#B3392F]" },
  medium: { label: "متوسطة", cls: "bg-[#FFF4D6] text-[#8A5A00]" },
  low: { label: "منخفضة", cls: "bg-[#E7F2ED] text-[#0F5C47]" },
};

function StudentDetail({ studentId, onBack }: { studentId: number; onBack: () => void }) {
  const { data: list = [] } = useTeacherStudents();
  const { data: summary, isLoading, isError } = useStudentSummary(studentId);
  const { data: errors = [], isLoading: loadingErrors } = useStudentErrors(studentId);
  const row = list.find((item) => item.student_id === studentId);
  const name = summary ? personName(summary) : row ? personName(row) : "";
  useFatinChrome({ subtitle: name });

  if (isLoading) return <Loading />;
  if (isError || !summary) {
    return (
      <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
        <button type="button" onClick={onBack} className="mb-3 text-sm font-bold text-[#0F5C47]">→ طلابي</button>
        <EmptyNote>تعذر تحميل ملف هذا الطالب.</EmptyNote>
      </div>
    );
  }

  const mastery = asPercent(summary.average_mastery);
  const accuracy = summary.attempts ? Math.round((summary.correct_attempts / summary.attempts) * 100) : 0;
  const totalErrors = Object.values(summary.errors_by_category ?? {}).reduce((sum, value) => sum + (value ?? 0), 0);
  const reason = row?.needs_attention ? attentionText(row) : "";

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <button type="button" onClick={onBack} className="mb-3 text-sm font-bold text-[#0F5C47]">→ طلابي</button>

      <section className="fatin-panel mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0F5C47] text-xl font-extrabold text-white">{name.slice(0, 1)}</span>
          <div>
            <h2 className="text-xl font-extrabold text-[#12302B]">{name}</h2>
            <p className="text-sm text-[#4C6A63]">
              {summary.username}
              {summary.wilaya_name ? ` · ${summary.wilaya_name}` : ""} · آخر نشاط {formatDate(summary.last_active)}
            </p>
          </div>
        </div>
        {reason && <span className="rounded-full bg-[#FDECEA] px-3 py-1 text-xs font-bold text-[#B3392F]">⚠ {reason}</span>}
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="متوسط الإتقان" value={`${mastery}٪`} tone={masteryColor(mastery)} />
        <Stat label="المهارات" value={`${summary.skills_mastered} / ${summary.skills_started}`} hint="متقنة / بدأها" />
        <Stat label="نسبة الإجابات الصحيحة" value={`${accuracy}٪`} hint={`${summary.correct_attempts} من ${summary.attempts} محاولة`} />
        <Stat label="أخطاء الإهمال" value={`${asPercent(summary.careless_ratio)}٪`} hint="من كل الأخطاء" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.6fr]">
        <section className="fatin-panel">
          <h3 className="mb-3 font-extrabold text-[#12302B]">الأخطاء حسب النوع</h3>
          {totalErrors === 0 && <p className="text-sm text-[#4C6A63]">لا أخطاء مسجلة.</p>}
          {totalErrors > 0 &&
            (Object.keys(ERROR_TEXT) as ErrorCategory[]).map((category) => {
              const value = summary.errors_by_category?.[category] ?? 0;
              return (
                <div key={category} className="mb-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{ERROR_TEXT[category]}</span>
                    <b>{value}</b>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E7F2ED]">
                    <div className="h-full rounded-full" style={{ width: `${(value / totalErrors) * 100}%`, background: ERROR_TINT[category] }} />
                  </div>
                </div>
              );
            })}
          {totalErrors > 0 && (
            <p className="mt-2 rounded-xl bg-[#FFF4D6] px-3 py-2 text-xs leading-relaxed text-[#8A5A00]">
              {(summary.errors_by_category?.concept ?? 0) >= (summary.errors_by_category?.procedure ?? 0)
                ? "الأخطاء المفاهيمية هي الأكثر: راجع معه القاعدة والأمثلة قبل التمارين."
                : "الأخطاء الإجرائية هي الأكثر: ركّز على خطوات الحل والتمارين الموجّهة."}
            </p>
          )}
        </section>

        <section className="fatin-panel">
          <h3 className="mb-3 font-extrabold text-[#12302B]">تحليل الأخطاء · آخر 90 يومًا</h3>
          {loadingErrors && <Loading />}
          {!loadingErrors && errors.length === 0 && <p className="text-sm text-[#4C6A63]">لا توجد أخطاء متكررة.</p>}
          {errors.length > 0 && (
            <div className="fatin-table-wrap">
              <table className="w-full text-sm">
                <thead className="text-[#4C6A63]">
                  <tr>
                    <th className="py-2 text-start font-semibold">المهارة</th>
                    <th className="py-2 text-start font-semibold">النوع</th>
                    <th className="py-2 text-start font-semibold">السبب المرجّح</th>
                    <th className="py-2 text-start font-semibold">الخطورة</th>
                    <th className="py-2 text-start font-semibold">التكرار</th>
                  </tr>
                </thead>
                <tbody>
                  {[...errors]
                    .sort((a, b) => b.occurrences - a.occurrences)
                    .map((item, index) => {
                      const severity = item.severity_level ? SEVERITY[item.severity_level] : null;
                      return (
                        <tr key={`${item.skill_name}-${item.error_code}-${index}`} className="border-t border-[#E7F2ED]">
                          <td className="py-2.5 font-bold text-[#12302B]">{item.skill_name}</td>
                          <td className="py-2.5">
                            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: ERROR_TINT[item.error_category] }}>
                              {ERROR_TEXT[item.error_category]}
                            </span>
                          </td>
                          <td className="py-2.5 text-[#4C6A63]">{item.root_cause || "—"}</td>
                          <td className="py-2.5">
                            {severity ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${severity.cls}`}>{severity.label}</span> : "—"}
                          </td>
                          <td className="py-2.5 font-bold">{item.occurrences}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
