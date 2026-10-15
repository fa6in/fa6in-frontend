import { useState, type ReactNode } from "react";
import { LOCAL_PHONE, LOCAL_PHONE_EXAMPLE, normalizeLocalPhone } from "../../utils/phone";
import { Form, Input, Button, Select } from "antd";
import {
  HiOutlineAcademicCap,
  HiOutlinePresentationChartLine,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineAtSymbol,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBuildingLibrary,
  HiOutlineBookOpen,
  HiOutlineLockClosed,
  HiOutlineKey,
} from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegister, type RegisterParams, type RegisterRole } from "../../Services/Auth/useRegister";
import FatinAuthFrame from "./FatinAuthFrame";

const fieldIcon = (icon: ReactNode) => (
  <span className="auth-field-icon">{icon}</span>
);

const roles: { value: RegisterRole; icon: ReactNode }[] = [
  { value: "student", icon: <HiOutlineAcademicCap /> },
  { value: "teacher", icon: <HiOutlinePresentationChartLine /> },
  { value: "admin", icon: <HiOutlineShieldCheck /> },
];

const gradeOptions = [1, 2, 3, 4, 5, 6];

const RegisterPage = () => {
  const [form] = Form.useForm<RegisterParams>();
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const [role, setRole] = useState<RegisterRole>("student");
  const [shake, setShake] = useState(0);

  const onFinish = (values: RegisterParams) => {
    const payload: RegisterParams = {
      ...values,
      role,
      grade: role === "student" ? values.grade : undefined,
    };
    register(payload);
  };

  return (
    <FatinAuthFrame kicker="الخطوة الأولى" title="إنشاء حساب">
      <div className={shake ? "fatin-shake" : undefined}>
        <div className="mb-3 flex justify-center gap-2">
          {roles.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`rounded-full px-5 py-1.5 text-sm font-bold ${role === item.value ? "bg-[#0F5C47] text-white" : "bg-white text-[#4C6A63]"}`}
              onClick={() => {
                setRole(item.value);
                form.setFieldValue("role", item.value);
              }}
            >
              {t(`register.role_${item.value}`)}
            </button>
          ))}
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          onFinishFailed={() => setShake((n) => n + 1)}
          layout="vertical"
          requiredMark={false}
          initialValues={{ role: "student" }}
          className="fatin-auth-card"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="first_name"
              label={t("register.first_name")}
              rules={[{ required: true, message: t("register.first_name_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineUser />)}
                placeholder={t("register.first_name_placeholder")}
              />
            </Form.Item>
            <Form.Item
              name="last_name"
              label={t("register.last_name")}
              rules={[{ required: true, message: t("register.last_name_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineIdentification />)}
                placeholder={t("register.last_name_placeholder")}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="username"
              label={t("register.username")}
              rules={[
                { required: true, message: t("register.username_required") },
                { min: 3, message: t("register.username_min") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineAtSymbol />)}
                placeholder={t("register.username_placeholder")}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={t("register.email")}
              rules={[
                { required: true, message: t("register.email_required") },
                { type: "email", message: t("register.email_invalid") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineEnvelope />)}
                placeholder={t("register.email_placeholder")}
                autoComplete="email"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="phone_number"
              label={t("register.phone_number")}
              normalize={normalizeLocalPhone}
              rules={[
                { required: true, message: t("register.phone_number_required") },
                { pattern: LOCAL_PHONE, message: t("register.phone_number_invalid") },
              ]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlinePhone />)}
                placeholder={LOCAL_PHONE_EXAMPLE}
                inputMode="numeric"
                maxLength={8}
              />
            </Form.Item>
            <Form.Item
              name="school"
              label={t("register.school")}
              rules={[{ required: true, message: t("register.school_required") }]}
            >
              <Input
                className="auth-input"
                prefix={fieldIcon(<HiOutlineBuildingLibrary />)}
                placeholder={t("register.school_placeholder")}
              />
            </Form.Item>
          </div>

          {role === "student" && (
            <Form.Item
              name="grade"
              label={t("register.grade")}
              rules={[{ required: true, message: t("register.grade_required") }]}
            >
              <Select
                className="auth-input"
                placeholder={t("register.grade_placeholder")}
                suffixIcon={fieldIcon(<HiOutlineBookOpen />)}
                options={gradeOptions.map((grade) => ({
                  value: grade,
                  label: `${t("register.grade")} ${grade}`,
                }))}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
            <Form.Item
              name="password"
              label={t("register.password")}
              rules={[
                { required: true, message: t("register.password_required") },
                { min: 8, message: t("register.password_min") },
              ]}
            >
              <Input.Password
                className="auth-input"
                prefix={fieldIcon(<HiOutlineLockClosed />)}
                placeholder={t("register.password_placeholder")}
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="password_confirm"
              label={t("register.password2")}
              dependencies={["password"]}
              rules={[
                { required: true, message: t("register.password2_required") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("register.password2_match")));
                  },
                }),
              ]}
            >
              <Input.Password
                className="auth-input"
                prefix={fieldIcon(<HiOutlineKey />)}
                placeholder={t("register.password2_placeholder")}
                autoComplete="new-password"
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-1">
            <Button htmlType="submit" loading={isPending} block className="fatin-btn">
              إنشاء الحساب
            </Button>
          </Form.Item>
        </Form>

        <p className="mt-4 text-center text-sm text-[#4C6A63]">
          {t("register.already_account")}{" "}
          <Link to="/login" className="font-extrabold text-[#0F5C47]">
            {t("register.login_link")}
          </Link>
        </p>
      </div>
    </FatinAuthFrame>
  );
};

export default RegisterPage;
