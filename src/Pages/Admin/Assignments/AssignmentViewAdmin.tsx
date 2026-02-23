// src/pages/AssignmentViewAdmin.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    Tag,
    Typography,
    Progress,
    Button,
    Radio,
    Input,
    Space,
    Alert,
    Select,
    Spin,
    Modal,
    Tabs,
    Collapse,
    Table,
    Avatar
} from 'antd';
import {
    CheckCircleOutlined,
    QuestionCircleOutlined,
    BulbOutlined,
    CloseOutlined,
    BookOutlined,
    FileTextOutlined,
    CheckSquareOutlined,
    FormOutlined,
    ClockCircleOutlined,
    UserOutlined,
    BarChartOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useGetAssignmentActivity from '../../../Services/Admin/Assignments/useGetAssignement';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import AddNewAssignment from './AddNewAssignement';
import useGetAllActivityEtudiant, { type ActivityAllType } from '../../../Services/Admin/Assignments/useGetAllActiviyEtudiant';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Types pour les activités
interface BaseActivity {
    id: number;
    title: string;
    activity_type: 'multiple_choice' | 'true_false' | 'fill_blank';
    question: string;
    points: number;
    explanation?: string;
    time_limit?: number;
    order: number;
    is_active: boolean;
    unit_title?: string;
    unit?: number;
}

interface MultipleChoiceActivity extends BaseActivity {
    activity_type: 'multiple_choice';
    options: string[];
    correct_answer: number;
}

interface TrueFalseActivity extends BaseActivity {
    activity_type: 'true_false';
    options: ['صح', 'خطأ'];
    correct_answer: 0 | 1;
}

interface FillBlankActivity extends BaseActivity {
    activity_type: 'fill_blank';
    correct_answer: string;
}

interface GroupedActivities {
    multiple_choice: MultipleChoiceActivity[];
    true_false: TrueFalseActivity[];
    fill_blank: FillBlankActivity[];
}

// Interface pour les réponses des étudiants


// Interface pour les statistiques d'une activité
interface ActivityStats {
    totalAttempts: number;
    correctCount: number;
    incorrectCount: number;
    averageScore: number;
    averageTime: number;
    successRate: number;
}

// Modal pour afficher les résultats d'une activité
interface ActivityResultsModalProps {
    visible: boolean;
    onCancel: () => void;
    activity: BaseActivity | null;
    responses: ActivityAllType[];
}

const ActivityResultsModal: React.FC<ActivityResultsModalProps> = ({
    visible,
    onCancel,
    activity,
    responses
}) => {
    const { t } = useTranslation();

    if (!activity) return null;

    // Filtrer les réponses pour cette activité
    const activityResponses = responses.filter(r => r.activity === activity.id);

    // Calculer les statistiques
    const stats: ActivityStats = {
        totalAttempts: activityResponses.length,
        correctCount: activityResponses.filter(r => r?.is_correct).length,
        incorrectCount: activityResponses.filter(r => !r?.is_correct).length,
        averageScore: activityResponses.length > 0
            ? activityResponses.reduce((acc, r) => acc + r?.score, 0) / activityResponses?.length
            : 0,
        averageTime: activityResponses.length > 0
            ? activityResponses.reduce((acc, r) => acc + r?.time_taken, 0) / activityResponses?.length
            : 0,
        successRate: activityResponses.length > 0
            ? (activityResponses.filter(r => r?.is_correct).length / activityResponses?.length) * 100
            : 0
    };

    const columns = [
        {
            title: t('assignment.student'),
            dataIndex: 'student_name',
            key: 'student_name',
            render: (text: string) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <Text>{text}</Text>
                </Space>
            )
        },
        {
            title: t('assignment.answer'),
            dataIndex: 'answer',
            key: 'answer',
            render: (answer: number) => {
                if (activity.activity_type === 'multiple_choice' && (activity as MultipleChoiceActivity).options) {
                    const mcActivity = activity as MultipleChoiceActivity;
                    return mcActivity.options[answer] || answer;
                } else if (activity.activity_type === 'true_false') {
                    return answer === 0 ? 'صح' : 'خطأ';
                } else {
                    return answer;
                }
            }
        },
        {
            title: t('assignment.result'),
            dataIndex: 'is_correct',
            key: 'is_correct',
            render: (isCorrect: boolean) => (
                isCorrect ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        {t('assignment.correct')}
                    </Tag>
                ) : (
                    <Tag color="red" icon={<CloseOutlined />}>
                        {t('assignment.incorrect')}
                    </Tag>
                )
            )
        },
        {
            title: t('assignment.score'),
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => (
                <Text strong>{score} / {activity.points}</Text>
            )
        },
        {
            title: t('assignment.timeTaken'),
            dataIndex: 'time_taken',
            key: 'time_taken',
            render: (time: number) => (
                <Space>
                    <ClockCircleOutlined />
                    {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
                </Space>
            )
        },
        {
            title: t('assignment.submittedAt'),
            dataIndex: 'attempted_at',
            key: 'attempted_at',
            render: (date: string) => new Date(date).toLocaleString()
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <BarChartOutlined className="text-blue-500" />
                    <span>{t('assignment.activityResults')}: {activity.title}</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t('common.close')}
                </Button>
            ]}
            width={1000}
        >
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card size="small" className="bg-blue-50">
                    <Text type="secondary">{t('assignment.totalAttempts')}</Text>
                    <Title level={3}>{stats.totalAttempts}</Title>
                </Card>
                <Card size="small" className="bg-green-50">
                    <Text type="secondary">{t('assignment.correct')}</Text>
                    <Title level={3} className="text-green-600">{stats.correctCount}</Title>
                </Card>
                <Card size="small" className="bg-red-50">
                    <Text type="secondary">{t('assignment.incorrect')}</Text>
                    <Title level={3} className="text-red-600">{stats.incorrectCount}</Title>
                </Card>
                <Card size="small" className="bg-purple-50">
                    <Text type="secondary">{t('assignment.successRate')}</Text>
                    <Title level={3}>{stats.successRate.toFixed(1)}%</Title>
                </Card>
                <Card size="small" className="bg-orange-50">
                    <Text type="secondary">{t('assignment.avgScore')}</Text>
                    <Title level={3}>{stats.averageScore.toFixed(1)}</Title>
                </Card>
            </div>

            {/* Question */}
            <Card className="mb-4" size="small">
                <Text strong>{t('assignment.question')}:</Text>
                <Paragraph className="mt-2">{activity.question}</Paragraph>
            </Card>

            {/* Tableau des réponses */}
            <Table
                dataSource={activityResponses}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                className="mt-4"
            />
        </Modal>
    );
};

