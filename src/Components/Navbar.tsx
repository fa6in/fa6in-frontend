import React from 'react';
import { 
  Layout, 
  Avatar, 
  Badge, 
  Breadcrumb, 
  Dropdown, 
  Button, 
  Typography,
  Tooltip,
  Space
} from 'antd';
import { 
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  GlobalOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

interface NavbarProps {
  collapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
  colorBgContainer: string;
  colorPrimary: string;
  changeLanguage: (lng: string) => void;
  userRole: string;
}

const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  isMobile,
  onToggle,
  colorBgContainer,
  colorPrimary,
  changeLanguage,
  userRole = 'student'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Générateur de breadcrumb amélioré
  const breadcrumbItems = () => {
    const paths = location.pathname.split('/').filter(path => path);
    const items = [
      {
        title: (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HomeOutlined 
              onClick={() => navigate('/dashboard')}
              style={{ 
                cursor: 'pointer',
                color: colorPrimary,
                fontSize: '16px'
              }}
            />
          </motion.div>
        ),
      },
      ...paths.map((path, index) => ({
        title: (
          <motion.span
            whileHover={{ color: colorPrimary }}
            transition={{ duration: 0.2 }}
            style={{ 
              cursor: 'pointer',
              textTransform: 'capitalize',
              color: 'inherit',
              fontWeight: index === paths.length - 1 ? 600 : 400
            }}
            onClick={() => navigate(`/${paths.slice(0, index + 1).join('/')}`)}
          >
            {t(`breadcrumb.${path}`) || path.replace('-', ' ')}
          </motion.span>
        ),
      })),
    ];
    return items;
  };

  // Dropdown du profil amélioré
  const profileItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
          style={{ padding: '4px 0' }}
        >
          <div style={{ fontWeight: 500 }}>{t('profile.title')}</div>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            Gérer votre profil
          </Text>
        </motion.div>
      ),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: t('settings.title'),
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      label: t('help.title'),
      icon: <QuestionCircleOutlined />,
      onClick: () => navigate('/help')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <Text type="danger" strong>
          {t('auth.logout')}
        </Text>
      ),
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      onClick: () => navigate('/login')
    }
  ];

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <Header 
        style={{
          padding: isMobile ? '0 16px' : '0 24px',
          background: `linear-gradient(135deg, ${colorBgContainer} 0%, rgba(255,255,255,0.95) 100%)`,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '64px',
          borderBottom: `1px solid rgba(0, 0, 0, 0.06)`,
        }}
      >
        {/* Partie gauche */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '12px' : '16px' 
        }}>
          {/* Bouton toggle pour desktop */}
          {!isMobile && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="text"
                icon={collapsed ? 
                  <MenuUnfoldOutlined style={{ fontSize: '18px', color: colorPrimary }} /> : 
                  <MenuFoldOutlined style={{ fontSize: '18px', color: colorPrimary }} />
                }
                onClick={onToggle}
                style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </motion.div>
          )}

          {/* Breadcrumb avec animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Breadcrumb 
              items={breadcrumbItems()}
              separator={
                <motion.span
                  animate={{ rotate: [0, 180, 0] }}
                  transition={{ duration: 0.5 }}
                  style={{ color: 'rgba(0, 0, 0, 0.25)' }}
                >
                  {'>'}
                </motion.span>
              }
              style={{ fontSize: '14px' }}
            />
          </motion.div>
        </div>

        {/* Partie droite */}
        <Space size={isMobile ? 'middle' : 'large'}>
          {/* Sélecteur de langue en mobile */}
          {isMobile && (
            <Tooltip title={t('language.change')} placement="bottom">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  onClick={() => changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
                  style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  }}
                >
                  {i18n.language.toUpperCase()}
                </Button>
              </motion.div>
            </Tooltip>
          )}

          {/* Notifications avec animation de pulse */}
          <Tooltip title={t('notifications.title')} placement="bottom">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  `0 0 0 0 rgba(24, 144, 255, 0.4)`,
                  `0 0 0 6px rgba(24, 144, 255, 0)`
                ]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5
              }}
              style={{ 
                position: 'relative',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                background: 'rgba(24, 144, 255, 0.1)'
              }}
              onClick={() => navigate('/notifications')}
            >
              <Badge 
                count={5} 
                size="small"
                style={{ 
                  boxShadow: `0 0 0 2px ${colorBgContainer}` 
                }}
              >
                <BellOutlined style={{ 
                  fontSize: '20px',
                  color: colorPrimary 
                }} />
              </Badge>
            </motion.div>
          </Tooltip>

          {/* Profil utilisateur */}
          <Dropdown 
            menu={{ 
              items: profileItems,
              style: {
                borderRadius: '12px',
                padding: '8px 0',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }
            }} 
            placement="bottomRight"
            trigger={['click']}
            overlayStyle={{ minWidth: '220px' }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: `1px solid rgba(0, 0, 0, 0.06)`,
                transition: 'all 0.3s'
              }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Avatar 
                  size="default" 
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  style={{ 
                    border: `2px solid ${colorPrimary}`,
                    background: `linear-gradient(135deg, ${colorPrimary}20, ${colorPrimary}40)`,
                    boxShadow: `0 4px 12px ${colorPrimary}20`
                  }}
                />
              </motion.div>
              
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ 
                    lineHeight: 1.2,
                    fontSize: '14px'
                  }}>
                    John Doe
                  </Text>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Text type="secondary" style={{ 
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      background: `${colorPrimary}15`,
                      color: colorPrimary,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'inline-block'
                    }}>
                      {userRole}
                    </Text>
                  </motion.div>
                </div>
              )}
              
              <motion.div
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 0.5 }}
                style={{ marginLeft: '4px' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </motion.div>
            </motion.div>
          </Dropdown>
        </Space>
      </Header>
    </motion.div>
  );
};

export default Navbar;