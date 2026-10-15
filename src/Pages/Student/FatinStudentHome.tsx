import { Link } from "react-router-dom";
import { useGetMatiere } from "../../Services/Admin/Matieres/useGetMatiere";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import { useFatinChrome } from "../../ui/FatinChrome";

const FALLBACK_COLORS = ["#1B7F5C", "#3B82C4", "#7A5AF8", "#C4564A"];

export default function FatinStudentHome() {
  useFatinChrome({ subtitle: "مرحبا بك" });
  const { data: subjects } = useGetMatiere();
  const { data: profile } = useGetProfile();
  const list = (subjects ?? []).slice(0, 4);
  const first = list[0];

  return (
    <div className="px-4 pb-6 lg:px-7">
      <div className="fatin-panel">
        <div className="mb-2 flex items-center justify-between text-xs text-[#4C6A63]">
          <span>{profile?.grade ? `السنة ${profile.grade}` : "مسارك"}</span>
          <span className="rounded-full bg-[#E7F2ED] px-2 py-1 font-bold text-[#0F5C47]">
            {first?.code || "تابع من حيث توقفت"}
          </span>
        </div>
        <h2 className="text-lg font-extrabold text-[#12302B]">{first?.name || "ابدأ أول وحدة"}</h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7F2ED]">
          <div className="h-full w-1/3 rounded-full bg-[#1B7F5C]" />
        </div>
        <Link to="/matieres" className="fatin-btn mt-4 flex items-center justify-center">
          متابعة التعلّم
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:max-w-3xl">
        <div className="fatin-stat text-center">
          <b>{list.length}</b>
          <span>مواد</span>
        </div>
        <div className="fatin-stat text-center">
          <b>{list.filter((item) => item.is_active).length}</b>
          <span>نشطة</span>
        </div>
        <div className="fatin-stat text-center">
          <b>{list.reduce((sum, item) => sum + (item.unit_count ?? 0), 0)}</b>
          <span>وحدات</span>
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-sm font-extrabold text-[#12302B]">موادي</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {list.map((subject, index) => (
          <Link
            key={subject.id ?? subject.code}
            to="/matieres"
            className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
          >
            <div className="h-16" style={{ background: subject.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }} />
            <div className="px-3 py-3 text-sm font-extrabold text-[#12302B]">{subject.name}</div>
          </Link>
        ))}
        {list.length === 0 && (
          <p className="col-span-2 text-sm text-[#4C6A63]">لا توجد مواد منشورة بعد.</p>
        )}
      </div>
    </div>
  );
}
