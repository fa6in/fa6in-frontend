import { useRef, useState } from "react";
import { Form, Input, Button } from "antd";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { BaseUrl } from "../../api/BaseUrl";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useResetPassword } from "../../Services/Auth/useResetPassword";
import { useForgotPassword } from "../../Services/Auth/useForgotPassword";
import FatinAuthFrame from "./FatinAuthFrame";

type PasswordForm = { new_password: string; new_password_confirm: string };

// Étapes 2 et 3 du flux « mot de passe oublié » : code à 4 chiffres puis
// nouveau mot de passe.
const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [stage, setStage] = useState<"code" | "password">("code");
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [form] = Form.useForm<PasswordForm>();
  const { mutate: resetPassword, isPending } = useResetPassword();
  const { mutate: resend, isPending: resending } = useForgotPassword();
  const code = digits.join("");

  const setDigit = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (clean.length > 1) {
      // Collage du code complet.
      const next = clean.slice(0, 4).split("");
      setDigits([0, 1, 2, 3].map((i) => next[i] ?? ""));
      inputs.current[Math.min(3, next.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setCodeError("");
    if (clean && index < 3) inputs.current[index + 1]?.focus();
  };

  const verify = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setCodeError("أدخل بريدًا صالحًا.");
    if (code.length !== 4) return setCodeError("أدخل الرمز المكوّن من 4 أرقام.");
    setChecking(true);
    try {
      await axios.post(`${BaseUrl}${API_ENDPOINTS.dashboards.verifyResetCode}`, { email, code });
      setStage("password");
    } catch (error) {
      // Si le serveur n'expose pas la vérification séparée, le code sera
      // contrôlé à l'étape suivante.
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)) {
        setStage("password");
      } else {
        setCodeError("الرمز غير صحيح أو منتهي الصلاحية.");
      }
    } finally {
      setChecking(false);
    }
  };

  if (stage === "code") {
    return (
      <FatinAuthFrame kicker="الخطوة 2 من 3" title="أدخل الرمز">
        <div className="fatin-auth-card">
          <p className="mb-3 text-sm leading-relaxed text-[#4C6A63]">
            أرسلنا رمزًا من 4 أرقام إلى بريدك. تحقق من صندوق الوارد أو الرسائل غير المرغوب فيها.
          </p>
          <label className="mb-1 block text-sm font-bold text-[#12302B]">البريد الإلكتروني</label>
          <input className="fatin-field mb-4 !bg-[#f7faf8]" dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <div className="mb-2 flex justify-center gap-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => setDigit(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus();
                  if (e.key === "Enter") verify();
                }}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={4}
                aria-label={`الرقم ${index + 1}`}
                className={`h-14 w-14 rounded-2xl border-2 bg-[#f7faf8] text-center text-2xl font-extrabold text-[#12302B] outline-none focus:border-[#1B7F5C] ${codeError ? "border-[#C4564A]" : "border-[#e3eee8]"}`}
              />
            ))}
          </div>
          <p className="mb-3 min-h-5 text-center text-xs text-[#C4564A]">{codeError}</p>
          <Button onClick={verify} loading={checking} block className="fatin-btn">
            تحقق
          </Button>
          <button
            type="button"
            disabled={resending || !email}
            onClick={() => resend({ email }, { onSuccess: () => setCodeError("") })}
            className="mt-3 w-full text-center text-sm font-semibold text-[#1B7F5C] disabled:opacity-50"
          >
            {resending ? "..." : "إعادة إرسال الرمز"}
          </button>
        </div>
        <p className="mt-5 text-center text-sm">
          <Link to="/login" className="font-semibold text-[#0F5C47]">العودة لتسجيل الدخول</Link>
        </p>
      </FatinAuthFrame>
    );
  }

  return (
    <FatinAuthFrame kicker="الخطوة 3 من 3" title="كلمة مرور جديدة">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="fatin-auth-card"
        onFinish={(values) => resetPassword({ email, code, ...values })}
      >
        <Form.Item
          name="new_password"
          label="كلمة المرور الجديدة"
          rules={[
            { required: true, message: "أدخل كلمة المرور" },
            { min: 8, message: "8 أحرف على الأقل" },
            { pattern: /\D/, message: "لا تستخدم أرقامًا فقط" },
          ]}
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="new_password_confirm"
          label="تأكيد كلمة المرور"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "أكّد كلمة المرور" },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue("new_password") === value ? Promise.resolve() : Promise.reject(new Error("كلمتا المرور غير متطابقتين")),
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>
        <Button htmlType="submit" loading={isPending} block className="fatin-btn">
          حفظ كلمة المرور
        </Button>
        <button type="button" onClick={() => setStage("code")} className="mt-3 w-full text-center text-sm font-semibold text-[#1B7F5C]">
          → تعديل الرمز
        </button>
      </Form>
    </FatinAuthFrame>
  );
};

export default ResetPasswordPage;
