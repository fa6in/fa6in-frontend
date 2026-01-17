



import React from 'react';
import { Layout, theme, Typography, Space } from 'antd';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const {
    token: { colorBgContainer, colorPrimary, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-30%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <Header style={{
        background: 'transparent',
        height: '80px',
        padding: '0 50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Space align="center">
              <div style={{
                width: '40px',
                height: '40px',
                background: 'white',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: `linear-gradient(135deg, ${colorPrimary} 0%, #722ed1 100%)`,
                  borderRadius: '6px'
                }} />
              </div>
              <Title level={3} style={{ 
                margin: 0, 
                color: 'white',
                fontWeight: 700
              }}>
                NEWAT Academy
              </Title>
            </Space>
          </Link>
        </motion.div>

        <Space>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <Text style={{ color: 'white' }}>{t('auth.backToHome')}</Text>
          </Link>
          <div style={{ 
            width: '1px', 
            height: '20px', 
            background: 'rgba(255, 255, 255, 0.3)' 
          }} />
          <Text style={{ color: 'white', opacity: 0.8 }}>
            {t('auth.alreadyHaveAccount')} <Link to="/login" style={{ color: 'white', fontWeight: 600 }}>{t('auth.login')}</Link>
          </Text>
        </Space>
      </Header>

      <Content style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '50px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative element */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(24, 144, 255, 0.05) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />

          {children}
        </motion.div>
      </Content>

      <Footer style={{
        textAlign: 'center',
        background: 'transparent',
        padding: '24px 50px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          © {new Date().getFullYear()} NEWAT Academy. {t('footer.rights')}
        </Text>
        <Space style={{ marginTop: '8px' }} split={<Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</Text>}>
          <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t('footer.terms')}</Link>
          <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t('footer.privacy')}</Link>
          <Link to="/contact" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t('footer.contact')}</Link>
        </Space>
      </Footer>
    </Layout>
  );
};

export default AuthLayout;