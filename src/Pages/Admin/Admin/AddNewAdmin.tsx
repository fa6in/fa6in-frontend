import  { useState } from 'react';
import { LOCAL_PHONE, LOCAL_PHONE_EXAMPLE, normalizeLocalPhone } from '../../../utils/phone';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Select, 
  Space,
  Steps,
  Divider
} from 'antd';
import { 
  UserAddOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  IdcardOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRegisterAdmin } from '../../../Services/Auth/useRegisterAdmin';
import type { RegisterAdminParams } from '../../../Services/Auth/useRegisterAdmin';
import PageShell from '../../../ui/PageShell';

const { Step } = Steps;
const { Option } = Select;

export default function AddNewAdmin() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { mutate: registerAdmin, isPending: loading } = useRegisterAdmin();

  const onFinish = (values: RegisterAdminParams) => {
    registerAdmin({
      ...values,
      role: "admin",
    });
  };

  const steps = [
    {
      title: 'Informations Personnelles',
      icon: <IdcardOutlined />
    },
    {
      title: 'Informations de Contact',
      icon: <MailOutlined />
    },
    {
      title: 'Sécurité',
      icon: <SafetyOutlined />
    }
  ];

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <PageShell
      title="Ajouter un administrateur"
      subtitle="Créez un compte administrateur sécurisé"
      icon={<UserAddOutlined className="text-2xl" />}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admins')}>
          Retour
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <Card bordered={false} className="shadow-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Steps current={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <motion.div
              key={currentStep}
              initial={{ x: currentStep > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="first_name"
                      label="Prénom"
                      rules={[
                        { required: true, message: 'Veuillez saisir le prénom' },
                        { min: 2, message: 'Minimum 2 caractères' }
                      ]}
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Entrez le prénom"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="last_name"
                      label="Nom"
                      rules={[
                        { required: true, message: 'Veuillez saisir le nom' },
                        { min: 2, message: 'Minimum 2 caractères' }
                      ]}
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Entrez le nom"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="username"
                      label="Nom d'utilisateur"
                      rules={[
                        { required: true, message: 'Veuillez saisir le nom d\'utilisateur' },
                        { min: 3, message: 'Minimum 3 caractères' }
                      ]}
                    >
                      <Input
                        prefix={<UserAddOutlined />}
                        placeholder="Entrez le nom d'utilisateur"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {currentStep === 1 && (
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Veuillez saisir l\'email' },
                        { type: 'email', message: 'Email invalide' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="admin@school.edu"
                        type="email"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="phone_number"
                      label="Numéro de téléphone"
                      normalize={normalizeLocalPhone}
                      rules={[
                        { required: true, message: 'Veuillez saisir le numéro de téléphone' },
                        { pattern: LOCAL_PHONE, message: '8 chiffres commençant par 2, 3 ou 4, par exemple 32421036' }
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder={LOCAL_PHONE_EXAMPLE}
                        inputMode="numeric"
                        maxLength={8}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="role"
                      label="Rôle"
                      initialValue="admin"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Sélectionnez un rôle">
                        <Option value="admin">Admin</Option>
                        <Option value="super_admin">Super Admin</Option>
                        <Option value="moderator">Modérateur</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {currentStep === 2 && (
                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="admin_secret_code"
                      label="Code Secret Admin"
                      rules={[
                        { required: true, message: 'Code secret requis' },
                        { min: 8, message: 'Minimum 8 caractères' }
                      ]}
                    >
                      <Input.Password
                        prefix={<SafetyOutlined />}
                        placeholder="AdminSecret123!@#"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label="Mot de passe"
                      rules={[
                        { required: true, message: 'Veuillez saisir le mot de passe' },
                        { min: 8, message: 'Minimum 8 caractères' },
                        { 
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Doit contenir majuscule, minuscule, chiffre et caractère spécial'
                        }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Admin@Secure123"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password2"
                      label="Confirmer le mot de passe"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Veuillez confirmer le mot de passe' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirmez le mot de passe"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </motion.div>

            <Divider />

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: currentStep > 0 ? 'space-between' : 'flex-end' }}>
                {currentStep > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={prevStep}>
                      Précédent
                    </Button>
                  </motion.div>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button type="primary" onClick={nextStep}>
                      Suivant
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Ajouter l'Admin
                    </Button>
                  </motion.div>
                )}
              </Space>
            </Form.Item>
          </Form>
        </motion.div>
      </Card>
      </motion.div>
    </PageShell>
  );
}