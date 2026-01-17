// register.tsx
"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimate } from 'framer-motion';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [scope, animate] = useAnimate();

    // Variantes d'animation
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const onFinish = async (values: RegisterForm) => {
        setLoading(true);

        try {
            // Animation de soumission
            await animate(scope.current, { scale: 0.98 }, { duration: 0.1 });
            await animate(scope.current, { scale: 1 }, { duration: 0.1 });

            // Simulation d'inscription
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Register values:', values);

            notification.success({
                message: 'Inscription réussie !',
                description: 'Votre compte a été créé avec succès.',
            });

        } catch (error) {
            notification.error({
                message: 'Erreur d\'inscription',
                description: 'Une erreur est survenue lors de la création du compte.',
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        animate(scope.current,
            { x: [-5, 5, -5, 5, 0] },
            { duration: 0.4 }
        );
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <AnimatePresence>
                <motion.div
                    ref={scope}
                    variants={{ containerVariants }}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%', maxWidth: 480 }}
                >
                    <Card
                        className="rounded-xl shadow-2xl backdrop-blur-sm bg-white/95"
                        bodyStyle={{ padding: 48 }}
                    >
                        {/* En-tête */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center mb-3"
                        >
                            <Title level={2} className="!mb-2" style={{ color: 'var(--main-color)' }}>
                                Créer un compte
                            </Title>
                            <Text type="secondary" className="text-lg">
                                Rejoignez notre plateforme
                            </Text>
                        </motion.div>

                        {/* Formulaire d'inscription */}
                        <Form
                            form={form}
                            name="register"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            layout="vertical"
                            size="large"
                            scrollToFirstError
                        >
                            {/* Nom et Prénom */}
                            <div className="grid grid-cols-1 gap-">
                                <motion.div variants={itemVariants}>
                                    <Form.Item
                                        name="firstName"
                                        label="Prénom"
                                        rules={[{ required: true, message: 'Veuillez saisir votre prénom!' }]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Votre prénom"
                                            className="rounded-lg"
                                        />
                                    </Form.Item>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Form.Item
                                        name="lastName"
                                        label="Nom"
                                        rules={[{ required: true, message: 'Veuillez saisir votre nom!' }]}
                                    >
                                        <Input
                                            prefix={<IdcardOutlined />}
                                            placeholder="Votre nom"
                                            className="rounded-lg"
                                        />
                                    </Form.Item>
                                </motion.div>
                            </div>

                            {/* Email */}
                            <motion.div variants={itemVariants}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Veuillez saisir votre email!' },
                                        { type: 'email', message: 'Email invalide!' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder="adresse@email.com"
                                        className="rounded-lg"
                                    />
                                </Form.Item>
                            </motion.div>

                            {/* Téléphone */}
                            <motion.div variants={itemVariants}>
                                <Form.Item
                                    name="phone"
                                    label="Téléphone"
                                    rules={[{ required: true, message: 'Veuillez saisir votre téléphone!' }]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="32421036"
                                        className="rounded-lg"
                                    />
                                </Form.Item>
                            </motion.div>

                            {/* Mot de passe */}
                            <motion.div variants={itemVariants}>
                                <Form.Item
                                    name="password"
                                    label="Mot de passe"
                                    rules={[
                                        { required: true, message: 'Veuillez saisir votre mot de passe!' },
                                        { min: 6, message: 'Minimum 6 caractères!' }
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Votre mot de passe"
                                        className="rounded-lg"
                                    />
                                </Form.Item>
                            </motion.div>

                            {/* Confirmation mot de passe */}
                            <motion.div variants={itemVariants}>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirmer le mot de passe"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Confirmer le mot de passe"
                                        className="rounded-lg"
                                    />
                                </Form.Item>
                            </motion.div>

                            {/* Bouton d'inscription */}
                            <motion.div variants={itemVariants}>
                                <Form.Item className="!mb-4">
                                    <Button
                                        // type="primary"
                                        htmlType="submit"

                                        loading={loading}
                                        block
                                        className="!h-12 rounded-lg !text-lg font-semibold border-0 !bg-main-color !text-white"
                                        style={{
                                            background: 'var(--main-color)',
                                        }}
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
                                        S'inscrire
                                    </Button>
                                </Form.Item>
                            </motion.div>
                        </Form>

                        <Divider className="!my-2">
                            <Text type="secondary">Ou</Text>
                        </Divider>

                        {/* Lien vers la connexion */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center"
                        >
                            <Link to={"/login"}>
                                <Text type="secondary">
                                    Déjà un compte ?{' '}
                                    <span
                                        className="font-medium hover:underline"
                                        style={{ color: 'var(--main-color)' }}
                                    >
                                        Se connecter
                                    </span>
                                </Text>
                            </Link>
                        </motion.div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default RegisterPage;

