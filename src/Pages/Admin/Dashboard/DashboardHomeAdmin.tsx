import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    Statistic,
    Table,
    Tag,
    Spin,
    Row,
    Col,
    Progress,
    Alert,
} from 'antd';
import {
    LoginOutlined,
    TeamOutlined,
    ExperimentOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    BookOutlined,
    TrophyOutlined,
    LineChartOutlined,
    PieChartOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import {
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';
import { useGetRapportGlobalAdmin } from '../../../Services/Admin/Dashboard/useGetRapportGlobalAdmin';
import { useGetRapportUsage } from '../../../Services/Admin/Dashboard/useGetRapportUsage';
import { useGetClassDashboard } from '../../../Services/Analytics/useGetClassDashboard';
import { useTranslation } from 'react-i18next';


// Types
interface PeakHour {
    hour: number;
    count: number;
}

interface UsageTrend {
    date: string;
    attempts: number;
    unique_users: number;
}

interface RoleDistribution {
    role: string;
    count: number;
}

interface TopStudent {
    student__username: string;
    student__first_name: string;
    student__last_name: string;
    avg_progress: number;
    total_score: number;
}

interface SubjectPerformance {
    name: string;
    grade: number;
    avg_progress: number | null;
    total_students: number;
}

interface UnitByDifficulty {
    difficulty: string;
    count: number;
}



// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
const DIFFICULTY_COLORS = {
    easy: '#52c41a',
    medium: '#faad14',
    hard: '#ff4d4f'
};

const DashboardHomeAdmin: React.FC = () => {
    const { t } = useTranslation();

    // Fetch data
    const { data: DataDashboardAdmin, isPending: isPendingGlobal } = useGetRapportGlobalAdmin();
    const { data: dataDashboardUsage, isPending: isPendingUsage } = useGetRapportUsage();
    const { data: classDashboard } = useGetClassDashboard();

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const statCardVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15,
            },
        },
        hover: {
            scale: 1.02,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 10,
            },
        },
    };

    // Formatage des heures
    const formatHour = (hour: number) => {
        return `${hour}:00`;
    };

    // Préparation des données pour les graphiques
    const peakHoursData = (dataDashboardUsage?.peak_usage_hours ?? [])
        .slice()
        .sort((a: PeakHour, b: PeakHour) => a.hour - b.hour)
        .map((item: PeakHour) => ({
            ...item,
            hour: formatHour(item.hour)
        }));

    const usageTrendData = (dataDashboardUsage?.usage_trend ?? []).filter((item: UsageTrend) => {
        const date = new Date(item.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
    });

    const roleDistributionData = (DataDashboardAdmin?.user_analytics?.role_distribution ?? []).map(
        (item: RoleDistribution) => ({
            ...item,
            name: t(`dashboard_admin.users.${item.role}`),
            value: item.count
        })
    );

    const unitsByDifficultyData = (DataDashboardAdmin?.content_analytics?.units_by_difficulty ?? []).map(
        (item: UnitByDifficulty) => ({
            ...item,
            name: t(`dashboard_admin.content.${item.difficulty}`),
            value: item.count
        })
    );

    // Loading state
    if (isPendingGlobal || isPendingUsage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Spin size="large" tip={t('dashboard_admin.common.loading')}>
                    <div className="p-8 rounded-lg bg-white shadow-xl">
                        <div className="text-center">
                            <DashboardOutlined className="text-4xl text-blue-500 animate-spin" />
                            <p className="mt-4 text-gray-600">{t('dashboard_admin.common.loading')}</p>
                        </div>
                    </div>
                </Spin>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface p-4 md:p-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                {t('dashboard_admin.dashboard.title')}
                            </h1>
                            <p className="text-gray-600 flex items-center text-sm md:text-base">
                                <ClockCircleOutlined className="ml-2" />
                                {/* {t('dashboard_admin.dashboard.generated_at')}: {new Date(DataDashboardAdmin?.generated_at || '').toLocaleString('fr')} */}
                                {/* {t('dashboard_admin.dashboard.generated_at')}: */}
                                {new Date(DataDashboardAdmin?.generated_at || '').toLocaleString('fr-FR', {
                                    timeZone: 'UTC'
                                })}
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white p-3 rounded-full shadow-lg cursor-pointer"
                        >
                            <DashboardOutlined className="text-2xl md:text-3xl text-blue-500" />
                        </motion.div>
                    </div>
                </motion.div>

                {classDashboard && (
                    <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                        <Alert
                            type="info"
                            showIcon
                            message={t('analytics.class_overview')}
                            description={
                                <Row gutter={16} className="mt-2">
                                    <Col xs={12} md={6}>
                                        <Statistic title={t('analytics.total_students')} value={classDashboard.total_students ?? classDashboard.summary?.total_students ?? '—'} />
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Statistic title={t('analytics.avg_progress')} value={classDashboard.avg_progress ?? classDashboard.summary?.avg_progress ?? '—'} suffix="%" />
                                    </Col>
                                </Row>
                            }
                            className="rounded-xl border-0 shadow-sm"
                        />
                    </motion.div>
                )}

                {/* Quick Stats Cards */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <motion.div variants={{ statCardVariants }} whileHover="hover" className="h-full">
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-blue-500">
                                    <Statistic
                                        title={<span className="text-gray-600 text-sm">{t('dashboard_admin.stats.total_users')}</span>}
                                        value={DataDashboardAdmin?.user_analytics?.total_users ?? 0}
                                        prefix={<TeamOutlined className="text-blue-500" />}
                                        valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                                    />
                                    <div className="mt-2 text-xs md:text-sm text-gray-500">
                                        {t('dashboard_admin.users.new_users')}: {DataDashboardAdmin?.user_analytics?.new_users_last_30_days ?? 0}
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <motion.div variants={{ statCardVariants }} whileHover="hover" className="h-full">
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-green-500">
                                    <Statistic
                                        title={<span className="text-gray-600 text-sm">{t('dashboard_admin.stats.total_logins')}</span>}
                                        value={DataDashboardAdmin?.usage_analytics?.total_logins ?? 0}
                                        prefix={<LoginOutlined className="text-green-500" />}
                                        valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                                    />
                                    <div className="mt-2 text-xs md:text-sm text-gray-500">
                                        {t('dashboard_admin.stats.daily_active_users')}: {DataDashboardAdmin?.usage_analytics?.daily_active_users ?? 0}
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <motion.div variants={{ statCardVariants }} whileHover="hover" className="h-full">
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-orange-500">
                                    <Statistic
                                        title={<span className="text-gray-600 text-sm">{t('dashboard_admin.stats.total_activities')}</span>}
                                        value={DataDashboardAdmin?.usage_analytics?.total_activities_completed ?? 0}
                                        prefix={<ExperimentOutlined className="text-orange-500" />}
                                        valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
                                    />
                                    <Progress
                                        percent={Number((DataDashboardAdmin?.performance_analytics?.overall_success_rate ?? 0).toFixed(1))}
                                        size="small"
                                        status="active"
                                        className="mt-2"
                                        format={(percent) => (
                                            <span className="text-xs">{percent}% {t('dashboard_admin.stats.success_rate')}</span>
                                        )}
                                    />
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <motion.div variants={{ statCardVariants }} whileHover="hover" className="h-full">
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-purple-500">
                                    <Statistic
                                        title={<span className="text-gray-600 text-sm">{t('dashboard_admin.stats.avg_session_duration')}</span>}
                                        value={(DataDashboardAdmin?.usage_analytics?.avg_session_duration ?? 0).toFixed(1)}
                                        prefix={<ClockCircleOutlined className="text-purple-500" />}
                                        valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
                                        suffix={t('dashboard_admin.stats.minutes')}
                                    />
                                    <div className="mt-2 text-xs md:text-sm text-gray-500">
                                        {t('dashboard_admin.users.active_rate')}: {DataDashboardAdmin?.user_analytics?.active_users_rate ?? 0}%
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>

                {/* Charts Section */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <BarChartOutlined className="ml-2 text-blue-500" />
                                            <span className="text-base md:text-lg">{t('dashboard_admin.charts.peak_usage')}</span>
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={peakHoursData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hour" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#1890ff" name={t('dashboard_admin.charts.count')} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <PieChartOutlined className="ml-2 text-green-500" />
                                            <span className="text-base md:text-lg">{t('dashboard_admin.users.role_distribution')}</span>
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={roleDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {roleDistributionData?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} accentHeight={entry} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>

                {/* Usage Trend */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card
                            title={
                                <span className="flex items-center">
                                    <LineChartOutlined className="ml-2 text-purple-500" />
                                    <span className="text-base md:text-lg">{t('dashboard_admin.charts.usage_trend')}</span>
                                </span>
                            }
                            className="hover:shadow-lg transition-shadow duration-300"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={usageTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="attempts" fill="#8884d8" name={t('dashboard_admin.charts.attempts')} />
                                    <Line yAxisId="right" type="monotone" dataKey="unique_users" stroke="#ff7300" name={t('dashboard_admin.charts.users')} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Performance Analytics */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <TrophyOutlined className="ml-2 text-yellow-500" />
                                            <span className="text-base md:text-lg">{t('dashboard_admin.performance.top_students')}</span>
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <Table
                                        dataSource={DataDashboardAdmin?.performance_analytics?.top_performing_students ?? []}
                                        rowKey="student__username"
                                        pagination={false}
                                        size="small"
                                    >
                                        <Table.Column
                                            title={t('dashboard_admin.performance.student_name')}
                                            render={(_: any, record: TopStudent) => (
                                                <span className="font-semibold">
                                                    {record.student__first_name} {record.student__last_name}
                                                </span>
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.performance.avg_progress')}
                                            render={(record: TopStudent) => (
                                                <Progress
                                                    percent={Number((record.avg_progress ?? 0).toFixed(1))}
                                                    size="small"
                                                    status="active"
                                                    strokeColor={(record.avg_progress ?? 0) > 70 ? '#52c41a' : '#faad14'}
                                                />
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.performance.total_score')}
                                            dataIndex="total_score"
                                            render={(score: number) => (
                                                <Tag color="blue">{score}</Tag>
                                            )}
                                        />
                                    </Table>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <BookOutlined className="ml-2 text-blue-500" />
                                            {/* <span className="text-base md:text-lg">{t('dashboard_admin.subjects.title')}</span> */}
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <Table
                                        dataSource={(DataDashboardAdmin?.performance_analytics?.subject_performance ?? []).filter(s => s.total_students > 0)}
                                        rowKey="name"
                                        pagination={false}
                                        size="small"
                                    >
                                        <Table.Column
                                            title={t('dashboard_admin.subjects.subject')}
                                            dataIndex="name"
                                            render={(text: string) => (
                                                <span className="font-semibold">{text}</span>
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.subjects.grade')}
                                            dataIndex="grade"
                                            render={(grade: number) => (
                                                <Tag color="geekblue">{t('dashboard_admin.subjects.grade')} {grade}</Tag>
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.subjects.avg_progress')}
                                            render={(record: SubjectPerformance) => (
                                                <Progress
                                                    percent={Number(record.avg_progress?.toFixed(1)) || 0}
                                                    size="small"
                                                    status="active"
                                                />
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.subjects.total_students')}
                                            dataIndex="total_students"
                                            render={(count: number) => (
                                                <Tag color="green">{count}</Tag>
                                            )}
                                        />
                                    </Table>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>

                {/* Content Analytics */}
                <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <BookOutlined className="ml-2 text-green-500" />
                                            <span className="text-base md:text-lg">{t('dashboard_admin.content.most_accessed')}</span>
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <Table
                                        dataSource={(DataDashboardAdmin?.content_analytics?.most_accessed_units ?? []).filter(u => u.access_count > 0)}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                    >
                                        <Table.Column
                                            title={t('dashboard_admin.content.unit_title')}
                                            dataIndex="title"
                                            render={(text: string) => (
                                                <span className="font-semibold">{text}</span>
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.content.difficulty')}
                                            dataIndex="difficulty"
                                            render={(difficulty: string) => (
                                                <Tag color={DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]}>
                                                    {t(`dashboard_admin.content.${difficulty}`)}
                                                </Tag>
                                            )}
                                        />
                                        <Table.Column
                                            title={t('dashboard_admin.content.access_count')}
                                            dataIndex="access_count"
                                            render={(count: number) => (
                                                <Tag color="blue">{count}</Tag>
                                            )}
                                        />
                                    </Table>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <Card
                                    title={
                                        <span className="flex items-center">
                                            <PieChartOutlined className="ml-2 text-orange-500" />
                                            <span className="text-base md:text-lg">{t('dashboard_admin.charts.units_by_difficulty')}</span>
                                        </span>
                                    }
                                    className="hover:shadow-lg transition-shadow duration-300"
                                >
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={unitsByDifficultyData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                                outerRadius={60}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {unitsByDifficultyData?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 flex justify-around">
                                        <div className="text-center">
                                            <Statistic
                                                title={t('dashboard_admin.stats.total_units')}
                                                value={DataDashboardAdmin?.content_analytics?.total_units ?? 0}
                                                valueStyle={{ fontSize: '20px' }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <Statistic
                                                title={t('dashboard_admin.stats.published_units')}
                                                value={DataDashboardAdmin?.content_analytics?.published_units ?? 0}
                                                valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>

                {/* Struggling Students Alert */}
                {(DataDashboardAdmin?.performance_analytics?.struggling_students?.length ?? 0) === 0 && (
                    <motion.div variants={{ itemVariants }}>
                        <Alert
                            message={t('dashboard_admin.performance.no_struggling')}
                            type="success"
                            showIcon
                            icon={<TrophyOutlined />}
                            className="mb-6"
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default DashboardHomeAdmin;