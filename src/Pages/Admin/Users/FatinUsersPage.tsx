import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../../../Auth-service/axios";
import { API_ENDPOINTS } from "../../../api/endpoints";
import { useGetStudents } from "../../../Services/Admin/Student/useGetStudents";
import { STUDENT_KEY } from "../../../Services/Admin/Student/useGetStudents";
import { useAddStudent } from "../../../Services/Admin/Student/useAddStudent";
import { useGetTeacher } from "../../../Services/Admin/Teacher/useGetTeacher";
import { TEACHER_KEY } from "../../../Services/Admin/Teacher/useGetTeacher";
import { useGetWilaya } from "../../../Services/Admin/Student/useGetWilaya";
import FatinModal from "../../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../../ui/FatinChrome";
import type { Student } from "../../../Services/Admin/Student/typeStudent";
import type { Teacher } from "../../../Services/Admin/Teacher/typeTeacher";
import { isLocalPhone, LOCAL_PHONE_EXAMPLE, LOCAL_PHONE_HINT, normalizeLocalPhone } from "../../../utils/phone";

type RoleFilter = "all" | "student" | "teacher" | "admin";
type Person = {
  id: number;
  kind: "student" | "teacher";
  name: string;
  email: string;
  username: string;
  role: string;
  roleLabel: string;
  wilaya: string;
  wilayaId: number | null;
  phone: string;
  school: string;
  active: boolean;
  initial: string;
};

function passwordHint(password: string) {
  if (password.length < 8) return "8 أحرف على الأقل.";
  if (/^\d+$/.test(password)) return "لا تستخدم أرقاماً فقط.";
  return "";
}

function explainApiError(data: unknown) {
  if (!data || typeof data !== "object") return "تعذر إنشاء الحساب.";
  const lines = Object.values(data).flat().filter((item): item is string => typeof item === "string");
  return lines
    .map((item) => {
      if (item.includes("too common")) return "كلمة المرور شائعة جداً.";
      if (item.includes("entirely numeric")) return "كلمة المرور لا يجب أن تكون أرقاماً فقط.";
      if (item.includes("too short") || item.includes("at least")) return "كلمة المرور قصيرة جداً.";
      if (item.includes("similar")) return "كلمة المرور قريبة من اسم المستخدم أو البريد.";
      return item;
    })
    .join(" ");
}

const ROLES = [
  { id: "student", label: "طالب" },
  { id: "teacher", label: "معلم" },
  { id: "wilaya_admin", label: "مدير ولاية" },
  { id: "admin", label: "مدير" },
] as const;

function fromStudent(student: Student): Person {
  const name = [student.first_name, student.last_name].filter(Boolean).join(" ") || student.username;
  return {
    id: student.id,
    kind: "student",
    name,
    email: student.email,
    username: student.username,
    role: "student",
    roleLabel: "طالب",
    wilaya: student.wilaya_name || "—",
    wilayaId: student.wilaya,
    phone: student.phone_number || "",
    school: student.school || "",
    active: student.is_active,
    initial: name.slice(0, 1),
  };
}

function fromTeacher(teacher: Teacher): Person {
  const user = teacher.user;
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "معلم";
  return {
    id: teacher.id,
    kind: "teacher",
    name,
    email: user?.email || "",
    username: user?.username || "",
    role: "teacher",
    roleLabel: "معلم",
    wilaya: "—",
    wilayaId: null,
    phone: user?.phone_number || "",
    school: user?.school || "",
    active: teacher.is_active ?? user?.is_active ?? true,
    initial: name.slice(0, 1),
  };
}

