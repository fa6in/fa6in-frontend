import { Button, Col, Form, Input, Row, Select } from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    SafetyOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const { Option } = Select;

type Props = {
    handleModalCancel: () => void;
};

type FormValues = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "student" | "teacher";
    password: string;
    password_confirm: string;
    phone_number: string;
    grade?: number;
    school: string;
};

export default function AddNewStudent({ handleModalCancel }: Props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<FormValues>();
    const [role, setRole] = useState<"student" | "teacher">("student");

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            console.log("Form values:", values);
            setLoading(true);
            
            // Simuler une requête API
            setTimeout(() => {
                setLoading(false);
                handleModalCancel();
                // message.success(t("students1.messages.created"));
            }, 1000);
        });
    };

    const handleRoleChange = (value: "student" | "teacher") => {
        setRole(value);
        // Réinitialiser le champ grade si on passe de student à teacher
        if (value === "teacher") {
            form.setFieldValue("grade", undefined);
        }
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                className="mt-6"
                initialValues={{ 
                    role: "student",
                    status: "active" 
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="username"
                            label={t("users.form.username")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                                { min: 3, message: t("users.form.usernameMinLength") }
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder={t("users.form.usernamePlaceholder")}
                                prefix={<UserOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="role"
                            label={t("users.form.role")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                            ]}
                        >
                            <Select 
                                size="large" 
                                onChange={handleRoleChange}
                            >
                                <Option value="student">{t("users.roles.student")}</Option>
                                <Option value="teacher">{t("users.roles.teacher")}</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="first_name"
                            label={t("users.form.firstName")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder={t("users.form.firstNamePlaceholder")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="last_name"
                            label={t("users.form.lastName")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder={t("users.form.lastNamePlaceholder")}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label={t("users.form.email")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                                { type: "email", message: t("users.form.emailInvalid") },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder={t("users.form.emailPlaceholder")}
                                prefix={<MailOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone_number"
                            label={t("users.form.phoneNumber")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                                { pattern: /^[0-9]+$/, message: t("users.form.phoneInvalid") }
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder={t("users.form.phonePlaceholder")}
                                prefix={<PhoneOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="password"
                            label={t("users.form.password")}
                            rules={[
                                { required: true, message: t("users.form.required") },
                                { min: 6, message: t("users.form.passwordMinLength") },
                                { 
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                                    message: t("users.form.passwordComplexity")
                                }
                            ]}
                        >
                            <Input.Password
                                size="large"
                                placeholder={t("users.form.passwordPlaceholder")}
                                prefix={<LockOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="password_confirm"
                            label={t("users.form.confirmPassword")}
                            dependencies={['password']}
                            rules={[
                                { required: true, message: t("users.form.required") },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t("users.form.passwordMismatch")));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                size="large"
                                placeholder={t("users.form.confirmPasswordPlaceholder")}
                                prefix={<SafetyOutlined className="text-gray-400" />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {role === "student" && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="grade"
                                label={t("students1.form.grade")}
                                rules={[
                                    { required: true, message: t("users.form.required") },
                                ]}
                            >
                                <Select 
                                    size="large" 
                                    placeholder={t("students1.form.gradePlaceholder")}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                                        <Option key={grade} value={grade}>
                                            {t("students1.grades.grade")} {grade}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="school"
                                label={t("users.form.school")}
                                rules={[
                                    { required: true, message: t("users.form.required") },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder={t("users.form.schoolPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                {role === "teacher" && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="school"
                                label={t("users.form.school")}
                                rules={[
                                    { required: true, message: t("users.form.required") },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder={t("users.form.schoolPlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                    onClick={handleModalCancel} 
                    className="!text-main-color !border-main-color"
                >
                    {t("common.cancel")}
                </Button>
                <Button 
                    loading={loading} 
                    onClick={handleModalOk} 
                    className="!bg-main-color !text-white"
                >
                    {t("common.create")}
                </Button>
            </div>
        </div>
    );
}