import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserSave, useUsers, type UsersFilters } from "../../../Services/Fatin/useAdminReports";
import type { AppUser, UserRole } from "../../../Services/Fatin/types";
import { useGetWilaya } from "../../../Services/Admin/Student/useGetWilaya";
import { apiErrorText } from "../../../Services/Fatin/apiErrorText";
import FatinModal from "../../../ui/FatinModal";
import { useFatinChrome, useFatinQuery } from "../../../ui/FatinChrome";
import { Initial, personName } from "../../../ui/fatinDashboardUi";
import { Loading } from "../../Student/fatinStudentUi";
import { Field, Pill } from "../../Teacher/Content/contentUi";
import { isLocalPhone, LOCAL_PHONE_EXAMPLE, LOCAL_PHONE_HINT, normalizeLocalPhone } from "../../../utils/phone";

const ROLE_LABEL: Record<UserRole, string> = {
  student: "طالب",
  teacher: "معلم",
  regional_admin: "مدير ولاية",
  admin: "مدير",
};

const ROLE_TONE: Record<UserRole, string> = {
  student: "#1B7F5C",
  teacher: "#3B82C4",
  regional_admin: "#E0A526",
  admin: "#0F5C47",
};

const TABS: { id: UserRole | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "student", label: "طلاب" },
  { id: "teacher", label: "معلمون" },
  { id: "regional_admin", label: "مديرو الولايات" },
  { id: "admin", label: "المديرون" },
];

const EMPTY_FORM = {
  role: "student" as UserRole,
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  wilaya: "",
  phone_number: "",
  school: "",
  grade: "",
  password: "",
};

function passwordHint(password: string) {
  if (password.length < 8) return "8 أحرف على الأقل.";
  if (/^\d+$/.test(password)) return "لا تستخدم أرقامًا فقط.";
  return "";
}