const AssignmentViewAdmin: React.FC = () => {
    const { t } = useTranslation();
    const { data: chapitres, isPending: isChapitresPending } = useGetChapitre();
    const { data: allActiviy, isPending: isAllActivityPending } = useGetAllActivityEtudiant();

    const [selectedUnitId, setSelectedUnitId] = useState<number>();
    const [isModalVisible, setisModalVisible] = useState(false);
    const [resultsModalVisible, setResultsModalVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<BaseActivity | null>(null);

    // États pour les réponses groupées par type
    const [answersByType, setAnswersByType] = useState<Record<string, Record<number, any>>>({
        multiple_choice: {},
        true_false: {},
        fill_blank: {}
    });

    const [submittedByType, setSubmittedByType] = useState<Record<string, Record<number, boolean>>>({
        multiple_choice: {},
        true_false: {},
        fill_blank: {}
    });

    // Timer pour chaque question
    const [questionTimers, setQuestionTimers] = useState<Record<number, { startTime: number; currentTime: number }>>({});

    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState<string>('multiple_choice');

    // État pour les explications
    const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

    const timerIntervalRef = useRef<number | null>(null);

    const showmodalAdd = () => {
        return setisModalVisible(true);
    };

    const handlemodalCancel = () => {
        setisModalVisible(false);
    };

    // Initialiser avec le premier chapitre si disponible
    useEffect(() => {
        if (chapitres && chapitres.length > 0 && !selectedUnitId) {
            setSelectedUnitId(chapitres[0].id);
        }
    }, [chapitres, selectedUnitId]);

    const { data: activities, isPending: isActivitiesPending, refetch } = useGetAssignmentActivity(
        selectedUnitId ?? 0
    );

    // Grouper les activités par type
    const groupedActivities = React.useMemo(() => {
        const grouped: GroupedActivities = {
            multiple_choice: [],
            true_false: [],
            fill_blank: []
        };

        if (activities) {
            activities.forEach((activity: any) => {
                switch (activity.activity_type) {
                    case 'multiple_choice':
                        grouped.multiple_choice.push(activity as MultipleChoiceActivity);
                        break;
                    case 'true_false':
                        grouped.true_false.push(activity as TrueFalseActivity);
                        break;
                    case 'fill_blank':
                        grouped.fill_blank.push(activity as FillBlankActivity);
                        break;
                }
            });
        }

        return grouped;
    }, [activities]);

    // Fonction pour voir les résultats d'une activité
    const handleViewResults = (activity: BaseActivity) => {
        setSelectedActivity(activity);
        setResultsModalVisible(true);
    };

    useEffect(() => {
        timerIntervalRef.current = window.setInterval(() => {
            setQuestionTimers(prev => {
                const updated: Record<number, { startTime: number; currentTime: number }> = {};
                Object.keys(prev).forEach(key => {
                    const activityId = Number(key);
                    const timer = prev[activityId];
                    updated[activityId] = {
                        ...timer,
                        currentTime: Math.floor((Date.now() - timer.startTime) / 1000)
                    };
                });
                return updated;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                window.clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setAnswersByType({
            multiple_choice: {},
            true_false: {},
            fill_blank: {}
        });
        setSubmittedByType({
            multiple_choice: {},
            true_false: {},
            fill_blank: {}
        });
        setShowExplanation({});
        setQuestionTimers({});
    }, [activities]);

    const handleUnitChange = (unitId: number) => {
        setSelectedUnitId(unitId);
        refetch();
    };

    const handleAnswer = (type: string, activityId: number, value: any) => {
        setAnswersByType(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [activityId]: value
            }
        }));
    };

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case 'multiple_choice': return t('types.multiple_choice');
            case 'true_false': return t('types.true_false');
            case 'fill_blank': return t('types.fill_blank');
            default: return type;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'multiple_choice': return <CheckSquareOutlined />;
            case 'true_false': return <CheckCircleOutlined />;
            case 'fill_blank': return <FormOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    // Formater le temps en minutes:secondes
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Rendu d'une activité multiple choice
    const renderMultipleChoice = (activity: MultipleChoiceActivity, type: 'multiple_choice') => {
        const isSubmitted = submittedByType[type][activity.id];
        const timer = questionTimers[activity.id];

        // Compter le nombre de réponses pour cette activité
        const responseCount = allActiviy?.filter((r: ActivityAllType) => r.activity === activity.id).length || 0;

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? 'border-green-500 bg-green-50' : ''}`}
                title={
                    <Space>
                        <Tag color="blue">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {responseCount > 0 && (
                            <Tag color="purple" icon={<UserOutlined />}>
                                {responseCount} {t('assignment.responses')}
                            </Tag>
                        )}
                        {!isSubmitted && timer && (
                            <Tag icon={<ClockCircleOutlined />} color="orange">
                                {formatTime(timer.currentTime)}
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResults(activity)}
                        className="!bg-blue-500"
                    >
                        {t('assignment.viewResults')}
                    </Button>
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Radio.Group
                    onChange={(e) => handleAnswer(type, activity.id, e.target.value)}
                    value={answersByType[type][activity.id]}
                    disabled={true}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full">
                        {activity.options.map((option, index) => (
                            <Card
                                key={index}
                                className={`w-full transition-all duration-300 opacity-75`}
                                size="small"
                            >
                                <Radio value={index} className="w-full" disabled={true}>
                                    <Text strong>{option}</Text>
                                </Radio>
                            </Card>
                        ))}
                    </Space>
                </Radio.Group>

                {activity.explanation && (
                    <div className="mt-4">
                        <Button
                            type="link"
                            icon={<BulbOutlined />}
                            onClick={() => setShowExplanation(prev => ({
                                ...prev,
                                [activity.id]: !prev[activity.id]
                            }))}
                        >
                            {showExplanation[activity.id] ? t('assignment.hideExplanation') : t('assignment.seeExplanation')}
                        </Button>
                        {showExplanation[activity.id] && (
                            <Alert
                                message={t('assignment.explanation')}
                                description={activity.explanation}
                                type="info"
                                className="mt-2"
                            />
                        )}
                    </div>
                )}
            </Card>
        );
    };

    // Rendu d'une activité vrai/faux
    const renderTrueFalse = (activity: TrueFalseActivity, type: 'true_false') => {
        const isSubmitted = submittedByType[type][activity.id];
        const timer = questionTimers[activity.id];

        // Compter le nombre de réponses pour cette activité
        const responseCount = allActiviy?.filter((r: ActivityAllType) => r.activity === activity.id).length || 0;

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? 'border-green-500 bg-green-50' : ''}`}
                title={
                    <Space>
                        <Tag color="purple">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {responseCount > 0 && (
                            <Tag color="purple" icon={<UserOutlined />}>
                                {responseCount} {t('assignment.responses')}
                            </Tag>
                        )}
                        {!isSubmitted && timer && (
                            <Tag icon={<ClockCircleOutlined />} color="orange">
                                {formatTime(timer.currentTime)}
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResults(activity)}
                        className="!bg-blue-500"
                    >
                        {t('assignment.viewResults')}
                    </Button>
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Space direction="vertical" className="w-full">
                    {['صح', 'خطأ'].map((option, index) => (
                        <Card
                            key={index}
                            className={`w-full transition-all duration-300 opacity-75`}
                            size="small"
                        >
                            <div className="flex items-center gap-3">
                                {index === 0 ? (
                                    <CheckCircleOutlined className="text-green-500 text-xl" />
                                ) : (
                                    <CloseOutlined className="text-red-500 text-xl" />
                                )}
                                <Text strong className={index === 0 ? 'text-green-600' : 'text-red-600'}>
                                    {option}
                                </Text>
                            </div>
                        </Card>
                    ))}
                </Space>

                {activity.explanation && (
                    <div className="mt-4">
                        <Button
                            type="link"
                            icon={<BulbOutlined />}
                            onClick={() => setShowExplanation(prev => ({
                                ...prev,
                                [activity.id]: !prev[activity.id]
                            }))}
                        >
                            {showExplanation[activity.id] ? t('assignment.hideExplanation') : t('assignment.seeExplanation')}
                        </Button>
                        {showExplanation[activity.id] && (
                            <Alert
                                message={t('assignment.explanation')}
                                description={activity.explanation}
                                type="info"
                                className="mt-2"
                            />
                        )}
                    </div>
                )}
            </Card>
        );
    };

    const renderFillBlank = (activity: FillBlankActivity, type: 'fill_blank') => {
        const isSubmitted = submittedByType[type][activity.id];
        const timer = questionTimers[activity.id];

        const responseCount = allActiviy?.filter((r: ActivityAllType) => r.activity === activity.id).length || 0;

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? 'border-green-500 bg-green-50' : ''}`}
                title={
                    <Space>
                        <Tag color="cyan">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {responseCount > 0 && (
                            <Tag color="purple" icon={<UserOutlined />}>
                                {responseCount} {t('assignment.responses')}
                            </Tag>
                        )}
                        {!isSubmitted && timer && (
                            <Tag icon={<ClockCircleOutlined />} color="orange">
                                {formatTime(timer.currentTime)}
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResults(activity)}
                        className="!bg-blue-500"
                    >
                        {t('assignment.viewResults')}
                    </Button>
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Input
                    size="large"
                    placeholder={t('assignment.writeAnswer')}
                    value={answersByType[type][activity.id] || ''}
                    disabled={true}
                    className="rounded-lg opacity-75"
                    prefix={<QuestionCircleOutlined className="text-gray-400" />}
                />

                {activity.explanation && (
                    <div className="mt-4">
                        <Button
                            type="link"
                            icon={<BulbOutlined />}
                            onClick={() => setShowExplanation(prev => ({
                                ...prev,
                                [activity.id]: !prev[activity.id]
                            }))}
                        >
                            {showExplanation[activity.id] ? t('assignment.hideExplanation') : t('assignment.seeExplanation')}
                        </Button>
                        {showExplanation[activity.id] && (
                            <Alert
                                message={t('assignment.explanation')}
                                description={activity.explanation}
                                type="info"
                                className="mt-2"
                            />
                        )}
                    </div>
                )}
            </Card>
        );
    };

    const renderHeader = () => (
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <Space direction="vertical" size="small" className="w-full">
                        <Space>
                            <BookOutlined className="text-2xl text-green-500" />
                            <Text strong className="text-gray-700">
                                {t('assignment.selectUnit')}
                            </Text>
                        </Space>
                        <Select
                            placeholder={t('assignment.selectUnit')}
                            style={{ width: '100%', maxWidth: 300 }}
                            onChange={handleUnitChange}
                            value={selectedUnitId}
                            loading={isChapitresPending}
                            className="w-full"
                        >
                            {chapitres?.map((chapitre: typeChapitre) => (
                                <Option key={chapitre.id} value={chapitre.id}>
                                    {chapitre.title}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={showmodalAdd}
                        className='h-[41px] !bg-main-color !text-white'
                        icon={<FileTextOutlined />}
                    >
                        {t('assignment.newActivity')}
                    </Button>
                </div>
            </div>

            {activities && activities.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(groupedActivities).map(type => {
                        const total = groupedActivities[type as keyof GroupedActivities].length;
                        if (total === 0) return null;

                        const submitted = Object.keys(submittedByType[type]).length;

                        return (
                            <Card key={type} size="small" className="bg-gray-50">
                                <Space direction="vertical" size="small" className="w-full">
                                    <Space>
                                        {getTypeIcon(type)}
                                        <Text strong>{getTypeLabel(type)}</Text>
                                    </Space>
                                    <Progress
                                        percent={Math.round((submitted / total) * 100)}
                                        size="small"
                                        format={() => `${submitted}/${total} ${t('assignment.submittedLower')}`}
                                    />
                                </Space>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Card>
    );

    if (isChapitresPending || isActivitiesPending || isAllActivityPending) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center min-h-screen">
                <Card className="shadow-2xl border-0">
                    <Space direction="vertical" align="center" className="p-8">
                        <Spin size="large" />
                        <Text className="text-lg font-semibold">{t('assignment.loadingChapitres')}</Text>
                    </Space>
                </Card>
            </div>
        );
    }

    if (!chapitres || chapitres.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 flex items-center justify-center p-4">
                <Card className="shadow-2xl border-0 max-w-md w-full text-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <QuestionCircleOutlined className="text-6xl text-yellow-500 mb-4" />
                    </motion.div>
                    <Title level={3}>{t('assignment.noChapitres')}</Title>
                    <Text className="text-gray-500">
                        {t('assignment.noChapitresMessage')}
                    </Text>
                </Card>
            </div>
        );
    }

    const hasActivities = Object.values(groupedActivities).some(arr => arr.length > 0);

    if (!hasActivities) {
        return (
            <>
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 p-4 md:p-6">
                    {renderHeader()}
                    <Card className="p-10 text-center">
                        <Title level={3}>{t('assignment.noActivities')}</Title>
                        <Button
                            type="primary"
                            onClick={showmodalAdd}
                            className="mt-4 !bg-main-color"
                        >
                            {t('assignment.createActivity')}
                        </Button>
                    </Card>
                </div>

                <Modal
                    open={isModalVisible}
                    onCancel={handlemodalCancel}
                    footer={null}
                    width={800}
                >
                    <AddNewAssignment onCancel={handlemodalCancel} />
                </Modal>
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w mx-auto"
                >
                    {renderHeader()}

                    <Card className="shadow-xl border-0">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                            size="large"
                            className="activity-tabs"
                        >
                            {/* Onglet QCM */}
                            <TabPane
                                tab={
                                    <span>
                                        <CheckSquareOutlined />
                                        {t('assignment.type_mcq')} ({groupedActivities.multiple_choice.length})
                                    </span>
                                }
                                key="multiple_choice"
                            >
                                {groupedActivities.multiple_choice.length > 0 ? (
                                    <Collapse defaultActiveKey={['1']} className="mb-4">
                                        {groupedActivities.multiple_choice.map((activity, index) => (
                                            <Panel
                                                header={`${t('assignment.question')} ${index + 1}: ${activity.title}`}
                                                key={index}
                                            >
                                                {renderMultipleChoice(activity, 'multiple_choice')}
                                            </Panel>
                                        ))}
                                    </Collapse>
                                ) : (
                                    <div className="text-center py-8">
                                        <Text type="secondary">{t('assignment.noActivities')} {t('assignment.type_mcq')}</Text>
                                    </div>
                                )}
                            </TabPane>

                            {/* Onglet Vrai/Faux */}
                            <TabPane
                                tab={
                                    <span>
                                        <CheckCircleOutlined />
                                        {t('assignment.type_true_false')} ({groupedActivities.true_false.length})
                                    </span>
                                }
                                key="true_false"
                            >
                                {groupedActivities.true_false.length > 0 ? (
                                    <Collapse defaultActiveKey={['1']} className="mb-4">
                                        {groupedActivities.true_false.map((activity, index) => (
                                            <Panel
                                                header={`${t('assignment.question')} ${index + 1}: ${activity.title}`}
                                                key={index}
                                            >
                                                {renderTrueFalse(activity, 'true_false')}
                                            </Panel>
                                        ))}
                                    </Collapse>
                                ) : (
                                    <div className="text-center py-8">
                                        <Text type="secondary">{t('assignment.noActivities')} {t('assignment.type_true_false')}</Text>
                                    </div>
                                )}
                            </TabPane>

                            {/* Onglet Questions à trous */}
                            <TabPane
                                tab={
                                    <span>
                                        <FormOutlined />
                                        {t('assignment.type_fill_blank')} ({groupedActivities.fill_blank.length})
                                    </span>
                                }
                                key="fill_blank"
                            >
                                {groupedActivities.fill_blank.length > 0 ? (
                                    <Collapse defaultActiveKey={['1']} className="mb-4">
                                        {groupedActivities.fill_blank.map((activity, index) => (
                                            <Panel
                                                header={`${t('assignment.question')} ${index + 1}: ${activity.title}`}
                                                key={index}
                                            >
                                                {renderFillBlank(activity, 'fill_blank')}
                                            </Panel>
                                        ))}
                                    </Collapse>
                                ) : (
                                    <div className="text-center py-8">
                                        <Text type="secondary">{t('assignment.noActivities')} {t('assignment.type_fill_blank')}</Text>
                                    </div>
                                )}
                            </TabPane>
                        </Tabs>
                    </Card>
                </motion.div>
            </div>

            {/* Modal pour ajouter une activité */}
            <Modal
                footer={null}
                open={isModalVisible}
                onCancel={handlemodalCancel}
                width={800}
                cancelText={t("common.cancel")}
                className="rounded-2xl"
                maskClosable={false}
                closeIcon={false}
                destroyOnHidden={true}
            >
                <AddNewAssignment onCancel={handlemodalCancel} />
            </Modal>

            {/* Modal pour voir les résultats d'une activité */}
            <ActivityResultsModal
                visible={resultsModalVisible}
                onCancel={() => setResultsModalVisible(false)}
                activity={selectedActivity}
                responses={allActiviy || []}
            />
        </>
    );
};

export default AssignmentViewAdmin;