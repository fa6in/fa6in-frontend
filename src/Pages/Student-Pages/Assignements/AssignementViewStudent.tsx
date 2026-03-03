import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import api from '../../../Auth-service/axios';
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
    Modal,
    Tabs,
    Collapse,
    message,
    Descriptions
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
    EyeOutlined,
    SolutionOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useGetAssignmentActivity from '../../../Services/Admin/Assignments/useGetAssignement';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import { useSubmitAnswer } from '../../../Services/Admin/Assignments/useSubmitAnswer';
import { type ResponseEtudiant } from '../../../Services/Admin/Assignments/useConsultReponseEtudiant';
import SpinnerLoader from '../../../ui/SpinnerLoader';

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

interface AnswersByType {
    multiple_choice: Record<number, any>;
    true_false: Record<number, any>;
    fill_blank: Record<number, any>;
}

interface SubmittedByType {
    multiple_choice: Record<number, boolean>;
    true_false: Record<number, boolean>;
    fill_blank: Record<number, boolean>;
}



// Interface pour suivre le temps par question
interface QuestionTimer {
    startTime: number;
    currentTime: number;
}

// Interface pour le modal de visualisation des réponses
interface ResponseViewModalProps {
    visible: boolean;
    onCancel: () => void;
    response: ResponseEtudiant | null;
    activity: any;
}

