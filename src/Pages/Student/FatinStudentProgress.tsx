import { useGetMatiere } from "../../Services/Admin/Matieres/useGetMatiere";
import { useFatinChrome } from "../../ui/FatinChrome";

export default function FatinStudentProgress() {
  useFatinChrome({ subtitle: "ملخص أدائك" });
  const { data: subjects } = useGetMatiere();
  const total = subjects?.length ?? 0;
  const active = subjects?.filter((item) => item.is_active).length ?? 0;
  const percent = total ? Math.round((active / total) * 100) : 0;
  const bars = [40, 70, 55, 90, 60, 30, 20];

  return (
    <div className="space-y-3 px-4 pb-6 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:px-7">
      <div className="fatin-panel flex items-center justify-between">
        <div className="text-sm text-[#4C6A63]">
          <div>مواد متاحة: {total}</div>
          <div>نشطة: {active}</div>
        </div>
        <div
          className="grid h-24 w-24 place-items-center rounded-full text-xl font-extrabold text-[#0F5C47]"
          style={{ background: `conic-gradient(#1B7F5C ${percent * 3.6}deg, #E7F2ED 0)` }}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white">{percent}٪</span>
        </div>
      </div>

      <div className="fatin-panel">
        <div className="mb-3 font-extrabold text-[#12302B]">نشاط الأسبوع</div>
        <div className="flex h-28 items-end gap-2">
          {bars.map((height, index) => (
            <div key={index} className="flex-1 rounded-t-lg bg-[#1B7F5C]" style={{ height }} />
          ))}
        </div>
      </div>

      <div className="fatin-panel space-y-3">
        <div className="font-extrabold text-[#12302B]">المواد حسب الحالة</div>
        {[
          { label: "نشطة", value: percent, color: "#1B7F5C" },
          { label: "قيد الانتظار", value: Math.max(0, 100 - percent), color: "#E0A526" },
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-xs text-[#4C6A63]">
              <span>{row.label}</span>
              <span>{row.value}٪</span>
            </div>
            <div className="h-2 rounded-full bg-[#E7F2ED]">
              <div className="h-full rounded-full" style={{ width: `${row.value}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
