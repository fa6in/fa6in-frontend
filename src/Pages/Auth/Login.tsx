import { useState } from "react";
import { Form, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogin, type LoginParams } from "../../Services/Auth/useLogin";
import FatinAuthFrame from "./FatinAuthFrame";

const LoginPage = () => {
  const [form] = Form.useForm<LoginParams>();
  const { t } = useTranslation();
  const { mutate: datalogin, isPending } = useLogin();
  const [shake, setShake] = useState(0);

  return (
    <FatinAuthFrame kicker="مرحبا بعودتك" title="تسجيل الدخول">
      <div className={shake ? "fatin-shake" : undefined}>
        <Form
          form={form}
          name="login"
          onFinish={(values) => datalogin(values)}
          onFinishFailed={() => setShake((n) => n + 1)}
          layout="vertical"
          requiredMark={false}
          className="fatin-auth-card"
        >
          <Form.Item
            name="username"
            label="اسم المستخدم أو البريد"
            rules={[{ required: true, message: t("login.enter_username") }]}
          >
            <Input placeholder="ahmed@example.com" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: t("login.enter_password") }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          <div className="mb-4 text-start">
            <Link to="/forgot-password" className="text-sm font-semibold text-[#1B7F5C]">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button htmlType="submit" loading={isPending} block className="fatin-btn">
            دخول
          </Button>
        </Form>
      </div>

      <p className="mt-5 text-center text-sm text-[#12302B]">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="font-extrabold text-[#0F5C47]">
          إنشاء حساب
        </Link>
      </p>
      <p className="mx-auto mt-2 max-w-[280px] text-center text-xs leading-relaxed text-[#8CA39C]">
        بعد الدخول: توجيه تلقائي حسب الدور (طالب · معلم · مدير)
      </p>
    </FatinAuthFrame>
  );
};

export default LoginPage;
