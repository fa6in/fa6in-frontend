import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimate } from 'framer-motion';
import logo from '../../assets/images/logo1.png';
import { Link, useNavigate } from 'react-router-dom';
import SpinnerLoader from '../../ui/SpinnerLoader';
import { useTranslation } from 'react-i18next';
import { useRegisterAdmin } from '../../Services/Auth/useRegisterAdmin';

const { Text } = Typography;

interface RegisterForm {
    admin_secret_code: string;
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
}

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { mutate: dataregister, isPending } = useRegisterAdmin();
    const [scope, animate] = useAnimate();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.4
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const validatePassword = (_: any, value: string) => {
        const password = form.getFieldValue('password');
        if (value && value !== password) {
            return Promise.reject(new Error(t('register.password2_match')));
        }
        return Promise.resolve();
    };

    const validateEmail = (_: any, value: string) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (value && !emailRegex.test(value)) {
            return Promise.reject(new Error(t('register.email_invalid')));
        }
        return Promise.resolve();
    };

    const validatePhone = (_: any, value: string) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (value && !phoneRegex.test(value)) {
            return Promise.reject(new Error(t('register.phone_number_invalid')));
        }
        return Promise.resolve();
    };

    const onFinish = async (values: RegisterForm) => {
        setLoading(true);

        try {
            // Animation de chargement
            await animate(scope.current, { scale: 0.98 }, { duration: 0.1 });
            await animate(scope.current, { scale: 1 }, { duration: 0.1 });

            // Ici, vous ajouterez votre appel API pour l'inscription

            // Simuler un appel API
            dataregister(values, {
                onSuccess: () => {

                    notification.success({
                        message: t('register.success'),
                        description: t('register.success_description'),
                    });
                    setTimeout(() => {
                        return navigate("/login")
                    }, 3000);
                }
            })


        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            notification.error({
                message: t('register.error'),
                description: t('register.error_description'),
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        animate(scope.current,
            { x: [-5, 5, -5, 5, 0] },
            { duration: 0.4, ease: "easeInOut" }
        );
    };

    return (
        <>
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',

                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        ref={scope}
                        variants={{ containerVariants }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    // style={{ width: '100%', maxWidth: 500 }}
                    >
                        <Card
                            style={{
                                borderRadius: 12,
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(10px)',
                                background: 'rgba(255, 255, 255, 0.95)'
                            }}
                            styles={{
                                body: {
                                    padding: 40
                                }
                            }}
                        >
                            <motion.div
                                variants={itemVariants}
                                style={{ textAlign: 'center', marginBottom: 32 }}
                            >
                                <div className='flex items-center justify-center'>
                                    <img className="h-[93px]" src={logo} alt="Logo" />
                                </div>
                            </motion.div>

                            {/* Formulaire d'inscription */}
                            <Form
                                form={form}
                                name="register"
                                className='-mt-5'
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                layout="vertical"
                                size="large"
                                initialValues={{ role: 'admin' }}
                            >
                                {/* Code secret admin */}
                                <motion.div variants={itemVariants} className='grid md:grid-cols-2 gap-3 grid-cols-1'>
                                    <Form.Item
                                        name="admin_secret_code"
                                        label={t('register.admin_secret_code')}
                                        rules={[
                                            { required: true, message: t('register.admin_secret_code_required') },
                                            { min: 8, message: t('register.admin_secret_code_min') }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<SafetyCertificateOutlined />}
                                            placeholder={t('register.admin_secret_code_placeholder')}
                                            style={{ borderRadius: 6 }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name="username"
                                        label={t('register.username')}
                                        rules={[
                                            { required: true, message: t('register.username_required') },
                                            { min: 3, message: t('register.username_min') }
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder={t('register.username_placeholder')}
                                            style={{ borderRadius: 6 }}
                                        />
                                    </Form.Item>
                                </motion.div>
                                <div className='grid md:grid-cols-2 gap-3 grid-cols-1 -mt-3'>
                                    <motion.div variants={itemVariants} style={{ flex: 1 }}>
                                        <Form.Item
                                            name="first_name"
                                            label={t('register.first_name')}
                                            rules={[{ required: true, message: t('register.first_name_required') }]}
                                        >
                                            <Input
                                                prefix={<IdcardOutlined />}
                                                placeholder={t('register.first_name_placeholder')}
                                                style={{ borderRadius: 6 }}
                                            />
                                        </Form.Item>
                                    </motion.div>

                                    <motion.div variants={itemVariants} style={{ flex: 1 }}>
                                        <Form.Item
                                            name="last_name"
                                            label={t('register.last_name')}
                                            rules={[{ required: true, message: t('register.last_name_required') }]}
                                        >
                                            <Input
                                                prefix={<IdcardOutlined />}
                                                placeholder={t('register.last_name_placeholder')}
                                                style={{ borderRadius: 6 }}
                                            />
                                        </Form.Item>
                                    </motion.div>
                                </div>
                                {/* Email */}
                                <motion.div variants={itemVariants} className='-mt-4 grid md:grid-cols-2 gap-3 grid-cols-1 '>
                                    <Form.Item
                                        name="email"
                                        label={t('register.email')}
                                        rules={[
                                            { required: true, message: t('register.email_required') },
                                            { validator: validateEmail }
                                        ]}
                                    >
                                        <Input
                                            prefix={<MailOutlined />}
                                            placeholder={t('register.email_placeholder')}
                                            style={{ borderRadius: 6 }}
                                            type="email"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="phone_number"
                                        label={t('register.phone_number')}
                                        rules={[
                                            { required: true, message: t('register.phone_number_required') },
                                            { validator: validatePhone }
                                        ]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder={t('register.phone_number_placeholder')}
                                            style={{ borderRadius: 6 }}
                                        />
                                    </Form.Item>
                                </motion.div>

                                <div >
                                    <motion.div variants={itemVariants} className='-mt-4 grid md:grid-cols-2 gap-3 grid-cols-1'>
                                        <Form.Item
                                            name="password"
                                            label={t('register.password')}
                                            rules={[
                                                { required: true, message: t('register.password_required') },
                                                { min: 8, message: t('register.password_min') },
                                                // {
                                                //     pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                                                //     message: t('register.password_pattern')
                                                // }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder={t('register.password_placeholder')}
                                                style={{ borderRadius: 6 }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="password2"
                                            label={t('register.password2')}
                                            rules={[
                                                { required: true, message: t('register.password2_required') },
                                                { validator: validatePassword }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder={t('register.password2_placeholder')}
                                                style={{ borderRadius: 6 }}
                                            />
                                        </Form.Item>
                                    </motion.div>
                                </div>

                                {/* Bouton de soumission */}
                                <motion.div variants={itemVariants}>
                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button
                                            htmlType="submit"
                                            loading={isPending || loading}
                                            className='!bg-main-color !text-white'
                                            block
                                            style={{
                                                height: 45,
                                                borderRadius: 6,
                                                fontSize: 16,
                                                fontWeight: 500,
                                                marginTop: 16
                                            }}
                                            onMouseEnter={() => {
                                                if (!loading) {
                                                    animate(scope.current.querySelector('button'),
                                                        { scale: 1.02 },
                                                        { duration: 0.2 }
                                                    );
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                if (!loading) {
                                                    animate(scope.current.querySelector('button'),
                                                        { scale: 1 },
                                                        { duration: 0.2 }
                                                    );
                                                }
                                            }}
                                        >
                                            {t('register.submit')}
                                        </Button>
                                    </Form.Item>
                                </motion.div>
                            </Form>

                            {/* Lien vers la page de connexion */}
                            <motion.div
                                variants={itemVariants}
                                style={{
                                    textAlign: 'center',
                                    marginTop: 20,
                                    display: 'flex',
                                    alignItems: "center",
                                    justifyContent: 'center'
                                }}
                            >
                                <Text type="secondary" style={{ marginRight: 8 }}>
                                    {t('register.already_account')}
                                </Text>
                                <Link to="/login">
                                    <Text style={{ color: '#1890ff', cursor: 'pointer' }}>
                                        {t('register.login_link')}
                                    </Text>
                                </Link>
                            </motion.div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
            {loading && <SpinnerLoader />}
        </>
    );
};

export default RegisterPage;



