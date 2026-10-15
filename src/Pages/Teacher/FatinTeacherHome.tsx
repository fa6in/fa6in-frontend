import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useGetDashboardTeacher } from "../../Services/Teacher/useGetDashboardTeacher";
import { useGetOverviewDashboardTeacher } from "../../Services/Teacher/useGetOverviewTeacher";
import { studentDisplayName, useGetStudentProgressTeacher } from "../../Services/Teacher/useGetStudentProgressTeacher";
import { useGetUnitsPerformanceTeacher } from "../../Services/Teacher/useGetUnitPerformenceTeacher";
import { useFatinChrome } from "../../ui/FatinChrome";

function barColor(value: number) {
  if (value >= 70) return "#1B7F5C";
  if (value >= 45) return "#E0A526";
  return "#C4564A";
}

export default function FatinTeacherHome() {
  const navigate = useNavigate();
  const openUnit = useCallback(() => navigate("/matieres"), [navigate]);
  useFatinChrome({ subtitle: "نظرة على أداء طلابك", actionLabel: "+ وحدة جديدة", onAction: openUnit });
  const { data: board, isLoading: loadingBoard } = useGetDashboardTeacher();
  const { data: overview, isLoading: loadingOverview } = useGetOverviewDashboardTeacher();
  const { data: progress, isLoading: loadingProgress } = useGetStudentProgressTeacher();
  const { data: units, isLoading: loadingUnits } = useGetUnitsPerformanceTeacher();

  if (loadingBoard || loadingOverview || loadingProgress || loadingUnits) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spin />
      </div>
    );
  }

  const rows = units?.units_performance ?? [];
  const followUp = [...(progress ?? [])]
    .sort((a, b) => a.average_mastery - b.average_mastery)
    .slice(0, 3);

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="fatin-stat">
          <span>الطلاب</span>
          <b>{board?.total_students ?? overview?.quick_stats?.total_students ?? 0}</b>
          <span>في صفوفك</span>
        </article>
        <article className="fatin-stat">
          <span>متوسط الإتقان</span>
          <b>{Math.round(board?.avg_student_progress ?? overview?.quick_stats?.avg_student_progress ?? 0)}٪</b>
          <span>كل المهارات</span>
        </article>
        <article className="fatin-stat">
          <span>وحدات منشأة</span>
          <b>{board?.total_units_created ?? overview?.quick_stats?.total_units ?? 0}</b>
          <span>محتواك</span>
        </article>
        <article className="fatin-stat">
          <span>نشطون هذا الأسبوع</span>
          <b>{board?.active_students ?? 0}</b>
          <span>من {board?.total_students ?? 0}</span>
        </article>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <section className="fatin-panel fatin-table-wrap">
          <h2 className="mb-3 font-extrabold text-[#12302B]">أداء الوحدات</h2>
          <table className="w-full text-sm">
            <thead className="text-[#4C6A63]">
              <tr>
                <th className="py-2 text-start font-semibold">الوحدة</th>
                <th className="py-2 text-start font-semibold">الإتقان</th>
                <th className="py-2 text-start font-semibold">المحاولات</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((unit) => (
                <tr key={unit.unit_id} className="border-t border-[#DCE8E3]">
                  <td className="py-3 font-bold text-[#12302B]">{unit.unit_title}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-[#E7F2ED]">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, unit.average_score || unit.completion_rate)}%`, background: barColor(unit.average_score || unit.completion_rate) }} />
                      </div>
                      <span>{Math.round(unit.average_score || unit.completion_rate)}٪</span>
                    </div>
                  </td>
                  <td className="py-3">{unit.total_attempts}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-[#4C6A63]">لا توجد وحدات بعد.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="fatin-panel">
          <h2 className="mb-3 font-extrabold text-[#12302B]">طلاب يحتاجون متابعة</h2>
          {followUp.map((student) => {
            const name = studentDisplayName(student);
            return (
            <Link key={student.student_id} to="/students" className="mb-2 flex items-center justify-between rounded-2xl bg-[#FDECEC] px-3 py-3">
              <div>
                <div className="font-extrabold text-[#12302B]">{name}</div>
                <div className="text-xs text-[#4C6A63]">إتقان {Math.round(student.average_mastery)}٪</div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F5C47] text-sm font-extrabold text-white">
                {name.slice(0, 1)}
              </span>
            </Link>
            );
          })}
          {followUp.length === 0 && <p className="text-sm text-[#4C6A63]">لا يوجد طلاب بحاجة متابعة.</p>}
        </section>
      </div>
    </div>
  );
}
