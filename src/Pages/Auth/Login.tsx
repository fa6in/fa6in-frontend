"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimate } from 'framer-motion';
import logo from '../../assets/images/logo.png'
import { Link } from 'react-router-dom';
import { useLogin, type LoginParams } from '../../Services/Auth/useLogin';
import SpinnerLoader from '../../ui/SpinnerLoader';
import { useTranslation } from 'react-i18next';
const { Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scope, animate] = useAnimate();
  const {t} = useTranslation()

  const { mutate: datalogin, isPending } = useLogin()

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

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    const params: LoginParams = {
      username: values.username,
      password: values.password
    }
    try {
      // Animation de chargement
      await animate(scope.current, { scale: 0.98 }, { duration: 0.1 });
      await animate(scope.current, { scale: 1 }, { duration: 0.1 });


      datalogin(params, {
        onSuccess: () => {
          message.success("connexion réussie")
        }
      })


      notification.success({
        message: 'Connexion réussie',
        description: 'Bienvenue !',
      });

    } catch (error) {
      notification.error({
        message: 'Erreur de connexion',
        description: t("login.enter_username"),
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
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
        padding: '20px'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          ref={scope}
          variants={{ containerVariants }}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}
            bodyStyle={{ padding: 40 }}
          >
            <motion.div
              variants={itemVariants}
              style={{ textAlign: 'center', marginBottom: 32 }}
            >

              <div className='flex items-center justify-center' >
                <img src={logo} alt="Logo" />

              </div>

            </motion.div>

            {/* Formulaire */}
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: t("login.enter_username") },
                    { type: 'string', message: 'username invalide!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t("login.username")}
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: t("login.enter_password") }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                      placeholder={t("login.password")}
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </motion.div>

              {/* Bouton de soumission avec animation */}
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
                      fontWeight: 500
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
                  {t("login.login")}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>

            {/* Liens supplémentaires */}
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
              <Link to={"/reset-password"}>
                <Text type="secondary" style={{ cursor: 'pointer' }}>
                   {t("login.forget_password")}
                </Text>
              </Link>
              {/* <Link to={"/register"}>
                <Text type="secondary" style={{ cursor: 'pointer' }}>
                  Créer un compte
                </Text>
              </Link> */}
            </motion.div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
    {loading || isPending && (<SpinnerLoader/>)}
    </>
  );
};

export default LoginPage;