const ResponseViewModal: React.FC<ResponseViewModalProps> = ({ visible, onCancel, response, activity }) => {
    const { t } = useTranslation();

    if (!response || !activity) return null;

    const getAnswerDisplay = () => {
        if (activity.activity_type === 'multiple_choice' && activity.options) {
            return activity.options[response.answer] || response.answer;
        } else if (activity.activity_type === 'true_false') {
            return response.answer === 0 ? 'صح' : 'خطأ';
        } else {
            return response.answer;
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <SolutionOutlined className="text-blue-500" />
                    <span>{t('assignment.responseDetails')}</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    {t('common.close')}
                </Button>
            ]}
            width={600}
        >
            <Descriptions bordered column={1} className="mt-4">
                <Descriptions.Item label={t('assignment.question')}>
                    {activity.question}
                </Descriptions.Item>

                <Descriptions.Item label={t('assignment.yourAnswer')}>
                    <Tag color={response.is_correct ? "green" : "red"} className="text-base py-1 px-3">
                        {getAnswerDisplay()}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label={t('assignment.correctness')}>
                    {response.is_correct ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            {t('assignment.correct')}
                        </Tag>
                    ) : (
                        <Tag color="red" icon={<CloseOutlined />}>
                            {t('assignment.incorrect')}
                        </Tag>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label={t('assignment.score')}>
                    <Text strong>{response.score} / {activity.points}</Text>
                </Descriptions.Item>

                <Descriptions.Item label={t('assignment.timeTaken')}>
                    <Space>
                        <ClockCircleOutlined />
                        {Math.floor(response.time_taken / 60)}:{String(response.time_taken % 60).padStart(2, '0')} {t('assignment.minutes')}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label={t('assignment.submittedAt')}>
                    {new Date(response.attempted_at).toLocaleString()}
                </Descriptions.Item>

                {activity.explanation && (
                    <Descriptions.Item label={t('assignment.explanation')}>
                        <Alert
                            message={activity.explanation}
                            type="info"
                            showIcon
                        />
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};

const AssignmentViewStudent: React.FC = () => {
    const { t } = useTranslation();
    const { data: chapitres, isPending: isChapitresPending } = useGetChapitre();
    const [selectedUnitId, setSelectedUnitId] = useState<number>();
    // const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

    // États pour les réponses groupées par type
    const [answersByType, setAnswersByType] = useState<AnswersByType>({
        multiple_choice: {},
        true_false: {},
        fill_blank: {}
    });

    const [submittedByType, setSubmittedByType] = useState<SubmittedByType>({
        multiple_choice: {},
        true_false: {},
        fill_blank: {}
    });

    // État pour les réponses existantes de l'étudiant
    const [studentResponses, setStudentResponses] = useState<Record<number, ResponseEtudiant>>({});

    // Timer pour chaque question
    const [questionTimers, setQuestionTimers] = useState<Record<number, QuestionTimer>>({});

    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState<string>('multiple_choice');

    // État pour les explications
    const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

    // État pour le modal de visualisation
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<ResponseEtudiant | null>(null);
    const [selectedActivityForModal, setSelectedActivityForModal] = useState<any>(null);

    // Hook pour soumettre les réponses
    const { mutate: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

    // Référence pour l'intervalle de mise à jour des timers
    const timerIntervalRef = useRef<number | null>(null);

    // Initialiser avec le premier chapitre si disponible
    useEffect(() => {
        if (chapitres && chapitres.length > 0 && !selectedUnitId) {
            setSelectedUnitId(chapitres[0].id);
        }
    }, [chapitres, selectedUnitId]);

    const { data: activities, isPending: isActivitiesPending, refetch } = useGetAssignmentActivity(
        selectedUnitId ?? 0
    );



    const activityResponseQueries = useQueries({
        queries: (activities ?? []).map((activity: any) => ({
            queryKey: ['consultResponseEtudiant', activity.id],
            queryFn: async () => {
                const { data } = await api.get(
                    `/api/assessment/activities/${activity.id}/attempts/`
                );
                return data;
            },
            enabled: !!activity.id,
            staleTime: 5 * 60 * 1000,
        }))
    });

    // const { data: responsesEtudiant, refetch: refetchResponses } =
    //     useConsultResponseEtudiant(selectedUnitId ?? 0);




    useEffect(() => {
        if (!activities) return;

        // Extraire seulement les datas
        const responsesData = activityResponseQueries.map(q => q.data);

        // Vérifier si au moins une query est encore loading
        const isAnyLoading = activityResponseQueries.some(q => q.isLoading);
        if (isAnyLoading) return;

        const responsesMap: Record<number, ResponseEtudiant> = {};
        const newSubmittedState: SubmittedByType = {
            multiple_choice: {},
            true_false: {},
            fill_blank: {}
        };

        responsesData.forEach((data, index) => {
            if (data && data.length > 0) {
                const response = data[0];
                const activity = activities[index];

                if (activity) {
                    responsesMap[activity.id] = response;

                    const type = activity.activity_type as keyof SubmittedByType;
                    newSubmittedState[type][activity.id] = true;
                }
            }
        });

        setStudentResponses(responsesMap);
        setSubmittedByType(newSubmittedState);

    }, [
        activities,
        activityResponseQueries.map(q => q.data).join('|') // dépend seulement des data
    ]);

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

    // Démarrer le timer quand une question est affichée
    const startTimerForQuestion = (activityId: number) => {
        // Ne pas démarrer le timer si la question a déjà été soumise
        const isSubmitted = Object.values(submittedByType).some(
            type => type[activityId]
        );

        if (!isSubmitted && !questionTimers[activityId]) {
            setQuestionTimers(prev => ({
                ...prev,
                [activityId]: {
                    startTime: Date.now(),
                    currentTime: 0
                }
            }));
        }
    };

    useEffect(() => {
        timerIntervalRef.current = window.setInterval(() => {
            setQuestionTimers(prev => {
                const updated: Record<number, QuestionTimer> = {};
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
        // Réinitialiser les états quand les activités changent
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
        setStudentResponses({});
        setShowExplanation({});
        setQuestionTimers({});
    }, [activities]);

    const handleUnitChange = (unitId: number) => {
        setSelectedUnitId(unitId);
        refetch();
    };

    // Gestionnaire de réponse pour un type spécifique
    const handleAnswer = (type: keyof AnswersByType, activityId: number, value: any) => {
        // Ne pas permettre de changer la réponse si elle a déjà été soumise
        if (submittedByType[type][activityId]) {
            return;
        }

        setAnswersByType(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [activityId]: value
            }
        }));
    };

    // Voir les détails d'une réponse
    const handleViewResponse = (activityId: number) => {
        const response = studentResponses[activityId];
        const activity = activities?.find((a: any) => a.id === activityId);

        if (response && activity) {
            setSelectedResponse(response);
            setSelectedActivityForModal(activity);
            setResponseModalVisible(true);
        }
    };

    // Soumettre une réponse individuelle
    const handleSubmitSingleAnswer = (type: keyof SubmittedByType, activity: any) => {
        // Vérifier si déjà soumis
        if (submittedByType[type][activity.id]) {
            message.info(t('assignment.alreadySubmitted'));
            return;
        }

        const answer = answersByType[type][activity.id];

        if (answer === undefined || answer === '') {
            message.warning(t('assignment.messages.pleaseAnswerQuestion'));
            return;
        }

        const timer = questionTimers[activity.id];
        const timeTakenInMinutes = timer ? Math.ceil(timer.currentTime / 60) : 0;

        // Préparer la réponse selon le type
        let answerValue: any = answer;

        submitAnswer({
            id: activity.id,
            answer: answerValue,
            time_taken: timeTakenInMinutes
        }, {
            onSuccess: () => {
                // Marquer la question comme soumise
                setSubmittedByType(prev => ({
                    ...prev,
                    [type]: {
                        ...prev[type],
                        [activity.id]: true
                    }
                }));

                // Arrêter le timer pour cette question
                setQuestionTimers(prev => {
                    const updated = { ...prev };
                    delete updated[activity.id];
                    return updated;
                });

                // Rafraîchir les réponses
                // setSelectedActivityId(activity.id);

                message.success(t('messages.answerSubmitted'));
            },
            onError: (error) => {
                console.error('Erreur lors de la soumission:', error);
            }
        });
    };

    // Obtenir le libellé du type
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
        const studentResponse = studentResponses[activity.id];

        // Démarrer le timer si la question n'est pas soumise
        if (!isSubmitted && !questionTimers[activity.id]) {
            startTimerForQuestion(activity.id);
        }

        const timer = questionTimers[activity.id];

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? studentResponse?.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50' : ''}`}
                title={
                    <Space>
                        <Tag color="blue">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {isSubmitted && (
                            <Tag color={studentResponse?.is_correct ? "green" : "red"}>
                                {studentResponse?.is_correct ? t('assignment.correct') : t('assignment.incorrect')}
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
                    !isSubmitted ? (
                        <Button
                            type="primary"
                            size="small"
                            loading={isSubmitting}
                            onClick={() => handleSubmitSingleAnswer(type, activity)}
                            className="!bg-green-500"
                        >
                            {t('assignment.messages.submit')}
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewResponse(activity.id)}
                        >
                            {t('assignment.viewResponse')}
                        </Button>
                    )
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Radio.Group
                    onChange={(e) => handleAnswer(type, activity.id, e.target.value)}
                    value={answersByType[type][activity.id]}
                    disabled={isSubmitted}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full">
                        {activity.options.map((option, index) => {
                            const isCorrect = isSubmitted && studentResponse?.answer === index && studentResponse?.is_correct;
                            const isIncorrect = isSubmitted && studentResponse?.answer === index && !studentResponse?.is_correct;

                            return (
                                <Card
                                    key={index}
                                    className={`w-full cursor-pointer transition-all duration-300 
                                        ${answersByType[type][activity.id] === index && !isSubmitted
                                            ? 'border-green-500 shadow-lg bg-green-50'
                                            : ''
                                        }
                                        ${isCorrect ? 'border-green-500 shadow-lg bg-green-100' : ''}
                                        ${isIncorrect ? 'border-red-500 shadow-lg bg-red-100' : ''}
                                        ${isSubmitted ? 'opacity-75' : 'hover:border-gray-400'}
                                    `}
                                    size="small"
                                >
                                    <Radio value={index} className="w-full" disabled={isSubmitted}>
                                        <Text strong className={isCorrect ? 'text-green-600' : isIncorrect ? 'text-red-600' : ''}>
                                            {option}
                                            {isCorrect && <CheckCircleOutlined className="ml-2 text-green-600" />}
                                            {isIncorrect && <CloseOutlined className="ml-2 text-red-600" />}
                                        </Text>
                                    </Radio>
                                </Card>
                            );
                        })}
                    </Space>
                </Radio.Group>

                {isSubmitted && activity.explanation && (
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

    // Rendu d'une activité vrai/faux (similaire à multiple choice mais adapté)
    const renderTrueFalse = (activity: TrueFalseActivity, type: 'true_false') => {
        const isSubmitted = submittedByType[type][activity.id];
        const studentResponse = studentResponses[activity.id];

        if (!isSubmitted && !questionTimers[activity.id]) {
            startTimerForQuestion(activity.id);
        }

        const timer = questionTimers[activity.id];

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? studentResponse?.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50' : ''}`}
                title={
                    <Space>
                        <Tag color="purple">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {isSubmitted && (
                            <Tag color={studentResponse?.is_correct ? "green" : "red"}>
                                {studentResponse?.is_correct ? t('assignment.correct') : t('assignment.incorrect')}
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
                    !isSubmitted ? (
                        <Button
                            type="primary"
                            size="small"
                            loading={isSubmitting}
                            onClick={() => handleSubmitSingleAnswer(type, activity)}
                            className="!bg-green-500"
                        >
                            {t('assignment.messages.submit')}
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewResponse(activity.id)}
                        >
                            {t('assignment.viewResponse')}
                        </Button>
                    )
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Space direction="vertical" className="w-full">
                    {['صح', 'خطأ'].map((option, index) => {
                        const isCorrect = isSubmitted && studentResponse?.answer === index && studentResponse?.is_correct;
                        const isIncorrect = isSubmitted && studentResponse?.answer === index && !studentResponse?.is_correct;

                        return (
                            <Card
                                key={index}
                                className={`w-full cursor-pointer transition-all duration-300 
                                    ${answersByType[type][activity.id] === index && !isSubmitted
                                        ? index === 0
                                            ? 'border-green-500 shadow-lg bg-green-50'
                                            : 'border-red-500 shadow-lg bg-red-50'
                                        : ''
                                    }
                                    ${isCorrect ? 'border-green-500 shadow-lg bg-green-100' : ''}
                                    ${isIncorrect ? 'border-red-500 shadow-lg bg-red-100' : ''}
                                    ${isSubmitted ? 'opacity-75' : 'hover:border-gray-400'}
                                `}
                                onClick={() => !isSubmitted && handleAnswer(type, activity.id, index)}
                                size="small"
                            >
                                <div className="flex items-center gap-3">
                                    {index === 0 ? (
                                        <CheckCircleOutlined className={`text-xl ${isCorrect ? 'text-green-600' : 'text-green-500'}`} />
                                    ) : (
                                        <CloseOutlined className={`text-xl ${isIncorrect ? 'text-red-600' : 'text-red-500'}`} />
                                    )}
                                    <Text strong className={
                                        index === 0
                                            ? isCorrect ? 'text-green-600' : 'text-green-600'
                                            : isIncorrect ? 'text-red-600' : 'text-red-600'
                                    }>
                                        {option}
                                        {isCorrect && <CheckCircleOutlined className="ml-2 text-green-600" />}
                                        {isIncorrect && <CloseOutlined className="ml-2 text-red-600" />}
                                    </Text>
                                </div>
                            </Card>
                        );
                    })}
                </Space>

                {isSubmitted && activity.explanation && (
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

    // Rendu d'une activité à trous
    const renderFillBlank = (activity: FillBlankActivity, type: 'fill_blank') => {
        const isSubmitted = submittedByType[type][activity.id];
        const studentResponse = studentResponses[activity.id];

        if (!isSubmitted && !questionTimers[activity.id]) {
            startTimerForQuestion(activity.id);
        }

        const timer = questionTimers[activity.id];

        return (
            <Card
                key={activity.id}
                className={`mb-4 ${isSubmitted ? studentResponse?.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50' : ''}`}
                title={
                    <Space>
                        <Tag color="cyan">{t('assignment.questionNumber')} {activity.order}</Tag>
                        <Tag color="gold">{activity.points} {t('assignment.points')}</Tag>
                        {isSubmitted && (
                            <Tag color={studentResponse?.is_correct ? "green" : "red"}>
                                {studentResponse?.is_correct ? t('assignment.correct') : t('assignment.incorrect')}
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
                    !isSubmitted ? (
                        <Button
                            type="primary"
                            size="small"
                            loading={isSubmitting}
                            onClick={() => handleSubmitSingleAnswer(type, activity)}
                            className="!bg-green-500"
                        >
                            {t('assignment.messages.submit')}
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewResponse(activity.id)}
                        >
                            {t('assignment.viewResponse')}
                        </Button>
                    )
                }
            >
                <Paragraph className="text-lg mb-4">{activity.question}</Paragraph>

                <Input
                    size="large"
                    placeholder={t('assignment.writeAnswer')}
                    value={answersByType[type][activity.id] || ''}
                    onChange={(e) => handleAnswer(type, activity.id, e.target.value)}
                    disabled={isSubmitted}
                    className={`rounded-lg ${isSubmitted && studentResponse?.is_correct ? 'border-green-500' : ''}`}
                    prefix={<QuestionCircleOutlined className="text-gray-400" />}
                    suffix={isSubmitted && (
                        studentResponse?.is_correct
                            ? <CheckCircleOutlined className="text-green-500" />
                            : <CloseOutlined className="text-red-500" />
                    )}
                />

                {isSubmitted && activity.explanation && (
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

    // Rendu du header
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
            </div>

            {activities && activities.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(groupedActivities).map(type => {
                        const total = groupedActivities[type as keyof GroupedActivities].length;
                        if (total === 0) return null;

                        const submitted = Object.keys(submittedByType[type as keyof SubmittedByType]).length;
                        const correct = Object.values(studentResponses).filter(
                            r => r.activity_type === type && r.is_correct
                        ).length;

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
                                    <Text type="secondary">
                                        {t('assignment.correct')}: {correct}/{submitted}
                                    </Text>
                                </Space>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Card>
    );

    // États de chargement
    if (isChapitresPending || isActivitiesPending) {
        return (

            <SpinnerLoader />
        );
    }

    // Pas de chapitres
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

    // Vérifier s'il y a des activités
    const hasActivities = Object.values(groupedActivities).some(arr => arr.length > 0);

    if (!hasActivities) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 p-4 md:p-6">
                {renderHeader()}
                <Card className="p-10 text-center">
                    <Title level={3}>{t('assignment.noActivities')}</Title>
                </Card>
            </div>
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

                    {/* Tabs pour chaque type de question */}
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

            {/* Modal de visualisation des réponses */}
            <ResponseViewModal
                visible={responseModalVisible}
                onCancel={() => setResponseModalVisible(false)}
                response={selectedResponse}
                activity={selectedActivityForModal}
            />
        </>
    );
};

export default AssignmentViewStudent;