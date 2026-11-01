import { Link } from "react-router-dom";
import { useStudentHome } from "../../Services/Fatin/useStudentLearning";
import { useFatinChrome } from "../../ui/FatinChrome";
import { EmptyNote, Loading, pct } from "./fatinStudentUi";

const FALLBACK_COLORS = ["#1B7F5C", "#3B82C4", "#7A5AF8", "#C4564A"];

// Écran S1 du design : reprendre là où on s'est arrêté, compteurs, matières.
export default function FatinStudentHome() {
  useFatinChrome({ subtitle: "مرحبا بك" });
  const { data, isLoading } = useStudentHome();

  if (isLoading || !data) return <Loading />;
  const { resume, suggestion, stats, subjects } = data;
  const progress = resume ? Math.min(100, (resume.mastery / (resume.mastery_threshold || 1)) * 100) : 0;

  return (
    <div className="px-4 pb-6 lg:px-7">
      {resume ? (
        <div className="fatin-panel">
          <div className="mb-2 flex items-center justify-between text-xs text-[#4C6A63]">
            <span>
              {resume.subject.name} · {resume.lesson.code}
            </span>
            <span className="rounded-full bg-[#E7F2ED] px-2 py-1 font-bold text-[#0F5C47]">تابع من حيث توقفت</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#12302B]">{resume.skill.name}</h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7F2ED]">
            <div className="h-full rounded-full bg-[#1B7F5C]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-[#4C6A63]">
            الإتقان {pct(resume.mastery)}٪ / الهدف {pct(resume.mastery_threshold)}٪
          </p>
          <Link to={`/learn/${resume.skill.id}`} className="fatin-btn mt-4 flex items-center justify-center">
            متابعة التعلّم
          </Link>
        </div>
      ) : (
        <EmptyNote>لا توجد دروس منشورة لسنتك الدراسية بعد.</EmptyNote>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 lg:max-w-3xl">
        <div className="fatin-stat text-center">
          <b>{stats.mastered_skills}</b>
          <span>مهارة متقنة</span>
        </div>
        <div className="fatin-stat text-center">
          <b>{stats.streak_days}</b>
          <span>أيام متتالية</span>
        </div>
        <div className="fatin-stat text-center">
          <b>{stats.attempts_today}</b>
          <span>تمرين اليوم</span>
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-sm font-extrabold text-[#12302B]">موادي</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {subjects.map((subject, index) => (
          <Link
            key={subject.id}
            to={`/matieres?subject=${subject.id}`}
            className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
          >
            <div className="h-16" style={{ background: subject.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }} />
            <div className="px-3 pt-3 text-sm font-extrabold text-[#12302B]">{subject.name}</div>
            <div className="px-3 pb-3 text-xs text-[#4C6A63]">
              {subject.skills_mastered} / {subject.skills_total} مهارة
            </div>
          </Link>
        ))}
        {subjects.length === 0 && <p className="col-span-2 text-sm text-[#4C6A63]">لا توجد مواد منشورة بعد.</p>}
      </div>

      {suggestion && (
        <Link
          to={`/learn/${suggestion.skill.id}`}
          className="mt-4 block rounded-2xl bg-[#FFF4D6] px-4 py-3 text-sm text-[#12302B]"
        >
          <b className="text-[#8A5A00]">مقترح لك: </b>
          راجع «{suggestion.skill.name}» قبل المتابعة
        </Link>
      )}
    </div>
  );
}
