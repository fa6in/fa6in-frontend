





import React from 'react';
import { Layout, Typography, Space, Button, Divider } from 'antd';
import { 
  GithubOutlined, 
  TwitterOutlined, 
  LinkedinOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  HeartOutlined,
  RocketOutlined,
  CopyrightOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      icon: <GithubOutlined />, 
      url: 'https://github.com', 
      color: '#333' 
    },
    { 
      icon: <TwitterOutlined />, 
      url: 'https://twitter.com', 
      color: '#1DA1F2' 
    },
    { 
      icon: <LinkedinOutlined />, 
      url: 'https://linkedin.com', 
      color: '#0077B5' 
    },
    { 
      icon: <InstagramOutlined />, 
      url: 'https://instagram.com', 
      color: '#E4405F' 
    },
    { 
      icon: <YoutubeOutlined />, 
      url: 'https://youtube.com', 
      color: '#FF0000' 
    },
  ];

  const footerLinks = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.features'), url: '/features' },
        { label: t('footer.pricing'), url: '/pricing' },
        { label: t('footer.updates'), url: '/updates' },
        { label: t('footer.demo'), url: '/demo' },
      ]
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), url: '/about' },
        { label: t('footer.careers'), url: '/careers' },
        { label: t('footer.press'), url: '/press' },
        { label: t('footer.blog'), url: '/blog' },
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.help'), url: '/help' },
        { label: t('footer.contact'), url: '/contact' },
        { label: t('footer.faq'), url: '/faq' },
        { label: t('footer.community'), url: '/community' },
      ]
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.terms'), url: '/terms' },
        { label: t('footer.privacy'), url: '/privacy' },
        { label: t('footer.cookies'), url: '/cookies' },
        { label: t('footer.security'), url: '/security' },
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      <Footer 
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
          padding: '48px 24px 24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        
        {/* Main footer content */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Top section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}>
            {/* Brand section */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Space direction="vertical" size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <RocketOutlined style={{ fontSize: '20px', color: 'white' }} />
                  </motion.div>
                  <div>
                    <Text strong style={{ 
                      fontSize: '20px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      NEWAT Academy
                    </Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Transforming Education
                    </Text>
                  </div>
                </div>
                
                <Text type="secondary" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  {t('footer.description')}
                </Text>
                
                {/* Social media links */}
                <Space size="middle">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ 
                        scale: 1.2,
                        color: social.color,
                        y: -3
                      }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        fontSize: '20px',
                        color: 'rgba(0, 0, 0, 0.45)',
                        transition: 'all 0.3s'
                      }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </Space>
              </Space>
            </motion.div>

            {/* Links sections */}
            {footerLinks.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  fontSize: '16px'
                }}>
                  {section.title}
                </Text>
                <Space direction="vertical" size="small">
                  {section.links.map((link) => (
                    <motion.div
                      key={link.label}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={link.url}
                        style={{ color: 'rgba(0, 0, 0, 0.65)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(link.url);
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </Space>
              </motion.div>
            ))}
          </div>

          <Divider style={{ margin: '32px 0' }} />

          {/* Bottom section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Space size="small">
                <CopyrightOutlined />
                <Text type="secondary">
                  {currentYear} NEWAT Academy. {t('footer.rights')}
                </Text>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <HeartOutlined style={{ color: '#ff4d4f', margin: '0 4px' }} />
                </motion.div>
              </Space>
            </motion.div>

            {/* Language and theme switcher */}
            <Space size="large">
              <Button
                type="text"
                size="small"
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
              >
                {i18n.language === 'en' ? 'Français' : 'English'}
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {t('footer.backToTop')}
                </Button>
              </motion.div>
            </Space>
          </div>

          {/* Made with love */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Made with 
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity
                }}
                style={{ 
                  display: 'inline-block', 
                  margin: '0 4px',
                  color: '#ff4d4f'
                }}
              >
                ❤️
              </motion.span> 
              by the NEWAT Team
            </Text>
          </motion.div>
        </div>
      </Footer>
    </motion.div>
  );
};

export default AppFooter;