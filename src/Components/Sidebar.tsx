import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Typography,
    Button,
    Tooltip,
    Badge
} from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined,
    BarChartOutlined,
    CalendarOutlined,
    MessageOutlined,
    SettingOutlined,
    GlobalOutlined,
    RocketOutlined,
    TrophyOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SidebarProps {
    collapsed: boolean;
    isMobile: boolean;
    colorPrimary: string;
    changeLanguage: (lng: string) => void;
    userRole: 'admin' | 'teacher' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    colorPrimary,
    changeLanguage,
    userRole = 'student'
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    console.log("hover : ",hoveredKey)

    // Animation du logo
    const logoVariants = {
        collapsed: {
            scale: 0.8,
            rotate: 0
        },
        expanded: {
            scale: 1,
            rotate: 360
        }
    };

    // Menu selon le rôle avec animations
    const getMenuItems = (): MenuProps['items'] => {
        const commonItems = [
            {
                key: '/dashboard',
                icon: (
                    <motion.div
                        whileHover={{ rotate: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DashboardOutlined />
                    </motion.div>
                ),
                label: (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {t('dashboard.title')}
                    </motion.span>
                ),
                onClick: () => navigate('/dashboard')
            },
            {
                key: '/courses',
                icon: (
                    <motion.div
                        whileHover={{ rotate: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BookOutlined />
                    </motion.div>
                ),
                label: (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {t('courses.title')}
                    </motion.span>
                ),
                children: [
                    {
                        key: '/courses/all',
                        label: t('courses.all'),
                        onClick: () => navigate('/courses/all')
                    },
                    {
                        key: '/courses/my',
                        label: t('courses.my'),
                        onClick: () => navigate('/courses/my')
                    },
                    {
                        key: '/courses/completed',
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {t('courses.completed')}
                                <Badge count={12} size="small" />
                            </div>
                        ),
                        onClick: () => navigate('/courses/completed')
                    },
                ]
            },
        ];

        if (userRole === 'student') {
            return [
                ...commonItems,
                {
                    key: '/assignments',
                    icon: <FileTextOutlined />,
                    label: t('assignments.title'),
                    onClick: () => navigate('/assignments')
                },
                {
                    key: '/grades',
                    icon: <BarChartOutlined />,
                    label: t('grades.title'),
                    onClick: () => navigate('/grades')
                },
                {
                    key: '/schedule',
                    icon: <CalendarOutlined />,
                    label: t('schedule.title'),
                    onClick: () => navigate('/schedule')
                },
                {
                    key: '/achievements',
                    icon: <TrophyOutlined />,
                    label: t('achievements.title'),
                    onClick: () => navigate('/achievements')
                },
            ];
        }

        if (userRole === 'teacher') {
            return [
                ...commonItems,
                {
                    key: '/students',
                    icon: <TeamOutlined />,
                    label: t('students.title'),
                    onClick: () => navigate('/students')
                },
                {
                    key: '/assignments/create',
                    icon: <FileTextOutlined />,
                    label: t('assignments.create'),
                    onClick: () => navigate('/assignments/create')
                },
                {
                    key: '/messages',
                    icon: <MessageOutlined />,
                    label: t('messages.title'),
                    onClick: () => navigate('/messages')
                },
                {
                    key: '/analytics',
                    icon: <BarChartOutlined />,
                    label: t('analytics.title'),
                    onClick: () => navigate('/analytics')
                },
            ];
        }

        if (userRole === 'admin') {
            return [
                ...commonItems,
                {
                    key: '/users',
                    icon: <TeamOutlined />,
                    label: t('users.management'),
                    children: [
                        {
                            key: '/users/students',
                            label: t('users.students'),
                            onClick: () => navigate('/users/students')
                        },
                        {
                            key: '/users/teachers',
                            label: t('users.teachers'),
                            onClick: () => navigate('/users/teachers')
                        },
                    ]
                },
                {
                    key: '/analytics',
                    icon: <BarChartOutlined />,
                    label: t('analytics.title'),
                    onClick: () => navigate('/analytics')
                },
                {
                    key: '/system',
                    icon: <SettingOutlined />,
                    label: t('system.title'),
                    onClick: () => navigate('/system')
                },
                {
                    key: '/certifications',
                    icon: <SafetyCertificateOutlined />,
                    label: t('certifications.title'),
                    onClick: () => navigate('/certifications')
                },
            ];
        }

        return commonItems;
    };

    return (
        <motion.div
            animate={collapsed ? "collapsed" : "expanded"}
            variants={{
                collapsed: {
                    width: 80,
                    transition: {
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                },
                expanded: {
                    width: 250,
                    transition: {
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1]
                    }
                }
            }}
            style={{
                position: 'fixed',
                height: '100vh',
                zIndex: 1000,
                overflow: 'hidden'
            }}
        >
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                style={{
                    height: '100vh',
                    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
                    borderRight: '1px solid rgba(0, 0, 0, 0.06)',
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Logo avec animation professionnelle */}
                <motion.div
                    className="logo"
                    variants={logoVariants}
                    animate={collapsed ? "collapsed" : "expanded"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: collapsed ? '20px 8px' : '24px 16px',
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    <AnimatePresence mode="wait">
                        {collapsed ? (
                            <motion.div
                                key="collapsed-logo"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: `linear-gradient(135deg, ${colorPrimary} 0%, ${colorPrimary}80 100%)`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    boxShadow: `0 4px 12px ${colorPrimary}40`
                                }}>
                                    <Title level={3} style={{
                                        margin: 0,
                                        color: 'white',
                                        fontSize: '20px'
                                    }}>
                                        NA
                                    </Title>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-logo"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                style={{ textAlign: 'left' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <motion.div
                                        animate={{
                                            rotate: [0, 360],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 5
                                        }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: `linear-gradient(135deg, ${colorPrimary} 0%, ${colorPrimary}80 100%)`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 4px 12px ${colorPrimary}40`
                                        }}
                                    >
                                        <RocketOutlined style={{
                                            fontSize: '20px',
                                            color: 'white'
                                        }} />
                                    </motion.div>
                                    <div>
                                        <Title level={4} style={{
                                            margin: 0,
                                            color: colorPrimary,
                                            fontWeight: 700,
                                            background: `linear-gradient(135deg, ${colorPrimary} 0%, #722ed1 100%)`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            NEWAT ACADEMY
                                        </Title>
                                        <Text type="secondary" style={{
                                            fontSize: '0.75rem',
                                            display: 'block',
                                            marginTop: '2px'
                                        }}>
                                            Excellence in Education
                                        </Text>
                                    </div>
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    style={{
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${colorPrimary}, transparent)`,
                                        borderRadius: '3px',
                                        marginTop: '8px'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Menu de navigation avec animations */}
                <motion.div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '16px 0'
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        openKeys={!collapsed ? ['/courses'] : []}
                        style={{
                            borderRight: 0,
                            background: 'transparent',
                            padding: '0 8px'
                        }}
                        items={getMenuItems()}
                        // onMouseEnter={(e) => setHoveredKey(e.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                    />
                </motion.div>

                {/* Section bas de sidebar */}
                <motion.div
                    style={{
                        padding: '16px',
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'rgba(0, 0, 0, 0.02)'
                    }}
                >
                    {/* Bouton de changement de langue */}
                    <Tooltip
                        title={t('language.change')}
                        placement="right"
                        open={collapsed ? undefined : false}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="text"
                                icon={
                                    <motion.div
                                        animate={{ rotate: i18n.language === 'en' ? 0 : 180 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <GlobalOutlined />
                                    </motion.div>
                                }
                                onClick={() => changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    height: '40px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ flex: 1 }}
                                    >
                                        {t(`language.${i18n.language}`)}
                                    </motion.span>
                                )}
                                {!collapsed && (
                                    <Badge
                                        status="processing"
                                        size="small"
                                        style={{ marginRight: '8px' }}
                                    />
                                )}
                            </Button>
                        </motion.div>
                    </Tooltip>

                    {/* Indicateur de progression (visible uniquement en mode développé) */}
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(24, 144, 255, 0.1)',
                                borderRadius: '8px',
                                border: `1px solid rgba(24, 144, 255, 0.2)`
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                            }}>
                                <Text strong style={{ fontSize: '0.85rem' }}>
                                    Progression
                                </Text>
                                <Text strong style={{
                                    fontSize: '0.85rem',
                                    color: colorPrimary
                                }}>
                                    75%
                                </Text>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ delay: 0.5, duration: 1 }}
                                style={{
                                    height: '4px',
                                    background: `linear-gradient(90deg, ${colorPrimary}, #52c41a)`,
                                    borderRadius: '2px'
                                }}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </Sider>
        </motion.div>
    );
};

export default Sidebar;