export default function FatinUsersPage() {
  const { data: students } = useGetStudents();
  const { data: teachers } = useGetTeacher();
  const { data: wilayas } = useGetWilaya();
  const addUser = useAddStudent();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<RoleFilter>("all");
  const query = useFatinQuery();
  const [editor, setEditor] = useState<Person | "new" | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [confirm, setConfirm] = useState<{ person: Person; mode: "delete" | "disable" } | null>(null);
  const [form, setForm] = useState({
    role: "student",
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    wilaya_id: "",
    phone_number: "",
    school: "",
    password: "",
  });

  const people = useMemo(() => {
    const rows = [
      ...(students?.results ?? []).map(fromStudent),
      ...(teachers?.results ?? []).map(fromTeacher),
    ];
    return rows.filter((person) => {
      const matchesTab = tab === "all" || person.role === tab;
      const blob = `${person.name} ${person.email} ${person.username}`.toLowerCase();
      return matchesTab && blob.includes(query.trim().toLowerCase());
    });
  }, [students, teachers, tab, query]);

  const saveEdit = useMutation({
    mutationFn: async () => {
      if (!editor || editor === "new") return;
      const url = editor.kind === "student"
        ? API_ENDPOINTS.auth.adminStudentDetail(editor.id)
        : API_ENDPOINTS.auth.adminTeacherDetail(editor.id);
      await api.patch(url, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        school: form.school,
        wilaya_id: form.wilaya_id ? Number(form.wilaya_id) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
      message.success("تم حفظ التعديل");
      setEditor(null);
    },
    onError: () => message.error("تعذر حفظ التعديل"),
  });

  const removeOrDisable = useMutation({
    mutationFn: async () => {
      if (!confirm) return;
      const url = confirm.person.kind === "student"
        ? API_ENDPOINTS.auth.adminStudentDetail(confirm.person.id)
        : API_ENDPOINTS.auth.adminTeacherDetail(confirm.person.id);
      if (confirm.mode === "delete") await api.delete(url);
      else await api.patch(url, { is_active: !confirm.person.active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
      message.success(confirm?.mode === "delete" ? "تم الحذف" : "تم تحديث الحالة");
      setConfirm(null);
    },
    onError: () => message.error("تعذر تنفيذ العملية"),
  });

  const openNew = useCallback(() => {
    setForm({ role: "student", first_name: "", last_name: "", email: "", username: "", wilaya_id: "", phone_number: "", school: "", password: "" });
    setEditor("new");
  }, []);
  useFatinChrome({ subtitle: `${people.length} مستخدماً`, actionLabel: "+ مستخدم جديد", onAction: openNew });

  const openEdit = (person: Person) => {
    const [first_name, ...rest] = person.name.split(" ");
    setForm({
      role: person.role,
      first_name: first_name || "",
      last_name: rest.join(" "),
      email: person.email,
      username: person.username,
      wilaya_id: person.wilayaId ? String(person.wilayaId) : "",
      phone_number: person.phone,
      school: person.school,
      password: "",
    });
    setEditor(person);
  };

  const submit = () => {
    if (!isLocalPhone(form.phone_number)) {
      setPhoneError(LOCAL_PHONE_HINT);
      return;
    }
    setPhoneError("");
    if (editor === "new") {
      const hint = passwordHint(form.password);
      if (hint) {
        setPasswordError(hint);
        return;
      }
      setPasswordError("");
      addUser.mutate(
        {
          username: form.username,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
          password: form.password,
          password_confirm: form.password,
          phone_number: form.phone_number,
          school: form.school,
          wilaya_id: Number(form.wilaya_id) || 0,
        },
        {
          onSuccess: () => setEditor(null),
          onError: (error) => {
            const data = (error as { response?: { data?: unknown } })?.response?.data;
            setPasswordError(explainApiError(data));
          },
        }
      );
      return;
    }
    saveEdit.mutate();
  };

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        {[
          ["all", "الكل"],
          ["student", "طلاب"],
          ["teacher", "معلمون"],
          ["admin", "مديرو الولايات"],
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id as RoleFilter)} className={`rounded-full px-3 py-1 text-sm ${tab === id ? "bg-[#0F5C47] font-extrabold text-white" : "bg-white text-[#4C6A63]"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="fatin-table-wrap rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead className="bg-[#F3F7F5] text-[#4C6A63]">
            <tr>
              <th className="px-4 py-3 text-start">المستخدم</th>
              <th className="px-4 py-3 text-start">الدور</th>
              <th className="px-4 py-3 text-start">الولاية</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={`${person.kind}-${person.id}`} className="border-t border-[#E7F2ED]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1B7F5C] font-extrabold text-white">{person.initial}</span>
                    <span>
                      <b className="block text-[#12302B]">{person.name}</b>
                      <span className="text-xs text-[#8CA39C]">{person.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{person.roleLabel}</td>
                <td className="px-4 py-3">{person.wilaya}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${person.active ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FDECEC] text-[#C4564A]"}`}>
                    {person.active ? "نشط" : "معطّل"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="px-2" onClick={() => openEdit(person)} aria-label="تعديل">✎</button>
                  <button type="button" className="px-2" onClick={() => setConfirm({ person, mode: "disable" })} aria-label="تعطيل">⌂</button>
                  <button type="button" className="px-2 text-[#C4564A]" onClick={() => setConfirm({ person, mode: "delete" })} aria-label="حذف">⌫</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FatinModal
        open={editor !== null}
        title={editor === "new" ? "مستخدم جديد" : "تعديل المستخدم"}
        onClose={() => setEditor(null)}
        okText={editor === "new" ? "إنشاء الحساب" : "حفظ التعديل"}
        loading={addUser.isPending || saveEdit.isPending}
        onOk={submit}
      >
        {editor === "new" && (
          <div className="mb-4 flex flex-wrap justify-end gap-2">
            {ROLES.map((role) => (
              <button key={role.id} type="button" onClick={() => setForm({ ...form, role: role.id })} className={`rounded-full px-3 py-1 text-sm ${form.role === role.id ? "bg-[#0F5C47] text-white" : "bg-[#F3F7F5] text-[#4C6A63]"}`}>
                {role.label}
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">الاسم الأول<input className="fatin-field mt-1" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></label>
          <label className="text-sm">اسم العائلة<input className="fatin-field mt-1" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></label>
          <label className="text-sm">اسم المستخدم<input className="fatin-field mt-1" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          <label className="text-sm">البريد<input className="fatin-field mt-1" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="text-sm">الولاية
            <select className="fatin-field mt-1" value={form.wilaya_id} onChange={(event) => setForm({ ...form, wilaya_id: event.target.value })}>
              <option value="">اختر</option>
              {(wilayas ?? []).map((wilaya) => <option key={wilaya.id} value={wilaya.id}>{wilaya.name}</option>)}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">الهاتف
            <input className="fatin-field mt-1" inputMode="numeric" maxLength={8} placeholder={LOCAL_PHONE_EXAMPLE} value={form.phone_number} onChange={(event) => { setPhoneError(""); setForm({ ...form, phone_number: normalizeLocalPhone(event.target.value) }); }} />
            <span className={`mt-1 block text-xs ${phoneError ? "text-[#C4564A]" : "text-[#8CA39C]"}`}>{phoneError || LOCAL_PHONE_HINT}</span>
          </label>
          <label className="text-sm">المدرسة<input className="fatin-field mt-1" value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })} /></label>
          {editor === "new" && (
            <label className="text-sm sm:col-span-2">كلمة المرور المؤقتة
              <input className="fatin-field mt-1" type="password" value={form.password} onChange={(event) => { setPasswordError(""); setForm({ ...form, password: event.target.value }); }} />
              <span className={`mt-1 block text-xs ${passwordError ? "text-[#C4564A]" : "text-[#8CA39C]"}`}>
                {passwordError || "8 أحرف على الأقل، وليست أرقاماً فقط ولا كلمة شائعة مثل 12345678."}
              </span>
            </label>
          )}
        </div>
      </FatinModal>

      <FatinModal
        open={confirm !== null}
        title={confirm?.mode === "delete" ? "حذف المستخدم؟" : "تغيير حالة الحساب؟"}
        subtitle={confirm?.person.name}
        onClose={() => setConfirm(null)}
        okText={confirm?.mode === "delete" ? "حذف" : confirm?.person.active ? "تعطيل" : "تنشيط"}
        loading={removeOrDisable.isPending}
        onOk={() => removeOrDisable.mutate()}
      >
        <p className="text-sm text-[#4C6A63]">
          {confirm?.mode === "delete" ? "سيُحذف هذا الحساب نهائياً." : "يمكنك إعادة تنشيط الحساب لاحقاً."}
        </p>
      </FatinModal>
    </div>
  );
}
