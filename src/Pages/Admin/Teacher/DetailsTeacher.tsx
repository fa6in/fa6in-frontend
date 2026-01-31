import React from "react";
import {
    Modal,
    Descriptions,
    Tag,
    Avatar,
    Row,
    Col,
    Card,
    Statistic,
    Timeline,
    Badge,
    Space,
    Button,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    BookOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BankOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Teacher } from "../../../Services/Admin/Teacher/typeTeacher";

interface DetailsTeacherProps {
    teacher: Teacher | null;
    visible: boolean;
    onClose: () => void;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const DetailsTeacher: React.FC<DetailsTeacherProps> = ({
    teacher,
    visible,
    onClose
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    if (!teacher) return null;

    const getStatusConfig = (isActive: boolean) => {
        return isActive
            ? {
                color: "green",
                text: t("teachers.status.active"),
                icon: <CheckCircleOutlined />
            }
            : {
                color: "red",
                text: t("teachers.status.inactive"),
                icon: <CloseCircleOutlined />
            };
    };

    const statusConfig = getStatusConfig(teacher.user.is_active);

    const formatDate = (dateString?: string) => {
        if (!dateString) return t("teachers.common.notSpecified");
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateExperience = () => {
        if (!teacher.years_of_experience) return t("teachers.common.notSpecified");
        return `${teacher.years_of_experience} ${t("teachers.yearsOfExperience")}`;
    };

    const renderSubjects = () => {
        if (!teacher.subjects) {
            return <Tag color="default">{t("teachers.common.notSpecified")}</Tag>;
        }

        const subjectsArray = teacher.subjects.split(',').filter(s => s.trim() !== '');
        if (subjectsArray.length === 0) {
            return <Tag color="default">{t("teachers.common.notSpecified")}</Tag>;
        }

        return (
            <div className="flex flex-wrap gap-2">
                {subjectsArray.map((subject, index) => (
                    <Tag key={index} color="blue" className="rounded-full px-3">
                        {subject.trim()}
                    </Tag>
                ))}
            </div>
        );
    };

    return (
        <Modal
            title={
                <div className="flex items-center space-x-3" style={isRTL ? { direction: 'rtl' } : {}}>
                    <Avatar
                        size="large"
                        src={teacher.user.profile_image}
                        icon={!teacher.user.profile_image && <UserOutlined />}
                        className="border-2 border-white shadow-md"
                    />
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h2 className="text-xl font-bold m-0">
                            {teacher.user.first_name} {teacher.user.last_name}
                        </h2>
                        <div className="text-gray-500 text-sm">
                            @{teacher.user.username}
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t("teachers.common.close")}
                </Button>,
                
            ]}
            className="teacher-details-modal"
            maskClosable={false}
            style={isRTL ? { direction: 'rtl' } : {}}
        >
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* En-tête avec statistiques */}
                <motion.div variants={{ fadeInUp }}>
                    <Card className="rounded-xl border-0 shadow-sm">
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={8}>
                                <div className="flex justify-center sm:justify-start">
                                    <Avatar
                                        size={120}
                                        src={teacher.user.profile_image}
                                        icon={!teacher.user.profile_image && <UserOutlined />}
                                        className="border-4 border-white shadow-lg"
                                    />
                                </div>
                            </Col>
                            <Col xs={24} sm={16}>
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className={isRTL ? 'text-right' : 'text-left'}>
                                            <h3 className="text-xl font-bold m-0 text-gray-800">
                                                {teacher.user.first_name} {teacher.user.last_name}
                                            </h3>
                                            <p className="text-gray-500 m-0 flex items-center gap-2 mt-1">
                                                <MailOutlined />
                                                {teacher.user.email}
                                            </p>
                                            <p className="text-gray-500 m-0 flex items-center gap-2 mt-1">
                                                <IdcardOutlined />
                                                @{teacher.user.username}
                                            </p>
                                        </div>
                                        <Badge
                                            status={statusConfig.color as any}
                                            text={
                                                <span className="font-medium">
                                                    {statusConfig.text}
                                                </span>
                                            }
                                            className="px-3 py-1.5 rounded-full"
                                            style={{
                                                backgroundColor: `${statusConfig.color}10`,
                                                border: `1px solid ${statusConfig.color}30`
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Tag icon={<BookOutlined />} color="blue" className="px-4 py-1.5">
                                            {teacher.qualification || t("teachers.common.notSpecified")}
                                        </Tag>
                                        <Tag icon={<TrophyOutlined />} color="gold" className="px-4 py-1.5">
                                            {calculateExperience()}
                                        </Tag>
                                        {teacher.user.school && (
                                            <Tag icon={<BankOutlined />} color="purple" className="px-4 py-1.5">
                                                {teacher.user.school}
                                            </Tag>
                                        )}
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>

                {/* Cartes de statistiques */}
                <motion.div variants={{ fadeInUp }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card className="rounded-xl text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <Statistic
                                    title={t("teachers.details.experienceYears")}
                                    value={teacher.years_of_experience || 0}
                                    prefix={<TrophyOutlined className="mr-2" />}
                                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                                    suffix={t("teachers.years")}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="rounded-xl text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <Statistic
                                    title={t("teachers.details.accountAge")}
                                    value={(() => {
                                        const joinDate = new Date(teacher.user.date_joined);
                                        const now = new Date();
                                        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return diffDays;
                                    })()}
                                    prefix={<CalendarOutlined className="mr-2" />}
                                    valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                                    suffix={t("teachers.days")}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="rounded-xl text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-bold mb-2" style={{
                                        color: teacher.user.is_active ? '#52c41a' : '#ff4d4f'
                                    }}>
                                        {teacher.user.is_active ?
                                            t("teachers.status.active") :
                                            t("teachers.status.inactive")
                                        }
                                    </div>
                                    <div className="text-gray-500">
                                        {t("teachers.details.status")}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </motion.div>

                {/* Informations personnelles */}
                <motion.div variants={{ fadeInUp }}>
                    <Card
                        title={
                            <div className="flex items-center">
                                <UserOutlined className="mr-2" />
                                {t("teachers.details.personalInfo")}
                            </div>
                        }
                        className="rounded-xl border-0 shadow-sm"
                    >
                        <Descriptions
                            column={{ xs: 1, sm: 2 }}
                            size="middle"
                            labelStyle={{ fontWeight: 600 }}
                            contentStyle={{ color: '#333' }}
                        >
                            <Descriptions.Item label={t("teachers.details.fullName")}>
                                {teacher.user.first_name} {teacher.user.last_name}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.username")}>
                                @{teacher.user.username}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.email")}>
                                <div className="flex items-center gap-2">
                                    <MailOutlined />
                                    {teacher.user.email}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.phone")}>
                                <div className="flex items-center gap-2">
                                    <PhoneOutlined />
                                    {teacher.user.phone_number || t("teachers.common.notSpecified")}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.role")}>
                                <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                                    {teacher.user.role}
                                </Tag>
                            </Descriptions.Item>
                            {teacher.user.school && (
                                <Descriptions.Item label={t("teachers.details.school")}>
                                    <div className="flex items-center gap-2">
                                        <BankOutlined />
                                        {teacher.user.school}
                                    </div>
                                </Descriptions.Item>
                            )}
                            {teacher.user.grade && (
                                <Descriptions.Item label={t("teachers.details.grade")}>
                                    {teacher.user.grade}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </motion.div>

                {/* Informations professionnelles */}
                <motion.div variants={{ fadeInUp }}>
                    <Card
                        title={
                            <div className="flex items-center">
                                <BookOutlined className="mr-2" />
                                {t("teachers.details.professionalInfo")}
                            </div>
                        }
                        className="rounded-xl border-0 shadow-sm"
                    >
                        <Descriptions
                            column={{ xs: 1, sm: 2 }}
                            size="middle"
                            labelStyle={{ fontWeight: 600 }}
                        >
                            <Descriptions.Item label={t("teachers.details.qualification")}>
                                {teacher.qualification || t("teachers.common.notSpecified")}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.experience")}>
                                {calculateExperience()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.subjects")} span={2}>
                                {renderSubjects()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("teachers.details.teacherStatus")}>
                                <Badge
                                    status={teacher.is_active ? "success" : "error"}
                                    text={
                                        <span className={teacher.is_active ? "text-green-600" : "text-red-600"}>
                                            {teacher.is_active ?
                                                t("teachers.status.active") :
                                                t("teachers.status.inactive")
                                            }
                                        </span>
                                    }
                                />
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </motion.div>

                {/* Historique du compte */}
                <motion.div variants={{ fadeInUp }}>
                    <Card
                        title={
                            <div className="flex items-center">
                                <ClockCircleOutlined className="mr-2" />
                                {t("teachers.details.accountHistory")}
                            </div>
                        }
                        className="rounded-xl border-0 shadow-sm"
                    >
                        <Timeline
                            mode="left"
                            items={[
                                {
                                    color: 'green',
                                    dot: <CalendarOutlined />,
                                    children: (
                                        <div>
                                            <div className="font-semibold">
                                                {t("teachers.details.accountCreated")}
                                            </div>
                                            <div className="text-gray-600">
                                                {formatDate(teacher.user.date_joined)}
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    color: 'blue',
                                    dot: <ClockCircleOutlined />,
                                    children: (
                                        <div>
                                            <div className="font-semibold">
                                                {t("teachers.details.lastLogin")}
                                            </div>
                                            <div className="text-gray-600">
                                                {teacher.user.last_login ?
                                                    formatDate(teacher.user.last_login) :
                                                    t("teachers.details.neverLoggedIn")
                                                }
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    color: teacher.user.is_active ? 'green' : 'red',
                                    dot: teacher.user.is_active ?
                                        <CheckCircleOutlined /> :
                                        <CloseCircleOutlined />,
                                    children: (
                                        <div>
                                            <div className="font-semibold">
                                                {t("teachers.details.currentStatus")}
                                            </div>
                                            <div className={teacher.user.is_active ? "text-green-600" : "text-red-600"}>
                                                {teacher.user.is_active ?
                                                    t("teachers.status.active") :
                                                    t("teachers.status.inactive")
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </motion.div>


            </motion.div>
        </Modal>
    );
};

export default DetailsTeacher;
