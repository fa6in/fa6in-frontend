"use client";
import { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography, Steps, Alert } from 'antd';
import { MailOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Step } = Steps;

interface ResetPasswordForm {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
}



const ResetPasswordPage = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [emailSent, setEmailSent] = useState(false);
    console.log("emailSent: ", emailSent)
    const [scope, animate] = useAnimate();

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const steps = [
        {
            title: t('resetPassword.steps.email'),
            // description: t('resetPassword.steps.emailDescription')
        },
        {
            title: t('resetPassword.steps.code'),
        },
        {
            title: t('resetPassword.steps.newPassword'),
        },
        {
            title: t('resetPassword.steps.completed'),
        }
    ];

    const handleSendCode = async (email: string) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setEmailSent(true);
            setCurrentStep(1);

            notification.success({
                message: t('resetPassword.notifications.codeSent'),
                description: t('resetPassword.notifications.codeSentDescription', { email }),
            });

        } catch (error) {
            notification.error({
                message: t('resetPassword.notifications.error'),
                description: t('resetPassword.notifications.errorDescription'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (code: string) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (code === '123456') { // Code de test
                setCurrentStep(2);
                notification.success({
                    message: t('resetPassword.notifications.codeVerified'),
                    description: t('resetPassword.notifications.codeVerifiedDescription'),
                });
            } else {
                throw new Error('Code invalide');
            }

        } catch (error) {
            notification.error({
                message: t('resetPassword.notifications.invalidCode'),
                description: t('resetPassword.notifications.invalidCodeDescription'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
        console.log("values  : ", values)
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setCurrentStep(3);

            notification.success({
                message: t('resetPassword.notifications.passwordReset'),
                description: t('resetPassword.notifications.passwordResetDescription'),
            });

        } catch (error) {
            notification.error({
                message: t('resetPassword.notifications.resetError'),
                description: t('resetPassword.notifications.resetErrorDescription'),
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: ResetPasswordForm) => {
        switch (currentStep) {
            case 0:
                await handleSendCode(values.email);
                break;
            case 1:
                await handleVerifyCode(values.code);
                break;
            case 2:
                await handleResetPassword(values);
                break;
            default:
                break;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <motion.div
                        key="step-email"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Form.Item
                            name="email"
                            label={t('resetPassword.form.email')}
                            rules={[
                                { required: true, message: t('resetPassword.form.emailRequired') },
                                { type: 'email', message: t('resetPassword.form.emailInvalid') }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder={t('resetPassword.form.emailPlaceholder')}
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Alert
                            message={t('resetPassword.alerts.information')}
                            description={t('resetPassword.alerts.informationDescription')}
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                    </motion.div>
                );

            case 1:
                return (
                    <motion.div
                        key="step-code"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Form.Item
                            name="code"
                            label={t('resetPassword.form.code')}
                            rules={[
                                { required: true, message: t('resetPassword.form.codeRequired') },
                                { len: 6, message: t('resetPassword.form.codeLength') }
                            ]}
                        >
                            <Input.OTP
                                length={6}
                                size="large"
                                className="justify-center"
                                formatter={(str) => str.toUpperCase()}
                            />
                        </Form.Item>

                        <div className="text-center mb-4">
                            <Text type="secondary">
                                {t('resetPassword.testCode')} <strong>123456</strong>
                            </Text>
                        </div>

                        <Alert
                            message={t('resetPassword.alerts.verification')}
                            description={t('resetPassword.alerts.verificationDescription')}
                            type="warning"
                            showIcon
                        />
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step-password"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Form.Item
                            name="newPassword"
                            label={t('resetPassword.form.newPassword')}
                            rules={[
                                { required: true, message: t('resetPassword.form.newPasswordRequired') },
                                { min: 8, message: t('resetPassword.form.newPasswordMin') }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder={t('resetPassword.form.newPasswordPlaceholder')}
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label={t('resetPassword.form.confirmPassword')}
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: t('resetPassword.form.confirmPasswordRequired') },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('resetPassword.form.passwordsMismatch')));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder={t('resetPassword.form.confirmPasswordPlaceholder')}
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Alert
                            message={t('resetPassword.alerts.security')}
                            description={t('resetPassword.alerts.securityDescription')}
                            type="info"
                            showIcon
                        />
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step-success"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-8"
                    >
                        <CheckCircleOutlined
                            style={{
                                fontSize: 64,
                                color: 'var(--main-color)',
                                marginBottom: 20
                            }}
                        />
                        <Title level={3} style={{ color: 'var(--main-color)' }}>
                            {t('resetPassword.success.title')}
                        </Title>
                        <Text type="secondary" className="text-lg">
                            {t('resetPassword.success.description')}
                        </Text>

                        <div className="mt-6">
                            <Button
                                size="large"
                                href="/login"
                                className="!bg-main-color !text-white !border-0 !rounded-lg"
                                style={{ padding: '0 40px', height: 45 }}
                            >
                                {t('resetPassword.buttons.login')}
                            </Button>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    const getButtonText = () => {
        switch (currentStep) {
            case 0: return t('resetPassword.buttons.sendCode');
            case 1: return t('resetPassword.buttons.verifyCode');
            case 2: return t('resetPassword.buttons.resetPassword');
            default: return t('resetPassword.buttons.continue');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    ref={scope}
                    variants={{ containerVariants }}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%', maxWidth: 1000 }}
                >
                    <Card
                        className="rounded-xl shadow-2xl backdrop-blur-sm bg-white/95"
                        styles={{
                            body: {
                                padding: 40
                            }
                        }}
                    >
                        {/* En-tête */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center mb-8"
                        >
                            <Title level={2} className="mb-4!" style={{ color: 'var(--main-color)' }}>
                                {t('resetPassword.title')}
                            </Title>

                            {/* Étapes */}
                            <Steps
                                current={currentStep}
                                size="small"
                                className="mb-8"
                            >
                                {steps.map((step, index) => (
                                    <Step
                                        key={index}
                                        title={step.title}
                                    // description={step.description}
                                    />
                                ))}
                            </Steps>
                        </motion.div>

                        {/* Formulaire */}
                        <Form
                            form={form}
                            name="resetPassword"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                        >
                            {renderStepContent()}

                            {/* Bouton d'action */}
                            {currentStep < 3 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-6"
                                >
                                    <Form.Item className="mb-0!">
                                        <Button
                                            // type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            className="!bg-main-color !text-white h-12! rounded-lg text-lg! font-semibold border-0!"
                                          
                                            onMouseEnter={(e) => {
                                                if (!loading) {
                                                    animate(e.currentTarget,
                                                        {
                                                            scale: 1.02,
                                                            boxShadow: '0 8px 25px rgba(var(--main-color-rgb), 0.3)'
                                                        },
                                                        { duration: 0.2 }
                                                    );
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!loading) {
                                                    animate(e.currentTarget,
                                                        {
                                                            scale: 1,
                                                            boxShadow: '0 4px 15px rgba(var(--main-color-rgb), 0.2)'
                                                        },
                                                        { duration: 0.2 }
                                                    );
                                                }
                                            }}
                                        >
                                            {getButtonText()}
                                        </Button>
                                    </Form.Item>
                                </motion.div>
                            )}
                        </Form>

                        {/* Lien de retour */}
                        {currentStep < 3 && (
                            <motion.div
                                variants={itemVariants}
                                className="text-center mt-4"
                            >
                                <Link to="/login">
                                    <span
                                        className="hover:underline"
                                        style={{ color: 'var(--main-color)' }}
                                    >
                                        {t('resetPassword.links.backToLogin')}
                                    </span>
                                </Link>
                            </motion.div>
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ResetPasswordPage;