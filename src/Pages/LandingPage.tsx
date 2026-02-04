import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Typography,
    Card,
    Row,
    Col,
    Space,
    Statistic,
    Avatar,
    Tag,
    Divider,
    FloatButton,
    Grid,
    Badge
} from 'antd';
import {
    RocketOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    StarOutlined,
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    TrophyOutlined,
    ArrowRightOutlined,
    MessageOutlined,
    ArrowUpOutlined,
    DownloadOutlined,
    VideoCameraOutlined,
    FileTextOutlined,
    BarChartOutlined,
    CrownOutlined,
    GithubOutlined,
    TwitterOutlined,
    LinkedinOutlined,
    InstagramOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const LandingPage: React.FC<{ section?: string }> = ({ }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Refs pour les animations
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const statsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const ctaRef = useRef(null);

    // État pour les animations
    const [scrollY, setScrollY] = useState(0);
    // const [heroInView, setHeroInView] = useState(true);

    // Animations contrôlées
    const heroControls = useAnimation();
    const featuresControls = useAnimation();
    const statsControls = useAnimation();

    // Vérification des éléments en vue
    const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
    const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 });
    const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

    // Gestion du scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            // setHeroInView(window.scrollY < 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Déclenchement des animations
    useEffect(() => {
        if (isHeroInView) {
            heroControls.start("visible");
        }
    }, [isHeroInView, heroControls]);

    useEffect(() => {
        if (isFeaturesInView) {
            featuresControls.start("visible");
        }
    }, [isFeaturesInView, featuresControls]);

    useEffect(() => {
        if (isStatsInView) {
            statsControls.start("visible");
        }
    }, [isStatsInView, statsControls]);

    // Animations variantes
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1]
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const floatAnimation = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // const pulseAnimation = {
    //     animate: {
    //         scale: [1, 1.05, 1],
    //         transition: {
    //             duration: 2,
    //             repeat: Infinity,
    //             ease: "easeInOut"
    //         }
    //     }
    // };

    // Données pour les fonctionnalités
    const features = [
        {
            icon: <VideoCameraOutlined />,
            title: t('landing.features.liveClasses'),
            description: t('landing.features.liveClassesDesc'),
            color: '#1890ff',
            delay: 0.1
        },
        {
            icon: <BookOutlined />,
            title: t('landing.features.interactiveContent'),
            description: t('landing.features.interactiveContentDesc'),
            color: '#52c41a',
            delay: 0.2
        },
        {
            icon: <FileTextOutlined />,
            title: t('landing.features.assignments'),
            description: t('landing.features.assignmentsDesc'),
            color: '#722ed1',
            delay: 0.3
        },
        {
            icon: <BarChartOutlined />,
            title: t('landing.features.analytics'),
            description: t('landing.features.analyticsDesc'),
            color: '#fa8c16',
            delay: 0.4
        },
        {
            icon: <TeamOutlined />,
            title: t('landing.features.collaboration'),
            description: t('landing.features.collaborationDesc'),
            color: '#f5222d',
            delay: 0.5
        },
        {
            icon: <TrophyOutlined />,
            title: t('landing.features.certifications'),
            description: t('landing.features.certificationsDesc'),
            color: '#13c2c2',
            delay: 0.6
        }
    ];

    // Statistiques
    const stats = [
        { value: 50, label: t('landing.stats.courses'), suffix: '+', icon: <BookOutlined /> },
        { value: 10000, label: t('landing.stats.students'), suffix: '+', icon: <UserOutlined /> },
        { value: 200, label: t('landing.stats.instructors'), suffix: '+', icon: <TeamOutlined /> },
        { value: 98, label: t('landing.stats.satisfaction'), suffix: '%', icon: <StarOutlined /> }
    ];

    // Témoignages
    const testimonials = [
        {
            name: "Alexandre Martin",
            role: "Étudiant en Informatique",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            content: "La plateforme a transformé ma façon d'apprendre. Les cours interactifs sont exceptionnels !",
            rating: 5
        },
        {
            name: "Sophie Dubois",
            role: "Professeure de Mathématiques",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            content: "Outil incroyable pour créer et partager du contenu éducatif. Mes étudiants adorent !",
            rating: 5
        },
        {
            name: "Mohamed Ali",
            role: "Responsable Formation",
            avatar: "https://randomuser.me/api/portraits/men/67.jpg",
            content: "Solution complète pour la gestion de notre académie. Le support est excellent.",
            rating: 4
        }
    ];

    // Cours populaires
    const popularCourses = [
        {
            title: "Développement Full Stack",
            category: "Informatique",
            instructor: "Dr. Jean Dupont",
            students: 1245,
            rating: 4.9,
            price: "199€",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop"
        },
        {
            title: "Data Science Avancée",
            category: "Science des Données",
            instructor: "Prof. Marie Curie",
            students: 987,
            rating: 4.8,
            price: "249€",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w-400&h=250&fit=crop"
        },
        {
            title: "Marketing Digital",
            category: "Marketing",
            instructor: "Alexandre Marketing",
            students: 2100,
            rating: 4.7,
            price: "149€",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
        }
    ];

    return (
        <div style={{ overflow: 'hidden' }}>
            {/* Hero Section avec Parallax */}
            <section
                ref={heroRef}
                style={{
                    position: 'relative',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    overflow: 'hidden',
                    padding: isMobile ? '40px 20px' : '0 50px'
                }}
            >
                {/* Background Elements */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                        rotate: [0, -180, -360]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '10%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial="hidden"
                                animate={heroControls}
                                variants={staggerContainer}
                            >
                                <motion.div variants={{ fadeInUp }}>
                                    <Badge.Ribbon
                                        text={t('landing.hero.badge')}
                                        color="#52c41a"
                                        style={{ marginBottom: 24 }}
                                    >
                                        <Tag
                                            color="gold"
                                            icon={<CrownOutlined />}
                                            style={{
                                                marginBottom: 16,
                                                padding: '4px 12px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {t('landing.hero.premium')}
                                        </Tag>
                                    </Badge.Ribbon>
                                </motion.div>

                                <motion.div variants={{ fadeInUp }}>
                                    <Title
                                        level={1}
                                        style={{
                                            color: 'white',
                                            fontSize: isMobile ? '2.5rem' : '3.5rem',
                                            lineHeight: 1.2,
                                            marginBottom: 24
                                        }}
                                    >
                                        {t('landing.hero.title')}{' '}
                                        <motion.span
                                            animate={{
                                                color: ['#ffffff', '#ffd666', '#ffffff']
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity
                                            }}
                                            style={{ display: 'inline-block' }}
                                        >
                                            {t('landing.hero.highlight')}
                                        </motion.span>
                                    </Title>
                                </motion.div>

                                <motion.div variants={{ fadeInUp }}>
                                    <Paragraph style={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: isMobile ? '1rem' : '1.25rem',
                                        lineHeight: 1.6,
                                        marginBottom: 40
                                    }}>
                                        {t('landing.hero.description')}
                                    </Paragraph>
                                </motion.div>

                                <motion.div variants={{ fadeInUp }}>
                                    <Space
                                        direction={isMobile ? "vertical" : "horizontal"}
                                        size="large"
                                        style={{ width: '100%' }}
                                    >
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<RocketOutlined />}
                                                onClick={() => navigate('/register')}
                                                style={{
                                                    height: '56px',
                                                    padding: '0 32px',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)'
                                                }}
                                            >
                                                {t('landing.hero.ctaPrimary')}
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                type="default"
                                                size="large"
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => {
                                                    // Ouvrir vidéo de démonstration
                                                    window.open('https://youtu.be/dQw4w9WgXcQ', '_blank');
                                                }}
                                                style={{
                                                    height: '56px',
                                                    padding: '0 32px',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            >
                                                {t('landing.hero.ctaSecondary')}
                                            </Button>
                                        </motion.div>
                                    </Space>
                                </motion.div>

                                {/* Stats miniatures */}
                                <motion.div
                                    variants={{ fadeInUp }}
                                    style={{
                                        display: 'flex',
                                        gap: 24,
                                        marginTop: 48,
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    {stats.slice(0, 2).map((stat, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: index * 0.5
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {React.cloneElement(stat.icon, { style: { color: 'white', fontSize: '20px' } })}
                                                </div>
                                            </motion.div>
                                            <div>
                                                <Text strong style={{
                                                    color: 'white',
                                                    fontSize: '24px',
                                                    display: 'block',
                                                    lineHeight: 1
                                                }}>
                                                    {stat.value}{stat.suffix}
                                                </Text>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    fontSize: '12px'
                                                }}>
                                                    {stat.label}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, x: 100, rotate: -10 },
                                    visible: {
                                        opacity: 1,
                                        x: 0,
                                        rotate: 0,
                                        transition: {
                                            duration: 1,
                                            ease: [0.34, 1.56, 0.64, 1]
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate={heroControls}
                                style={{ position: 'relative' }}
                            >
                                {/* Dashboard 3D Animation */}
                                <motion.div
                                    variants={{ floatAnimation }}
                                    animate="animate"
                                    style={{
                                        position: 'relative',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '24px',
                                        padding: '24px',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transformStyle: 'preserve-3d',
                                        perspective: 1000
                                    }}
                                >
                                    {/* Simulated Dashboard */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(12, 1fr)',
                                        gap: '12px',
                                        height: '400px'
                                    }}>
                                        {/* Top Stats */}
                                        {[1, 2, 3, 4].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    opacity: [0.5, 1, 0.5],
                                                    scale: [1, 1.02, 1]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.2
                                                }}
                                                style={{
                                                    gridColumn: i === 1 ? 'span 3' : 'span 3',
                                                    background: `rgba(255, 255, 255, ${0.05 + i * 0.05})`,
                                                    borderRadius: '12px',
                                                    padding: '12px'
                                                }}
                                            />
                                        ))}

                                        {/* Main Chart */}
                                        <motion.div
                                            animate={{
                                                background: [
                                                    'rgba(255, 255, 255, 0.1)',
                                                    'rgba(255, 255, 255, 0.15)',
                                                    'rgba(255, 255, 255, 0.1)'
                                                ]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity
                                            }}
                                            style={{
                                                gridColumn: 'span 8',
                                                gridRow: 'span 2',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '16px'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '12px'
                                            }}>
                                                {[30, 50, 70, 90, 60, 40].map((height, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        animate={{ height: [height, height + 20, height] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: idx * 0.1
                                                        }}
                                                        style={{
                                                            width: '12px',
                                                            height: `${height}%`,
                                                            background: 'linear-gradient(to top, #1890ff, #52c41a)',
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>

                                        {/* Sidebar */}
                                        <motion.div
                                            animate={{
                                                x: [0, 5, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity
                                            }}
                                            style={{
                                                gridColumn: 'span 4',
                                                gridRow: 'span 2',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '12px',
                                                padding: '16px'
                                            }}
                                        />
                                    </div>

                                    {/* Floating Elements */}
                                    <motion.div
                                        animate={{
                                            x: [0, 20, 0],
                                            y: [0, -20, 0]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: -20,
                                            right: -20,
                                            width: '60px',
                                            height: '60px',
                                            background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 24px rgba(24, 144, 255, 0.4)'
                                        }}
                                    >
                                        <TrophyOutlined style={{ color: 'white', fontSize: '24px' }} />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </Col>
                    </Row>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{
                        y: [0, 10, 0],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                // onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <Text style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '12px'
                    }}>
                        Scroll to explore
                    </Text>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <ArrowDownOutlined style={{ fontSize: '24px' }} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section
                ref={featuresRef}
                style={{
                    padding: isMobile ? '80px 20px' : '120px 50px',
                    background: '#fafafa',
                    position: 'relative'
                }}
            >
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <Tag
                            color="blue"
                            icon={<CheckCircleOutlined />}
                            style={{
                                marginBottom: 16,
                                padding: '8px 16px',
                                fontSize: '14px'
                            }}
                        >
                            {t('landing.features.badge')}
                        </Tag>
                        <Title level={2} style={{
                            fontSize: isMobile ? '2rem' : '2.5rem',
                            marginBottom: 16
                        }}>
                            {t('landing.features.title')}
                        </Title>
                        <Paragraph type="secondary" style={{
                            fontSize: isMobile ? '1rem' : '1.125rem',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {t('landing.features.subtitle')}
                        </Paragraph>
                    </motion.div>

                    {/* Features Grid */}
                    <Row gutter={[32, 32]}>
                        {features.map((feature, index) => (
                            <Col key={index} xs={24} sm={12} lg={8}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: feature.delay }}
                                    whileHover={{
                                        y: -10,
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <Card
                                        hoverable
                                        style={{
                                            height: '100%',
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                                            overflow: 'hidden'
                                        }}
                                        styles={{
                                            body: {
                                                padding: 32
                                            }
                                        }}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '100px',
                                                height: '100px',
                                                background: `linear-gradient(135deg, ${feature.color}10, transparent)`,
                                                borderRadius: '0 0 0 100%',
                                                pointerEvents: 'none'
                                            }}
                                        />

                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                width: '64px',
                                                height: '64px',
                                                background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 24
                                            }}
                                        >
                                            {React.cloneElement(feature.icon, {
                                                style: {
                                                    fontSize: '28px',
                                                    color: feature.color
                                                }
                                            })}
                                        </motion.div>

                                        <Title level={4} style={{ marginBottom: 12 }}>
                                            {feature.title}
                                        </Title>

                                        <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                                            {feature.description}
                                        </Paragraph>

                                        <motion.div
                                            whileHover={{ x: 10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Button
                                                type="link"
                                                icon={<ArrowRightOutlined />}
                                                style={{
                                                    padding: 0,
                                                    color: feature.color,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {t('landing.learnMore')}
                                            </Button>
                                        </motion.div>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Interactive Demo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        style={{
                            marginTop: 80,
                            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                            borderRadius: '24px',
                            padding: isMobile ? '40px 20px' : '60px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Row align="middle" gutter={[48, 48]}>
                            <Col xs={24} lg={12}>
                                <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                                    {t('landing.demo.title')}
                                </Title>
                                <Paragraph style={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    marginBottom: 32
                                }}>
                                    {t('landing.demo.description')}
                                </Paragraph>
                                <Space direction={isMobile ? "vertical" : "horizontal"} size="middle">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            style={{
                                                background: 'white',
                                                color: '#1890ff',
                                                border: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            {t('landing.demo.cta')}
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            size="large"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                borderColor: 'rgba(255, 255, 255, 0.3)'
                                            }}
                                        >
                                            {t('landing.demo.secondary')}
                                        </Button>
                                    </motion.div>
                                </Space>
                            </Col>
                            <Col xs={24} lg={12}>
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                >
                                    {/* Animated mockup */}
                                </motion.div>
                            </Col>
                        </Row>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section
                ref={statsRef}
                style={{
                    padding: isMobile ? '80px 20px' : '120px 50px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    position: 'relative'
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <Title level={2} style={{
                            fontSize: isMobile ? '2rem' : '2.5rem',
                            marginBottom: 16
                        }}>
                            {t('landing.stats.title')}
                        </Title>
                        <Paragraph type="secondary" style={{
                            fontSize: isMobile ? '1rem' : '1.125rem',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {t('landing.stats.subtitle')}
                        </Paragraph>
                    </motion.div>

                    <Row gutter={[32, 32]}>
                        {stats.map((stat, index) => (
                            <Col key={index} xs={12} sm={6}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                `0 0 0 0 rgba(24, 144, 255, 0.4)`,
                                                `0 0 0 20px rgba(24, 144, 255, 0)`
                                            ]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: index * 0.5
                                        }}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 20px',
                                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {React.cloneElement(stat.icon, {
                                            style: {
                                                fontSize: '32px',
                                                color: '#1890ff'
                                            }
                                        })}
                                    </motion.div>

                                    <Statistic
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        valueStyle={{
                                            fontSize: '3rem',
                                            fontWeight: 700,
                                            color: '#1890ff'
                                        }}
                                    />
                                    <Text type="secondary" style={{ fontSize: '1rem' }}>
                                        {stat.label}
                                    </Text>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Progress Bars */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{
                            marginTop: 80,
                            background: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Title level={3} style={{ marginBottom: 32 }}>
                            {t('landing.progress.title')}
                        </Title>

                        {[
                            { skill: t('landing.progress.webDev'), percent: 95, color: '#1890ff' },
                            { skill: t('landing.progress.dataScience'), percent: 88, color: '#52c41a' },
                            { skill: t('landing.progress.design'), percent: 92, color: '#722ed1' },
                            { skill: t('landing.progress.marketing'), percent: 85, color: '#fa8c16' }
                        ].map((item, index) => (
                            <div key={index} style={{ marginBottom: 24 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8
                                }}>
                                    <Text strong>{item.skill}</Text>
                                    <Text strong style={{ color: item.color }}>
                                        {item.percent}%
                                    </Text>
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.percent}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                    style={{
                                        height: '10px',
                                        background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Courses Section */}
            <section style={{
                padding: isMobile ? '80px 20px' : '120px 50px',
                background: '#ffffff'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <Title level={2} style={{
                            fontSize: isMobile ? '2rem' : '2.5rem',
                            marginBottom: 16
                        }}>
                            {t('landing.courses.title')}
                        </Title>
                        <Paragraph type="secondary" style={{
                            fontSize: isMobile ? '1rem' : '1.125rem',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {t('landing.courses.subtitle')}
                        </Paragraph>
                    </motion.div>

                    <Row gutter={[32, 32]}>
                        {popularCourses.map((course, index) => (
                            <Col key={index} xs={24} md={8}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                                <motion.img
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.6 }}
                                                    src={course.image}
                                                    alt={course.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <Tag
                                                    color="blue"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 16,
                                                        left: 16,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {course.category}
                                                </Tag>
                                            </div>
                                        }
                                        style={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                                        }}
                                    >
                                        <Card.Meta
                                            title={
                                                <Title level={4} style={{ marginBottom: 8 }}>
                                                    {course.title}
                                                </Title>
                                            }
                                            description={
                                                <>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 16
                                                    }}>
                                                        <Space>
                                                            <Avatar size="small" src="https://randomuser.me/api/portraits/men/32.jpg" />
                                                            <Text>{course.instructor}</Text>
                                                        </Space>
                                                        <Space>
                                                            <StarOutlined style={{ color: '#faad14' }} />
                                                            <Text strong>{course.rating}</Text>
                                                        </Space>
                                                    </div>

                                                    <Divider style={{ margin: '16px 0' }} />

                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Space>
                                                            <TeamOutlined />
                                                            <Text>{course.students} étudiants</Text>
                                                        </Space>
                                                        <Text strong style={{ fontSize: '1.5rem', color: '#1890ff' }}>
                                                            {course.price}
                                                        </Text>
                                                    </div>
                                                </>
                                            }
                                        />

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{ marginTop: 24 }}
                                        >
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                style={{ borderRadius: '8px' }}
                                            >
                                                {t('landing.courses.enroll')}
                                            </Button>
                                        </motion.div>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        style={{ textAlign: 'center', marginTop: 60 }}
                    >
                        <Button
                            type="link"
                            size="large"
                            icon={<ArrowRightOutlined />}
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: 600
                            }}
                            onClick={() => navigate('/courses')}
                        >
                            {t('landing.courses.viewAll')}
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section
                ref={testimonialsRef}
                style={{
                    padding: isMobile ? '80px 20px' : '120px 50px',
                    background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                    position: 'relative'
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <Title level={2} style={{
                            fontSize: isMobile ? '2rem' : '2.5rem',
                            marginBottom: 16
                        }}>
                            {t('landing.testimonials.title')}
                        </Title>
                        <Paragraph type="secondary" style={{
                            fontSize: isMobile ? '1rem' : '1.125rem',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {t('landing.testimonials.subtitle')}
                        </Paragraph>
                    </motion.div>

                    <Row gutter={[32, 32]}>
                        {testimonials.map((testimonial, index) => (
                            <Col key={index} xs={24} md={8}>
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Card
                                        style={{
                                            borderRadius: '20px',
                                            background: 'white',
                                            border: 'none',
                                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                                            height: '100%'
                                        }}
                                        styles={{
                                            body: {
                                                padding: 32
                                            }
                                        }}
                                    >
                                        {/* Rating Stars */}
                                        <div style={{ marginBottom: 24 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <motion.span
                                                    key={i}
                                                    animate={{
                                                        scale: i < testimonial.rating ? [1, 1.2, 1] : 1,
                                                        rotate: i < testimonial.rating ? [0, 20, 0] : 0
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        delay: i * 0.1
                                                    }}
                                                >
                                                    <StarOutlined
                                                        style={{
                                                            color: i < testimonial.rating ? '#faad14' : '#d9d9d9',
                                                            fontSize: '20px',
                                                            marginRight: 4
                                                        }}
                                                    />
                                                </motion.span>
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <Paragraph style={{
                                            fontSize: '1.125rem',
                                            fontStyle: 'italic',
                                            marginBottom: 32
                                        }}>
                                            "{testimonial.content}"
                                        </Paragraph>

                                        {/* Author */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <Avatar
                                                size={56}
                                                src={testimonial.avatar}
                                                style={{
                                                    border: '3px solid #1890ff',
                                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)'
                                                }}
                                            />
                                            <div>
                                                <Text strong style={{ display: 'block', fontSize: '1.125rem' }}>
                                                    {testimonial.name}
                                                </Text>
                                                <Text type="secondary">{testimonial.role}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* CTA Section */}
            <section
                ref={ctaRef}
                style={{
                    padding: isMobile ? '80px 20px' : '120px 50px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
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
                        width: '800px',
                        height: '800px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Tag
                            color="gold"
                            // icon={<AwardOutlined />}

                            style={{
                                marginBottom: 24,
                                padding: '8px 16px',
                                fontSize: '14px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        >
                            {t('landing.cta.badge')}
                        </Tag>

                        <Title level={2} style={{
                            color: 'white',
                            fontSize: isMobile ? '2rem' : '3rem',
                            marginBottom: 24
                        }}>
                            {t('landing.cta.title')}
                        </Title>

                        <Paragraph style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            marginBottom: 48,
                            lineHeight: 1.6
                        }}>
                            {t('landing.cta.description')}
                        </Paragraph>

                        <Space
                            direction={isMobile ? "vertical" : "horizontal"}
                            size="large"
                            style={{ width: isMobile ? '100%' : 'auto' }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ width: isMobile ? '100%' : 'auto' }}
                            >
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<RocketOutlined />}
                                    onClick={() => navigate('/register')}
                                    style={{
                                        height: '56px',
                                        padding: '0 40px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                        border: 'none',
                                        boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                                        width: isMobile ? '100%' : 'auto'
                                    }}
                                >
                                    {t('landing.cta.primary')}
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ width: isMobile ? '100%' : 'auto' }}
                            >
                                <Button
                                    size="large"
                                    icon={<MessageOutlined />}
                                    onClick={() => navigate('/contact')}
                                    style={{
                                        height: '56px',
                                        padding: '0 40px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        backdropFilter: 'blur(10px)',
                                        width: isMobile ? '100%' : 'auto'
                                    }}
                                >
                                    {t('landing.cta.secondary')}
                                </Button>
                            </motion.div>
                        </Space>

                        <Text style={{
                            display: 'block',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: 32,
                            fontSize: '14px'
                        }}>
                            {t('landing.cta.note')}
                        </Text>
                    </motion.div>
                </div>
            </section>

            {/* Footer Section */}
            <footer style={{
                background: '#001529',
                color: 'white',
                padding: isMobile ? '40px 20px' : '60px 50px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={8}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Space direction="vertical" size="large">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <RocketOutlined style={{ fontSize: '20px', color: 'white' }} />
                                            </div>
                                        </motion.div>
                                        <Title level={3} style={{ margin: 0, color: 'white' }}>
                                            NEWAT Academy
                                        </Title>
                                    </div>

                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        {t('landing.footer.description')}
                                    </Paragraph>

                                    <Space size="middle">
                                        {[GithubOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined].map((Icon, index) => (
                                            <motion.a
                                                key={index}
                                                href="#"
                                                whileHover={{ scale: 1.2, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    fontSize: '20px'
                                                }}
                                            >
                                                <Icon />
                                            </motion.a>
                                        ))}
                                    </Space>
                                </Space>
                            </motion.div>
                        </Col>

                        {[
                            { title: t('landing.footer.product'), links: ['Features', 'Pricing', 'Updates'] },
                            { title: t('landing.footer.company'), links: ['About', 'Careers', 'Press'] },
                            { title: t('landing.footer.support'), links: ['Help', 'Contact', 'FAQ'] }
                        ].map((section, index) => (
                            <Col key={index} xs={24} md={5}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Title level={4} style={{ color: 'white', marginBottom: 24 }}>
                                        {section.title}
                                    </Title>
                                    <Space direction="vertical" size="small">
                                        {section.links.map((link, idx) => (
                                            <motion.a
                                                key={idx}
                                                href="#"
                                                whileHover={{ x: 5 }}
                                                transition={{ duration: 0.2 }}
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    textDecoration: 'none',
                                                    display: 'block'
                                                }}
                                            >
                                                {link}
                                            </motion.a>
                                        ))}
                                    </Space>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <Divider style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        margin: '48px 0 32px'
                    }} />

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 16
                        }}
                    >
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            © {new Date().getFullYear()} NEWAT Academy. {t('landing.footer.rights')}
                        </Text>

                        <Space size="large">
                            <a href="/privacy" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {t('landing.footer.privacy')}
                            </a>
                            <a href="/terms" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {t('landing.footer.terms')}
                            </a>
                            <a href="/cookies" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {t('landing.footer.cookies')}
                            </a>
                        </Space>
                    </motion.div>
                </div>
            </footer>

            {/* Floating Action Button */}
            <AnimatePresence>
                {scrollY > 500 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000
                        }}
                    >
                        <FloatButton.Group
                            trigger="hover"
                            type="primary"
                            style={{ right: 24 }}
                            icon={<ArrowUpOutlined />}
                        >
                            <FloatButton
                                tooltip="Back to Top"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            />
                            <FloatButton
                                icon={<MessageOutlined />}
                                tooltip="Contact Support"
                                onClick={() => navigate('/contact')}
                            />
                            <FloatButton
                                icon={<DownloadOutlined />}
                                tooltip="Download App"
                                onClick={() => {
                                    // Téléchargement de l'app
                                }}
                            />
                        </FloatButton.Group>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;