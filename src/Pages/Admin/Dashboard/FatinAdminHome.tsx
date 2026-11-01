import { Link } from "react-router-dom";
import { useReportsAttention, useReportsOverview, useReportsUsage } from "../../../Services/Fatin/useAdminReports";
import { attentionLabel, attentionLink } from "../../../ui/attention";
import { useFatinChrome } from "../../../ui/FatinChrome";
import { BarsLegend, DailyBars, Stat, asPercent, masteryColor } from "../../../ui/fatinDashboardUi";
import { Loading } from "../../Student/fatinStudentUi";

// Écran A1 du design : vue d'ensemble de la plateforme.
export default function FatinAdminHome() {
  useFatinChrome({ subtitle: "كل الولايات" });
  const overview = useReportsOverview();
  const usage = useReportsUsage(7);
  const attention = useReportsAttention();

  if (overview.isLoading || usage.isLoading) return <Loading />;

  const o = overview.data;
  const accuracy = o?.total_attempts ? Math.round((o.correct_attempts / o.total_attempts) * 100) : 0;
  const mastery = asPercent(o?.overall_average_mastery);
  const items = attention.data ?? [];

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7">
      {overview.isError && <p className="mb-3 rounded-2xl bg-[#FDECEA] px-4 py-3 text-sm text-[#B3392F]">تعذر تحميل الإحصاءات.</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="المستخدمون" value={(o?.total_users ?? 0).toLocaleString("ar")} hint={`${o?.total_students ?? 0} طالب · ${o?.total_teachers ?? 0} معلم`} />
        <Stat label="الوحدات المنشورة" value={o?.published_units ?? 0} hint={`من ${o?.total_units ?? 0}`} />
        <Stat
          label="المهارات"
          value={o?.total_skills ?? 0}
          tone="#E0A526"
          hint={o?.incomplete_skills ? `${o.incomplete_skills} بقطع ناقصة` : "كلها مكتملة"}
        />
        <Stat label="نسبة الصحة" value={`${accuracy}٪`} tone={masteryColor(accuracy)} hint={`إتقان متوسط ${mastery}٪`} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <section className="fatin-panel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-[#12302B]">النشاط خلال 7 أيام</h2>
            <BarsLegend />
          </div>
          <DailyBars days={usage.data?.daily ?? []} />
          <div className="mt-2 flex flex-wrap gap-4 border-t border-[#E7F2ED] pt-3 text-sm text-[#4C6A63]">
            <span><b className="text-[#12302B]">{usage.data?.active_students ?? 0}</b> طالب نشط</span>
            <span><b className="text-[#12302B]">{usage.data?.new_registrations ?? 0}</b> تسجيل جديد</span>
            <Link to="/analytics" className="ms-auto font-bold text-[#0F5C47]">التقارير ←</Link>
          </div>
        </section>

        <section className="fatin-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-[#12302B]">يحتاج انتباهًا</h2>
            {items.length > 0 && <span className="rounded-full bg-[#FFF4D6] px-2 py-0.5 text-xs font-bold text-[#8A5A00]">{items.length}</span>}
          </div>
          {attention.isLoading && <Loading />}
          {!attention.isLoading && items.length === 0 && <p className="text-sm text-[#4C6A63]">لا توجد عناصر معلّقة. المحتوى جاهز ✓</p>}
          <ul className="max-h-[300px] overflow-auto">
            {items.slice(0, 12).map((item, index) => {
              const label = attentionLabel(item);
              return (
                <li key={`${item.kind}-${item.code}-${index}`} className="flex items-center justify-between gap-3 border-t border-[#DCE8E3] py-3 text-sm first:border-t-0">
                  <span className="min-w-0">
                    <b className="block truncate text-[#12302B]" dir="auto">{label.title}</b>
                    <span className="text-xs text-[#4C6A63]">{label.detail}</span>
                  </span>
                  <Link to={attentionLink(item)} className="shrink-0 rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-bold text-[#8A5A00]">
                    إصلاح
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
