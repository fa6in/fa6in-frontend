import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForgotPassword } from "../../Services/Auth/useForgotPassword";
import FatinAuthFrame from "./FatinAuthFrame";

const ForgetPassword = () => {
  const [form] = Form.useForm<{ email: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: sendReset, isPending } = useForgotPassword();

  return (
    <FatinAuthFrame kicker="الخطوة 2 من 3" title="نسيت كلمة المرور">
      <Form
        form={form}
        name="forgotPassword"
        onFinish={(values) => {
          sendReset(values, {
            onSuccess: () => {
              navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
            },
          });
        }}
        layout="vertical"
        requiredMark={false}
        className="fatin-auth-card"
      >
        <div className="mb-4 rounded-2xl bg-[#FBF6E8] px-4 py-3 text-sm leading-relaxed text-[#8A5A00]">
          أدخل بريدك. سنرسل رمزاً من 4 أرقام لإعادة تعيين كلمة المرور.
        </div>
        <Form.Item
          name="email"
          label={t("forgotPassword.email")}
          rules={[
            { required: true, message: t("forgotPassword.email_required") },
            { type: "email", message: t("forgotPassword.email_invalid") },
          ]}
        >
          <Input placeholder="ahmed@example.com" autoComplete="email" />
        </Form.Item>
        <Button htmlType="submit" loading={isPending} block className="fatin-btn">
          إرسال الرمز
        </Button>
      </Form>
      <p className="mt-5 text-center text-sm">
        <Link to="/login" className="font-semibold text-[#0F5C47]">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </FatinAuthFrame>
  );
};

export default ForgetPassword;
