import React from 'react';
import {
    Card,
    Row,
    Col,
    Avatar,
    Tag,
    Button,
    Descriptions,
    Statistic,
    Divider,
    Timeline,
    Progress,
    Tabs,
    Space,
    Badge,
    List,
    Typography,
    Modal
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    TeamOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
    StarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BankOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Animations
const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: -50
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
        }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface DetailsStudentProps {
    student: any;
    visible: boolean;
    onClose: () => void;
}

const DetailsStudent: React.FC<DetailsStudentProps> = ({
    student,
    visible,
    onClose
}) => {
    const { t } = useTranslation();

    if (!student) return null;

    // Données de performance simulées (à remplacer par des données réelles)
    const performanceData = [
        { subject: 'Mathématiques', score: 85, color: '#1890ff' },
        { subject: 'Physique', score: 78, color: '#52c41a' },
        { subject: 'Chimie', score: 92, color: '#faad14' },
        { subject: 'Informatique', score: 88, color: '#722ed1' },
        { subject: 'Anglais', score: 76, color: '#eb2f96' },
    ];

    // Historique d'activité simulé
    const activityHistory = [
        {
            time: dayjs().subtract(1, 'day').format('DD/MM/YYYY'),
            action: 'Soumission de devoir',
            description: 'Devoir de Mathématiques soumis',
            color: 'blue'
        },
        {
            time: dayjs().subtract(3, 'day').format('DD/MM/YYYY'),
            action: 'Participation en classe',
            description: 'Participation active au cours de Physique',
            color: 'green'
        },
        {
            time: dayjs().subtract(7, 'day').format('DD/MM/YYYY'),
            action: 'Examen',
            description: 'Examen de Chimie terminé',
            color: 'orange'
        },
        {
            time: dayjs().subtract(15, 'day').format('DD/MM/YYYY'),
            action: 'Réunion parent-professeur',
            description: 'Discussion des progrès académiques',
            color: 'purple'
        },
    ];

    const totalScore = performanceData?.reduce((sum, item) => sum + item.score, 0);
    const averageScore = totalScore / performanceData.length;
    const attendanceRate = 94; // Pourcentage simulé
    const completionRate = 87; // Pourcentage simulé

    // Formatage des dates
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            className="details-student-modal"
            closable={true}
            centered
        >
            <motion.div
                variants={{ modalVariants }}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-lg"
            >
                {/* Header avec photo et infos principales */}
                <motion.div variants={staggerChildren}>
                    <Card className="border-0 shadow-none">
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} sm={8} md={6}>
                                <motion.div
                                    variants={{ fadeInUp }}
                                    className="flex justify-center"
                                >
                                    <Avatar
                                        size={120}
                                        src={student.user?.profile_image}
                                        icon={<UserOutlined />}
                                        className="border-4 border-white shadow-lg"
                                        style={{
                                            backgroundColor: student.user?.is_active ? '#1890ff' : '#d9d9d9'
                                        }}
                                    />
                                </motion.div>
                            </Col>

                            <Col xs={24} sm={16} md={18}>
                                <motion.div variants={{ fadeInUp }}>
                                    <Space direction="vertical" size="small" className="w-full">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Title level={2} className="!mb-0">
                                                {student.user?.first_name} {student.user?.last_name}
                                            </Title>
                                            <Badge
                                                status={student.user?.is_active ? "success" : "error"}
                                                text={
                                                    <Text type={student.user?.is_active ? "success" : "danger"}>
                                                        {student.user?.is_active
                                                            ? t('students.status.active')
                                                            : t('students.status.inactive')}
                                                    </Text>
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <Space>
                                                <IdcardOutlined className="text-gray-400" />
                                                <Text strong>ID:</Text>
                                                <Text code>{student.id}</Text>
                                            </Space>

                                            <Space>
                                                <TeamOutlined className="text-gray-400" />
                                                <Text strong>{t('students.details.grade')}:</Text>
                                                <Tag color="blue">{student.user?.grade || 'N/A'}</Tag>
                                            </Space>

                                            <Space>
                                                <BankOutlined className="text-gray-400" />
                                                <Text strong>{t('students.details.school')}:</Text>
                                                <Text>{student.user?.school || 'N/A'}</Text>
                                            </Space>
                                        </div>

                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <Button
                                                icon={<MailOutlined />}
                                                type="primary"
                                                ghost
                                                href={`mailto:${student.user?.email}`}
                                            >
                                                {t('students.details.sendEmail')}
                                            </Button>

                                            <Button
                                                icon={<PhoneOutlined />}
                                                href={`tel:${student.user?.phone_number}`}
                                            >
                                                {t('students.details.call')}
                                            </Button>
                                        </div>
                                    </Space>
                                </motion.div>
                            </Col>
                        </Row>
                    </Card>

                    <Divider className="my-4" />

                    {/* Onglets */}
                    <Tabs
                        activeKey="personal"
                        className="px-6"
                    >
                        {/* Onglet Informations Personnelles */}
                        <TabPane
                            tab={
                                <span>
                                    <UserOutlined />
                                    {t('students.details.personalInfo')}
                                </span>
                            }
                            key="personal"
                        >
                            <motion.div variants={staggerChildren}>
                                <Row gutter={[24, 24]}>
                                    {/* Informations Personnelles */}
                                    <Col xs={24} md={12}>
                                        <Card
                                            title={
                                                <span className="flex items-center">
                                                    <UserOutlined className="mr-2" />
                                                    {t('students.details.personalDetails')}
                                                </span>
                                            }
                                            className="shadow-sm"
                                        >
                                            <Descriptions column={1}>
                                                <Descriptions.Item label={t('students.details.fullName')}>
                                                    <Text strong>
                                                        {student.user?.first_name} {student.user?.last_name}
                                                    </Text>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.username')}>
                                                    <Tag icon={<UserOutlined />} color="default">
                                                        {student.user?.username}
                                                    </Tag>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.email')}>
                                                    <Space>
                                                        <MailOutlined className="text-gray-400" />
                                                        <a href={`mailto:${student.user?.email}`}>
                                                            {student.user?.email}
                                                        </a>
                                                    </Space>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.phone')}>
                                                    <Space>
                                                        <PhoneOutlined className="text-gray-400" />
                                                        <a href={`tel:${student.user?.phone_number}`}>
                                                            {student.user?.phone_number}
                                                        </a>
                                                    </Space>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.address')}>
                                                    <Space>
                                                        <HomeOutlined className="text-gray-400" />
                                                        <Text>{student.address || t('students.details.noAddress')}</Text>
                                                    </Space>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.registrationDate')}>
                                                    <Space>
                                                        <CalendarOutlined className="text-gray-400" />
                                                        <Text>{formatDate(student.user?.date_joined)}</Text>
                                                    </Space>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>

                                    {/* Informations Parents */}
                                    <Col xs={24} md={12}>
                                        <Card
                                            title={
                                                <span className="flex items-center">
                                                    <TeamOutlined className="mr-2" />
                                                    {t('students.details.parentInfo')}
                                                </span>
                                            }
                                            className="shadow-sm"
                                        >
                                            <Descriptions column={1}>
                                                <Descriptions.Item label={t('students.details.parentName')}>
                                                    <Text>{student.parent_name || t('students.details.notSpecified')}</Text>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.parentPhone')}>
                                                    {student.parent_phone ? (
                                                        <Space>
                                                            <PhoneOutlined className="text-gray-400" />
                                                            <a href={`tel:${student.parent_phone}`}>
                                                                {student.parent_phone}
                                                            </a>
                                                        </Space>
                                                    ) : (
                                                        <Text>{t('students.details.notSpecified')}</Text>
                                                    )}
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.enrollmentDate')}>
                                                    <Space>
                                                        <CalendarOutlined className="text-gray-400" />
                                                        <Text>
                                                            {student.enrollment_date
                                                                ? dayjs(student.enrollment_date).format('DD/MM/YYYY')
                                                                : t('students.details.notSpecified')}
                                                        </Text>
                                                    </Space>
                                                </Descriptions.Item>

                                                <Descriptions.Item label={t('students.details.lastLogin')}>
                                                    <Space>
                                                        <ClockCircleOutlined className="text-gray-400" />
                                                        <Text>
                                                            {student.user?.last_login
                                                                ? formatDate(student.user.last_login)
                                                                : t('students.details.neverLoggedIn')}
                                                        </Text>
                                                    </Space>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>

                                    {/* Statistiques Rapides */}
                                    <Col xs={24}>
                                        <Card
                                            title={
                                                <span className="flex items-center">
                                                    <BarChartOutlined className="mr-2" />
                                                    {t('students.details.quickStats')}
                                                </span>
                                            }
                                            className="shadow-sm"
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title={t('students.details.averageScore')}
                                                        value={averageScore}
                                                        precision={1}
                                                        suffix="/100"
                                                        prefix={<StarOutlined />}
                                                        valueStyle={{
                                                            color: averageScore >= 80 ? '#3f8600' :
                                                                averageScore >= 60 ? '#faad14' : '#cf1322'
                                                        }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title={t('students.details.attendance')}
                                                        value={attendanceRate}
                                                        suffix="%"
                                                        prefix={<CheckCircleOutlined />}
                                                        valueStyle={{
                                                            color: attendanceRate >= 90 ? '#3f8600' :
                                                                attendanceRate >= 75 ? '#faad14' : '#cf1322'
                                                        }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title={t('students.details.completion')}
                                                        value={completionRate}
                                                        suffix="%"
                                                        prefix={<SafetyCertificateOutlined />}
                                                        valueStyle={{
                                                            color: completionRate >= 85 ? '#3f8600' :
                                                                completionRate >= 70 ? '#faad14' : '#cf1322'
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                </Row>
                            </motion.div>
                        </TabPane>

                        {/* Onglet Performance */}
                        <TabPane
                            tab={
                                <span>
                                    <BarChartOutlined />
                                    {t('students.details.performance')}
                                </span>
                            }
                            key="performance"
                        >
                            <motion.div variants={staggerChildren}>
                                <Row gutter={[24, 24]}>
                                    <Col xs={24}>
                                        <Card
                                            title={t('students.details.subjectsPerformance')}
                                            className="shadow-sm"
                                        >
                                            <List
                                                dataSource={performanceData}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        <div className="w-full">
                                                            <div className="flex justify-between mb-2">
                                                                <Text strong>{item.subject}</Text>
                                                                <Tag color={item.score >= 80 ? "success" :
                                                                    item.score >= 60 ? "warning" : "error"}>
                                                                    {item.score}/100
                                                                </Tag>
                                                            </div>
                                                            <Progress
                                                                percent={item.score}
                                                                strokeColor={item.color}
                                                                showInfo={false}
                                                                strokeLinecap="round"
                                                            />
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </motion.div>
                        </TabPane>

                        {/* Onglet Activité */}
                        <TabPane
                            tab={
                                <span>
                                    <ClockCircleOutlined />
                                    {t('students.details.activity')}
                                </span>
                            }
                            key="activity"
                        >
                            <motion.div variants={staggerChildren}>
                                <Card className="shadow-sm">
                                    <Timeline>
                                        {activityHistory.map((activity, index) => (
                                            <Timeline.Item
                                                key={index}
                                                color={activity.color}
                                                dot={activity.color === 'green' ? <CheckCircleOutlined /> :
                                                    activity.color === 'red' ? <CloseCircleOutlined /> :
                                                        <ClockCircleOutlined />}
                                            >
                                                <Space direction="vertical" size={0}>
                                                    <Text strong>{activity.action}</Text>
                                                    <Text type="secondary">{activity.description}</Text>
                                                    <Text type="secondary" className="text-xs">
                                                        {activity.time}
                                                    </Text>
                                                </Space>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </Card>
                            </motion.div>
                        </TabPane>
                    </Tabs>

                    {/* Footer */}
                    <Divider className="my-4" />

                    <div className="flex justify-end px-6 pb-4">
                        <Space>
                            <Button onClick={onClose}>
                                {t('common.close')}
                            </Button>
                        </Space>
                    </div>
                </motion.div>
            </motion.div>
        </Modal>
    );
};

export default DetailsStudent;