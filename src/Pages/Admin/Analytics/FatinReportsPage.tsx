import { useCallback, useState } from "react";
import { message } from "antd";
import { useReportsByWilaya, useReportsOverview, useReportsUsage } from "../../../Services/Fatin/useAdminReports";
import type { ReportsOverview, ReportsUsage, WilayaMastery } from "../../../Services/Fatin/types";
import { useFatinChrome } from "../../../ui/FatinChrome";
import { BarsLegend, DailyBars, Stat, asPercent, masteryColor } from "../../../ui/fatinDashboardUi";
import { Loading } from "../../Student/fatinStudentUi";
import { Pill } from "../../Teacher/Content/contentUi";

const RANGES = [
  { id: 7, label: "7 أيام" },
  { id: 30, label: "30 يومًا" },
  { id: 90, label: "90 يومًا" },
];

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function buildCsv(range: number, usage?: ReportsUsage, overview?: ReportsOverview, wilayas: WilayaMastery[] = []) {
  const rows: unknown[][] = [
    ["تقرير فَطِن", `آخر ${range} يومًا`, new Date().toISOString().slice(0, 10)],
    [],
    ["المؤشر", "القيمة"],
    ["تسجيلات جديدة", usage?.new_registrations ?? 0],
    ["طلاب نشطون", usage?.active_students ?? 0],
    ["مستخدمون سجلوا الدخول", usage?.active_users_by_login ?? 0],
    ["المحاولات", usage?.total_attempts ?? 0],
    ["المحاولات الصحيحة", usage?.correct_attempts ?? 0],
    ["متوسط المحاولات لكل طالب نشط", usage?.average_attempts_per_active_student ?? 0],
    ["المستخدمون (الإجمالي)", overview?.total_users ?? 0],
    ["الوحدات المنشورة", `${overview?.published_units ?? 0}/${overview?.total_units ?? 0}`],
    ["متوسط الإتقان العام ٪", asPercent(overview?.overall_average_mastery)],
    [],
    ["الولاية", "عدد الطلاب", "متوسط الإتقان ٪"],
    ...wilayas.map((w) => [w.wilaya_name, w.students, w.average_mastery === null ? "" : asPercent(w.average_mastery)]),
    [],
    ["التاريخ", "المحاولات", "الصحيحة"],
    ...(usage?.daily ?? []).map((d) => [d.date, d.attempts, d.correct]),
  ];
  // BOM pour qu'Excel lise correctement l'arabe.
  return "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

// Écran A4 du design : usage sur une période, maîtrise par wilaya, export.
export default function FatinReportsPage() {
  const [range, setRange] = useState(30);
  const usage = useReportsUsage(range);
  const overview = useReportsOverview();
  const byWilaya = useReportsByWilaya();

  const exportReport = useCallback(() => {
    if (!usage.data) {
      message.warning("انتظر تحميل البيانات ثم أعد المحاولة.");
      return;
    }
    const blob = new Blob([buildCsv(range, usage.data, overview.data, byWilaya.data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatin-report-${range}d-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [range, usage.data, overview.data, byWilaya.data]);
  useFatinChrome({ subtitle: `آخر ${range} يومًا`, actionLabel: "تصدير التقرير", onAction: exportReport });

  const u = usage.data;
  const accuracy = u?.total_attempts ? Math.round((u.correct_attempts / u.total_attempts) * 100) : 0;
  const wilayas = [...(byWilaya.data ?? [])].sort(
    (a, b) => (b.average_mastery === null ? -1 : asPercent(b.average_mastery)) - (a.average_mastery === null ? -1 : asPercent(a.average_mastery)),
  );

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {RANGES.map((item) => (
          <Pill key={item.id} active={range === item.id} onClick={() => setRange(item.id)}>
            {item.label}
          </Pill>
        ))}
      </div>

      {usage.isLoading ? (
        <Loading />
      ) : (
        <>
          {usage.isError && <p className="mb-3 rounded-2xl bg-[#FDECEA] px-4 py-3 text-sm text-[#B3392F]">تعذر تحميل تقرير الاستخدام.</p>}
          <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${usage.isFetching ? "opacity-60" : ""}`}>
            <Stat label="تسجيلات جديدة" value={u?.new_registrations ?? 0} />
            <Stat label="طلاب نشطون" value={u?.active_students ?? 0} hint={`${u?.active_users_by_login ?? 0} سجلوا الدخول`} />
            <Stat label="محاولات" value={(u?.total_attempts ?? 0).toLocaleString("ar")} hint={`${accuracy}٪ صحيحة`} />
            <Stat label="متوسط المحاولات" value={Math.round(u?.average_attempts_per_active_student ?? 0)} hint="لكل طالب نشط" />
          </div>

          <section className="fatin-panel mt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-[#12302B]">المحاولات اليومية</h2>
              <BarsLegend />
            </div>
            {(u?.daily ?? []).length ? <DailyBars days={u?.daily ?? []} height={140} /> : <p className="text-sm text-[#4C6A63]">لا نشاط في هذه الفترة.</p>}
          </section>
        </>
      )}

      <section className="fatin-panel mt-4">
        <h2 className="mb-4 font-extrabold text-[#12302B]">متوسط الإتقان حسب الولاية</h2>
        {byWilaya.isLoading && <Loading />}
        {byWilaya.isError && <p className="text-sm text-[#B3392F]">تعذر تحميل بيانات الولايات.</p>}
        {!byWilaya.isLoading && wilayas.length === 0 && <p className="text-sm text-[#4C6A63]">لا توجد بيانات بعد.</p>}
        <div className="space-y-3">
          {wilayas.map((wilaya) => {
            const value = wilaya.average_mastery === null ? null : asPercent(wilaya.average_mastery);
            return (
              <div key={wilaya.wilaya_id} className="grid grid-cols-[minmax(84px,140px)_1fr_auto] items-center gap-3 text-sm">
                <span className="truncate font-bold text-[#12302B]">{wilaya.wilaya_name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-[#E7F2ED]">
                  {value !== null && <div className="h-full rounded-full" style={{ width: `${value}%`, background: masteryColor(value) }} />}
                </div>
                <span className="whitespace-nowrap text-end text-[#4C6A63]">
                  {value === null ? "لا محاولات" : <b className="text-[#12302B]">{value}٪</b>} · {wilaya.students} طالب
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