/** Recherche différée pour ne pas interroger l'API à chaque frappe. */
function useDebounced<T>(value: T, delay = 350) {
  const [current, setCurrent] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrent(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return current;
}

// Écran A2 du design : gestion des comptes (filtres rôle / wilaya, création, édition, activation).
export default function FatinUsersPage() {
  const query = useFatinQuery();
  const search = useDebounced(query.trim());
  const [role, setRole] = useState<UserRole | "all">("all");
  const [wilaya, setWilaya] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const filters: UsersFilters = {
    ...(role !== "all" ? { role } : {}),
    ...(wilaya ? { wilaya } : {}),
    ...(search ? { search } : {}),
    page,
  };
  const { data, isLoading, isError, isFetching } = useUsers(filters);
  const { data: wilayas = [] } = useGetWilaya();
  const save = useUserSave();

  const [editor, setEditor] = useState<AppUser | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<{ user: AppUser; mode: "delete" | "toggle" } | null>(null);

  useEffect(() => setPage(1), [role, wilaya, search]);

  const openNew = useCallback(() => {
    setForm({ ...EMPTY_FORM, role: role === "all" ? "student" : role });
    setErrors({});
    setEditor("new");
  }, [role]);
  useFatinChrome({ subtitle: `${data?.count ?? 0} مستخدمًا`, actionLabel: "+ مستخدم جديد", onAction: openNew });

  const openEdit = (user: AppUser) => {
    setForm({
      ...EMPTY_FORM,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      wilaya: user.wilaya ? String(user.wilaya) : "",
      phone_number: user.phone_number ?? "",
      school: user.school ?? "",
    });
    setErrors({});
    setEditor(user);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = "مطلوب";
    if (!form.username.trim()) next.username = "مطلوب";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "بريد غير صالح";
    if (form.phone_number && !isLocalPhone(form.phone_number)) next.phone_number = LOCAL_PHONE_HINT;
    if (form.role === "regional_admin" && !form.wilaya) next.wilaya = "اختر ولاية مدير الولاية";
    if (editor === "new") {
      const hint = passwordHint(form.password);
      if (hint) next.password = hint;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const wilayaId = form.wilaya ? Number(form.wilaya) : null;
    const body: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number,
      school: form.school.trim(),
      role: form.role,
      wilaya: wilayaId,
      wilaya_id: wilayaId,
    };
    if (editor === "new") {
      body.username = form.username.trim();
      body.password = form.password;
      body.password_confirm = form.password;
      if (form.role === "student" && form.grade) body.grade = Number(form.grade);
      save.mutate({ method: "post", data: body, success: "تم إنشاء الحساب" }, {
        onSuccess: () => setEditor(null),
        onError: (error) => setErrors({ form: apiErrorText(error) }),
      });
    } else if (editor) {
      save.mutate({ method: "patch", id: editor.id, data: body, success: "تم حفظ التعديل" }, {
        onSuccess: () => setEditor(null),
        onError: (error) => setErrors({ form: apiErrorText(error) }),
      });
    }
  };

  const runConfirm = () => {
    if (!confirm) return;
    const { user, mode } = confirm;
    save.mutate(
      mode === "delete"
        ? { method: "delete", id: user.id, success: "تم حذف الحساب" }
        : { method: "patch", id: user.id, data: { is_active: !user.is_active }, success: user.is_active ? "تم تعطيل الحساب" : "تم تنشيط الحساب" },
      { onSuccess: () => setConfirm(null) },
    );
  };

  const rows = data?.results ?? [];
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / 20));
  const set = (key: keyof typeof EMPTY_FORM, value: string) => {
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-7" dir="rtl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="fatin-field !h-9 !w-auto !rounded-full !bg-white text-sm"
            value={wilaya}
            onChange={(event) => setWilaya(event.target.value ? Number(event.target.value) : "")}
            aria-label="الولاية"
          >
            <option value="">كل الولايات</option>
            {wilayas.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <Link to="/wilayas" className="text-xs font-bold text-[#0F5C47]">إدارة الولايات</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Pill key={tab.id} active={role === tab.id} onClick={() => setRole(tab.id)}>
              {tab.label}
            </Pill>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className={`fatin-table-wrap rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)] ${isFetching ? "opacity-70" : ""}`}>
          <table className="w-full text-sm">
            <thead className="bg-[#F3F7F5] text-[#4C6A63]">
              <tr>
                <th className="px-4 py-3 text-start">المستخدم</th>
                <th className="px-4 py-3 text-start">الدور</th>
                <th className="px-4 py-3 text-start">الولاية</th>
                <th className="px-4 py-3 text-start">المدرسة</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4C6A63]">
                    {isError ? "تعذر تحميل المستخدمين." : "لا يوجد مستخدمون مطابقون."}
                  </td>
                </tr>
              )}
              {rows.map((user) => {
                const name = personName(user);
                return (
                  <tr key={user.id} className="border-t border-[#E7F2ED]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Initial name={name} tone={ROLE_TONE[user.role] ?? "#1B7F5C"} />
                        <span className="min-w-0">
                          <b className="block text-[#12302B]">{name}</b>
                          <span className="text-xs text-[#8CA39C]" dir="ltr">{user.email || user.username}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{ROLE_LABEL[user.role] ?? user.role}</td>
                    <td className="px-4 py-3">{user.wilaya_name || "—"}</td>
                    <td className="px-4 py-3">{user.school || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.is_active ? "bg-[#E7F6EE] text-[#1B7F5C]" : "bg-[#FDECEC] text-[#C4564A]"}`}>
                        {user.is_active ? "نشط" : "معطّل"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <button type="button" className="px-2" onClick={() => openEdit(user)} aria-label="تعديل" title="تعديل">✎</button>
                        <button
                          type="button"
                          className="rounded-full border border-[#DCE8E3] px-2 py-0.5 text-xs"
                          onClick={() => setConfirm({ user, mode: "toggle" })}
                        >
                          {user.is_active ? "تعطيل" : "تنشيط"}
                        </button>
                        <button type="button" className="px-2 text-[#C4564A]" onClick={() => setConfirm({ user, mode: "delete" })} aria-label="حذف" title="حذف">⌫</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full bg-white px-3 py-1 font-bold text-[#0F5C47] disabled:opacity-40">
            → السابق
          </button>
          <span className="text-[#4C6A63]">صفحة {page} من {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-full bg-white px-3 py-1 font-bold text-[#0F5C47] disabled:opacity-40">
            التالي ←
          </button>
        </div>
      )}

      <FatinModal
        open={editor !== null}
        title={editor === "new" ? "مستخدم جديد" : "تعديل المستخدم"}
        subtitle={editor && editor !== "new" ? editor.username : undefined}
        onClose={() => setEditor(null)}
        okText={editor === "new" ? "إنشاء الحساب" : "حفظ التعديل"}
        loading={save.isPending}
        onOk={submit}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(ROLE_LABEL) as UserRole[]).map((item) => (
            <Pill key={item} active={form.role === item} onClick={() => set("role", item)}>
              {ROLE_LABEL[item]}
            </Pill>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الاسم الأول">
            <input className="fatin-field" value={form.first_name} onChange={(event) => set("first_name", event.target.value)} />
            <FieldError text={errors.first_name} />
          </Field>
          <Field label="اسم العائلة">
            <input className="fatin-field" value={form.last_name} onChange={(event) => set("last_name", event.target.value)} />
          </Field>
          <Field label="اسم المستخدم">
            <input className="fatin-field disabled:opacity-60" dir="ltr" disabled={editor !== "new"} value={form.username} onChange={(event) => set("username", event.target.value)} />
            <FieldError text={errors.username} />
          </Field>
          <Field label="البريد">
            <input className="fatin-field" dir="ltr" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
            <FieldError text={errors.email} />
          </Field>
          <Field label="الولاية">
            <select className="fatin-field" value={form.wilaya} onChange={(event) => set("wilaya", event.target.value)}>
              <option value="">اختر</option>
              {wilayas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <FieldError text={errors.wilaya} />
          </Field>
          <Field label="الهاتف">
            <input
              className="fatin-field"
              inputMode="numeric"
              maxLength={8}
              placeholder={LOCAL_PHONE_EXAMPLE}
              value={form.phone_number}
              onChange={(event) => set("phone_number", normalizeLocalPhone(event.target.value))}
            />
            <FieldError text={errors.phone_number} />
          </Field>
          <Field label="المدرسة" className={form.role === "student" && editor === "new" ? "" : "sm:col-span-2"}>
            <input className="fatin-field" value={form.school} onChange={(event) => set("school", event.target.value)} />
          </Field>
          {form.role === "student" && editor === "new" && (
            <Field label="السنة الدراسية">
              <select className="fatin-field" value={form.grade} onChange={(event) => set("grade", event.target.value)}>
                <option value="">اختر</option>
                {[1, 2, 3, 4, 5, 6].map((grade) => <option key={grade} value={grade}>السنة {grade}</option>)}
              </select>
            </Field>
          )}
          {editor === "new" && (
            <Field label="كلمة المرور المؤقتة" className="sm:col-span-2">
              <input className="fatin-field" type="password" autoComplete="new-password" value={form.password} onChange={(event) => set("password", event.target.value)} />
              <span className={`mt-1 block text-xs ${errors.password ? "text-[#C4564A]" : "text-[#8CA39C]"}`}>
                {errors.password || "8 أحرف على الأقل، وليست أرقامًا فقط ولا كلمة شائعة مثل 12345678."}
              </span>
            </Field>
          )}
        </div>
        {errors.form && <p className="mt-3 rounded-xl bg-[#FDECEA] px-3 py-2 text-sm text-[#B3392F]">{errors.form}</p>}
      </FatinModal>

      <FatinModal
        open={confirm !== null}
        title={confirm?.mode === "delete" ? "حذف المستخدم؟" : confirm?.user.is_active ? "تعطيل الحساب؟" : "تنشيط الحساب؟"}
        subtitle={confirm ? personName(confirm.user) : undefined}
        onClose={() => setConfirm(null)}
        okText={confirm?.mode === "delete" ? "حذف" : confirm?.user.is_active ? "تعطيل" : "تنشيط"}
        loading={save.isPending}
        onOk={runConfirm}
      >
        <p className="text-sm text-[#4C6A63]">
          {confirm?.mode === "delete"
            ? "سيُحذف هذا الحساب وكل تقدمه نهائيًا."
            : confirm?.user.is_active
              ? "لن يتمكن من تسجيل الدخول حتى تعيد تنشيطه."
              : "سيتمكن من تسجيل الدخول من جديد."}
        </p>
      </FatinModal>
    </div>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? <span className="mt-1 block text-xs text-[#C4564A]">{text}</span> : null;
}
