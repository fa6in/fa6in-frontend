import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Popover } from "antd";
import { useTeacherStudents } from "../../Services/Fatin/useTeacherContent";
import { useReportsAttention } from "../../Services/Fatin/useAdminReports";
import { useStudentHome } from "../../Services/Fatin/useStudentLearning";
import { attentionLabel, attentionLink } from "../../ui/attention";
import { attentionText, personName } from "../../ui/fatinDashboardUi";

type Item = { key: string; to: string; title: string; detail: string };

function List({ items, empty, close, more }: { items: Item[]; empty: string; close: () => void; more?: ReactNode }) {
  return (
    <div dir="rtl" className="w-[290px] max-w-[80vw]">
      <div className="mb-2 font-extrabold text-[#12302B]">التنبيهات</div>
      {items.length === 0 && <p className="py-3 text-sm text-[#4C6A63]">{empty}</p>}
      <ul className="max-h-[320px] overflow-auto">
        {items.map((item) => (
          <li key={item.key}>
            <Link to={item.to} onClick={close} className="block rounded-xl px-2 py-2 hover:bg-[#F3F7F5]">
              <b className="block text-sm text-[#12302B]" dir="auto">{item.title}</b>
              <span className="text-xs text-[#4C6A63]">{item.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
      {more}
    </div>
  );
}

function Bell({ count, content, open, onOpenChange }: { count: number; content: ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Popover content={content} trigger="click" placement="bottomLeft" open={open} onOpenChange={onOpenChange} arrow={false}>
      <button
        type="button"
        className="relative grid h-11 w-11 place-items-center rounded-full border-0 bg-white text-[#0F5C47] shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
        aria-label={count ? `${count} تنبيهات` : "التنبيهات"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 end-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#C4564A] px-1 text-[10px] font-extrabold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </Popover>
  );
}

function TeacherBell() {
  const [open, setOpen] = useState(false);
  const { data = [] } = useTeacherStudents();
  const rows = data.filter((row) => row.needs_attention);
  const items = rows.slice(0, 8).map((row) => ({
    key: String(row.student_id),
    to: `/students?student=${row.student_id}`,
    title: personName(row),
    detail: attentionText(row),
  }));
  const more = rows.length > items.length && (
    <Link to="/students?tab=follow" onClick={() => setOpen(false)} className="mt-1 block text-center text-xs font-bold text-[#0F5C47]">
      كل الطلاب الذين يحتاجون متابعة ({rows.length})
    </Link>
  );
  return <Bell count={rows.length} open={open} onOpenChange={setOpen} content={<List items={items} empty="لا يوجد طلاب بحاجة متابعة." close={() => setOpen(false)} more={more} />} />;
}

function AdminBell() {
  const [open, setOpen] = useState(false);
  const { data = [] } = useReportsAttention();
  const items = data.slice(0, 8).map((item, index) => {
    const label = attentionLabel(item);
    return { key: `${item.kind}-${item.code}-${index}`, to: attentionLink(item), title: label.title, detail: label.detail };
  });
  return <Bell count={data.length} open={open} onOpenChange={setOpen} content={<List items={items} empty="لا توجد عناصر معلّقة." close={() => setOpen(false)} />} />;
}

function StudentBell() {
  const [open, setOpen] = useState(false);
  const { data } = useStudentHome();
  const items: Item[] = [];
  if (data?.suggestion) {
    items.push({ key: "suggestion", to: `/learn/${data.suggestion.skill.id}`, title: `راجع «${data.suggestion.skill.name}»`, detail: "مقترح لك قبل المتابعة" });
  }
  if (data?.resume) {
    items.push({ key: "resume", to: `/learn/${data.resume.skill.id}`, title: data.resume.skill.name, detail: "تابع من حيث توقفت" });
  }
  return <Bell count={data?.suggestion ? 1 : 0} open={open} onOpenChange={setOpen} content={<List items={items} empty="لا تنبيهات جديدة." close={() => setOpen(false)} />} />;
}

export default function NotificationsBell({ role }: { role?: string }) {
  if (role === "teacher") return <TeacherBell />;
  if (role === "admin") return <AdminBell />;
  if (role === "student") return <StudentBell />;
  return null;
}
