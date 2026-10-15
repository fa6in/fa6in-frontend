import { useMemo, useState } from "react";
import { useGetStudentProgressTeacher, studentDisplayName } from "../../Services/Teacher/useGetStudentProgressTeacher";
import FatinModal from "../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../ui/FatinChrome";

function barColor(value: number) {
  if (value >= 70) return "#1B7F5C";
  if (value >= 45) return "#E0A526";
  return "#C4564A";
}

function formatActive(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar");
}

export default function FatinTeacherStudents() {
  const { data, isError } = useGetStudentProgressTeacher();
  const [tab, setTab] = useState<"all" | "follow">("all");
  const query = useFatinQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [note, setNote] = useState("");
  const students = data ?? [];

  const rows = useMemo(() => {
    return students.filter((student) => {
      const follow = student.average_mastery < 50;
      const matches = tab === "all" || follow;
      const blob = `${studentDisplayName(student)} ${student.username}`.toLowerCase();
      return matches && blob.includes(query.toLowerCase());
    });
  }, [students, tab, query]);

  const selected = students.find((student) => student.student_id === selectedId);
  useFatinChrome({ subtitle: selected ? studentDisplayName(selected) : `${students.length} طالباً` });

  if (selected) {
    const mastery = Math.round(selected.average_mastery);
    return (
      <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-bold text-[#0F5C47]">رجوع</button>
          <h1 className="text-2xl font-extrabold">{studentDisplayName(selected)}</h1>
          <button type="button" onClick={() => setMessageOpen(true)} className="rounded-full border border-[#0F5C47] px-3 py-1 text-sm font-bold text-[#0F5C47]">رسالة للطالب</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="fatin-stat"><span>الإتقان</span><b style={{ color: barColor(mastery) }}>{mastery}٪</b></article>
          <article className="fatin-stat"><span>بدأ</span><b>{selected.skills_started}</b></article>
          <article className="fatin-stat"><span>أتقن</span><b>{selected.skills_mastered}</b></article>
          <article className="fatin-stat"><span>آخر نشاط</span><b className="!text-base">{formatActive(selected.last_active)}</b></article>
        </div>
        <div className="fatin-panel mt-4 text-sm text-[#4C6A63]">
          <p>اسم المستخدم: {selected.username}</p>
        </div>
        <FatinModal open={messageOpen} title="رسالة للطالب" onClose={() => setMessageOpen(false)} okText="إرسال" onOk={() => { setMessageOpen(false); setNote(""); }}>
          <textarea className="fatin-field h-28 py-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="اكتب رسالتك" />
        </FatinModal>
      </div>
    );
  }

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setTab("all")} className={`rounded-full px-3 py-1 text-sm ${tab === "all" ? "bg-[#0F5C47] text-white" : "bg-white"}`}>كل المستويات</button>
        <button type="button" onClick={() => setTab("follow")} className={`rounded-full px-3 py-1 text-sm ${tab === "follow" ? "bg-[#0F5C47] text-white" : "bg-white"}`}>يحتاجون متابعة</button>
      </div>
      <div className="fatin-table-wrap rounded-2xl bg-white">
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
                  {isError ? "تعذر تحميل الطلاب." : "لا يوجد طلاب في هذا العرض."}
                </td>
              </tr>
            )}
            {rows.map((student) => {
              const mastery = Math.round(student.average_mastery);
              const name = studentDisplayName(student);
              return (
                <tr key={student.student_id} className="border-t border-[#E7F2ED]">
                  <td className="px-4 py-3">
                    <b className="block text-[#12302B]">{name}</b>
                    <span className="text-xs text-[#8CA39C]">{student.username}</span>
                  </td>
                  <td className="px-4 py-3">{student.skills_started}</td>
                  <td className="px-4 py-3">{student.skills_mastered}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-[#E7F2ED]">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, mastery)}%`, background: barColor(mastery) }} />
                      </div>
                      <span>{mastery}٪</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatActive(student.last_active)}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelectedId(student.student_id)} className="rounded-full border border-[#0F5C47] px-3 py-1 text-xs font-bold text-[#0F5C47]">التفاصيل</button>
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
