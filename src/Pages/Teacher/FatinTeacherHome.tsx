import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTeacherOverview, useTeacherStudents, useUnitsPerformance } from "../../Services/Fatin/useTeacherContent";
import { useFatinChrome } from "../../ui/FatinChrome";
import { Initial, MasteryBar, Stat, asPercent, attentionText, masteryColor, personName } from "../../ui/fatinDashboardUi";
import { Loading } from "../Student/fatinStudentUi";

// Écran T1 du design : chiffres clés, performance des unités, élèves à suivre.
export default function FatinTeacherHome() {
  const navigate = useNavigate();
  const openUnit = useCallback(() => navigate("/content?new=1&step=0"), [navigate]);
  useFatinChrome({ subtitle: "نظرة على أداء طلابك", actionLabel: "+ وحدة جديدة", onAction: openUnit });

  const overview = useTeacherOverview();
  const students = useTeacherStudents();
  const units = useUnitsPerformance();

  if (overview.isLoading || students.isLoading || units.isLoading) return <Loading />;

  const o = overview.data;
  const mastery = asPercent(o?.average_mastery);
  const followUp = (students.data ?? [])
    .filter((row) => row.needs_attention)
    .sort((a, b) => asPercent(a.average_mastery) - asPercent(b.average_mastery));
  const unitRows = [...(units.data ?? [])].sort((a, b) => asPercent(a.average_mastery) - asPercent(b.average_mastery));

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7">
      {overview.isError && (
        <p className="mb-3 rounded-2xl bg-[#FDECEA] px-4 py-3 text-sm text-[#B3392F]">تعذر تحميل الإحصاءات.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="الطلاب" value={o?.total_students ?? 0} hint="في صفوفك" />
        <Stat label="نشطون هذا الأسبوع" value={o?.active_students_7d ?? 0} hint={`من ${o?.total_students ?? 0}`} />
        <Stat label="متوسط الإتقان" value={`${mastery}٪`} tone={masteryColor(mastery)} hint="كل المهارات" />
        <Stat label="محاولات 7 أيام" value={(o?.attempts_7d ?? 0).toLocaleString("ar")} hint={`${o?.mastered_skills_total ?? 0} مهارة متقنة`} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <section className="fatin-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-[#12302B]">أداء الوحدات</h2>
            <Link to="/content" className="text-xs font-bold text-[#0F5C47]">محتواي ←</Link>
          </div>
          <div className="fatin-table-wrap">
            <table className="w-full text-sm">
              <thead className="text-[#4C6A63]">
                <tr>
                  <th className="py-2 text-start font-semibold">الوحدة</th>
                  <th className="py-2 text-start font-semibold">الإتقان</th>
                  <th className="py-2 text-start font-semibold">أتقنوا</th>
                  <th className="py-2 text-start font-semibold">المحاولات</th>
                </tr>
              </thead>
              <tbody>
                {unitRows.map((unit) => (
                  <tr key={unit.unit_id} className="border-t border-[#DCE8E3]">
                    <td className="py-3">
                      <span className="me-2 text-xs text-[#8CA39C]" dir="ltr">{unit.unit_code}</span>
                      <b className="text-[#12302B]">{unit.unit_title}</b>
                    </td>
                    <td className="py-3"><MasteryBar value={asPercent(unit.average_mastery)} /></td>
                    <td className="py-3">{unit.students_mastered}</td>
                    <td className="py-3">{unit.attempts_count}</td>
                  </tr>
                ))}
                {unitRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#4C6A63]">
                      لا توجد وحدات منشورة بعد.{" "}
                      <button type="button" onClick={openUnit} className="font-bold text-[#0F5C47]">أنشئ وحدتك الأولى</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="fatin-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-[#12302B]">طلاب يحتاجون متابعة</h2>
            {followUp.length > 0 && (
              <span className="rounded-full bg-[#FDECEA] px-2 py-0.5 text-xs font-bold text-[#B3392F]">{followUp.length}</span>
            )}
          </div>
          {followUp.slice(0, 5).map((row) => {
            const name = personName(row);
            return (
              <Link
                key={row.student_id}
                to={`/students?student=${row.student_id}`}
                className="mb-2 flex items-center justify-between gap-3 rounded-2xl bg-[#FDF3F1] px-3 py-3 transition hover:bg-[#FBE7E3]"
              >
                <div className="min-w-0">
                  <div className="truncate font-extrabold text-[#12302B]">{name}</div>
                  <div className="text-xs text-[#B3392F]">{attentionText(row)}</div>
                  <div className="text-xs text-[#4C6A63]">إتقان {asPercent(row.average_mastery)}٪</div>
                </div>
                <Initial name={name} />
              </Link>
            );
          })}
          {followUp.length > 5 && (
            <Link to="/students?tab=follow" className="block pt-1 text-center text-xs font-bold text-[#0F5C47]">
              عرض الكل ({followUp.length}) ←
            </Link>
          )}
          {followUp.length === 0 && <p className="text-sm text-[#4C6A63]">لا يوجد طلاب بحاجة متابعة حاليًا. 👏</p>}
        </section>
      </div>
    </div>
  );
}
