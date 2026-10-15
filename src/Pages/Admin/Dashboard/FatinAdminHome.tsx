import { Link } from "react-router-dom";
import { Spin } from "antd";
import { useGetRapportGlobalAdmin } from "../../../Services/Admin/Dashboard/useGetRapportGlobalAdmin";
import { useGetRapportUsage } from "../../../Services/Admin/Dashboard/useGetRapportUsage";
import { useFatinChrome } from "../../../ui/FatinChrome";

const DAYS = ["ح", "س", "أ", "ث", "ر", "خ", "ج"];

export default function FatinAdminHome() {
  useFatinChrome({ subtitle: "كل الولايات" });
  const { data: global, isPending: pendingGlobal } = useGetRapportGlobalAdmin();
  const { data: usage, isPending: pendingUsage } = useGetRapportUsage();

  if (pendingGlobal || pendingUsage) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spin />
      </div>
    );
  }

  const users = global?.user_analytics?.total_users ?? 0;
  const published = global?.content_analytics?.published_units ?? 0;
  const totalUnits = global?.content_analytics?.total_units ?? 0;
  const success = Number((global?.performance_analytics?.overall_success_rate ?? 0).toFixed(0));
  const trend = (usage?.usage_trend ?? []).slice(-7);
  const max = Math.max(...trend.map((item: { attempts?: number }) => item.attempts ?? 0), 1);
  const attention = global?.performance_analytics?.struggling_students ?? [];

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="fatin-stat">
          <span>المستخدمون</span>
          <b>{users.toLocaleString("ar")}</b>
          <span>طلاب ومعلمون</span>
        </article>
        <article className="fatin-stat">
          <span>الوحدات المنشورة</span>
          <b>{published}</b>
          <span>من {totalUnits}</span>
        </article>
        <article className="fatin-stat">
          <span>المهارات</span>
          <b className="!text-[#E0A526]">{global?.content_analytics?.units_by_difficulty?.reduce((sum, item) => sum + item.count, 0) ?? 0}</b>
          <span>في المنهج</span>
        </article>
        <article className="fatin-stat">
          <span>نسبة الصحة</span>
          <b className="!text-[#1B7F5C]">{success}٪</b>
          <span>من كل المحاولات</span>
        </article>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <section className="fatin-panel">
          <h2 className="mb-4 font-extrabold text-[#12302B]">النشاط خلال 7 أيام</h2>
          <div className="flex h-48 items-end gap-3">
            {(trend.length ? trend : DAYS.map(() => ({ attempts: 0 }))).map((item: { attempts?: number }, index: number) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[#1B7F5C]"
                  style={{ height: `${Math.max(8, ((item.attempts ?? 0) / max) * 160)}px` }}
                />
                <span className="text-xs text-[#4C6A63]">{DAYS[index % DAYS.length]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="fatin-panel">
          <h2 className="mb-3 font-extrabold text-[#12302B]">يحتاج انتباهًا</h2>
          {attention.length === 0 && <p className="text-sm text-[#4C6A63]">لا توجد عناصر معلّقة.</p>}
          {attention.slice(0, 4).map((item, index) => (
            <div key={item.student__username || index} className="flex items-center justify-between gap-3 border-t border-[#DCE8E3] py-3 text-sm">
              <span>{[item.student__first_name, item.student__last_name].filter(Boolean).join(" ") || item.student__username}</span>
              <Link to="/curriculum" className="font-bold text-[#8A5A00]">إصلاح</Link>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
