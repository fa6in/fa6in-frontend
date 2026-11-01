import { useState } from "react";
import { UpdateProfileAdmin } from "../Admin/UpdateProfile";
import { useFatinChrome } from "../../ui/FatinChrome";
import AuthService from "../../Auth-service/AuthService";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import { useChangePassword } from "../../Services/Auth/useChangePassword";
import { useLogout } from "../../Services/Auth/useLogout";
import { Field } from "../Teacher/Content/contentUi";

const ROLE_LABEL: Record<string, string> = {
  student: "طالب",
  teacher: "معلم",
  regional_admin: "مدير ولاية",
  admin: "مدير",
};

// Écran « حسابي » : identité, édition du profil, mot de passe, déconnexion.
export default function AccountPage() {
  useFatinChrome({ subtitle: "الملف الشخصي" });
  const { data: me } = useGetProfile();
  const { mutate: logout } = useLogout();
  const name = [me?.first_name, me?.last_name].filter(Boolean).join(" ") || me?.username || "—";
  const image = typeof me?.profile_image === "string" && me.profile_image ? me.profile_image : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 pb-8 pt-1 lg:grid-cols-[1fr_340px] lg:px-7" dir="rtl">
      <section className="fatin-panel flex items-center gap-4 lg:col-span-2">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1B7F5C] text-2xl font-extrabold text-white">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold text-[#12302B]">{name}</h2>
          <p className="truncate text-sm text-[#4C6A63]">
            {ROLE_LABEL[me?.role ?? ""] ?? me?.role}
            {me?.school ? ` · ${me.school}` : ""}
            {me?.role === "student" && me?.grade ? ` · السنة ${me.grade}` : ""}
          </p>
          <p className="truncate text-xs text-[#8CA39C]" dir="ltr">{me?.email}</p>
        </div>
      </section>

      <div>
        <UpdateProfileAdmin embedded handleCancel={() => undefined} />
      </div>

      <div className="space-y-4">
        <PasswordCard />
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="w-full rounded-2xl border border-[#C4564A] bg-white py-3 font-extrabold text-[#C4564A]"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function PasswordCard() {
  const change = useChangePassword();
  const [form, setForm] = useState({ old: "", next: "", confirm: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.old || !form.next) return setError("أدخل كلمة المرور الحالية والجديدة.");
    if (form.next.length < 8) return setError("كلمة المرور الجديدة: 8 أحرف على الأقل.");
    if (/^\d+$/.test(form.next)) return setError("لا تستخدم أرقامًا فقط.");
    if (form.next !== form.confirm) return setError("كلمتا المرور غير متطابقتين.");
    const userId = AuthService.getUserId();
    if (!userId) return setError("أعد تسجيل الدخول ثم حاول مجددًا.");
    setError("");
    change.mutate(
      { userId, old_password: form.old, new_password: form.next },
      { onSuccess: () => setForm({ old: "", next: "", confirm: "" }) },
    );
  };

  return (
    <section className="fatin-panel space-y-3">
      <h3 className="font-extrabold text-[#12302B]">تغيير كلمة المرور</h3>
      <Field label="كلمة المرور الحالية">
        <input className="fatin-field" type="password" autoComplete="current-password" value={form.old} onChange={(e) => setForm({ ...form, old: e.target.value })} />
      </Field>
      <Field label="كلمة المرور الجديدة">
        <input className="fatin-field" type="password" autoComplete="new-password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
      </Field>
      <Field label="تأكيد كلمة المرور">
        <input className="fatin-field" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
      </Field>
      {error && <p className="text-xs text-[#C4564A]">{error}</p>}
      <button type="button" onClick={submit} disabled={change.isPending} className="w-full rounded-2xl bg-[#0F5C47] py-3 font-extrabold text-white disabled:opacity-50">
        {change.isPending ? "..." : "تحديث كلمة المرور"}
      </button>
    </section>
  );
}
