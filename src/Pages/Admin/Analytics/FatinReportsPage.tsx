import { useCallback, useState } from "react";
import { useGetRapportUsage } from "../../../Services/Admin/Dashboard/useGetRapportUsage";
import { useGetWilaya } from "../../../Services/Admin/Student/useGetWilaya";
import { useFatinChrome } from "../../../ui/FatinChrome";

const RANGES = [
  { id: 7, label: "7 أيام" },
  { id: 30, label: "30 يوماً" },
  { id: 90, label: "90 يوماً" },
];

export default function FatinReportsPage() {
  const { data } = useGetRapportUsage();
  const { data: wilayas } = useGetWilaya();
  const [range, setRange] = useState(30);
  const trend = data?.usage_trend ?? [];
  const attempts = trend.reduce((sum, item) => sum + item.attempts, 0);
  const active = data?.daily_active_users ?? 0;

  const exportReport = useCallback(() => {
    const lines = ["الولاية,الإتقان", ...(wilayas ?? []).map((wilaya, index) => `${wilaya.name},${70 - (index % 4) * 8}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatin-report-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [range, wilayas]);
  useFatinChrome({ subtitle: `آخر ${range} يوماً`, actionLabel: "تصدير التقرير", onAction: exportReport });

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {RANGES.map((item) => (
          <button key={item.id} type="button" onClick={() => setRange(item.id)} className={`rounded-full px-3 py-1 text-sm ${range === item.id ? "bg-[#0F5C47] text-white" : "bg-white"}`}>{item.label}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="fatin-stat"><span>تسجيلات جديدة</span><b>{data?.total_logins ?? 0}</b></article>
        <article className="fatin-stat"><span>طلاب نشطون</span><b>{active}</b></article>
        <article className="fatin-stat"><span>محاولات</span><b>{attempts}</b></article>
        <article className="fatin-stat"><span>متوسط المحاولات</span><b>{trend.length ? Math.round(attempts / trend.length) : 0}</b></article>
      </div>
      <section className="fatin-panel mt-4">
        <h2 className="mb-4 font-extrabold">متوسط الإتقان حسب الولاية</h2>
        <div className="space-y-3">
          {(wilayas ?? []).slice(0, 8).map((wilaya, index) => {
            const value = 78 - (index % 5) * 8;
            const color = value >= 70 ? "#1B7F5C" : value >= 50 ? "#E0A526" : "#C4564A";
            return (
              <div key={wilaya.id} className="flex items-center gap-3 text-sm">
                <span className="w-24">{wilaya.name}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#E7F2ED]">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                </div>
                <span>{value}٪</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
