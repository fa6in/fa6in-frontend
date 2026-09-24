import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    Tag,
    Typography,
    Progress,
    Button,
    Space,
    Alert,
    Select,
    Empty,
    List,
    Input,
    Radio,
} from 'antd';
import {
    BookOutlined,
    BulbOutlined,
    ReloadOutlined,
    QuestionCircleOutlined,
    ArrowRightOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AuthService from '../../../Auth-service/AuthService'; // ⚠️ adapte le chemin selon ton projet
import useGetAssignmentActivity from '../../../Services/Admin/Assignments/useGetAssignement';
import { useGetSkills } from '../../../Services/Skills/useGetSkills';
import type { Skill } from '../../../Services/Skills/typeSkill';
import SpinnerLoader from '../../../ui/SpinnerLoader';
import useSubmitAnswer from '../../../Services/Admin/Assignments/useSubmitAnswer';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/* ------------------------------------------------------------------ */
/* Types de la réponse de /api/students/:id/next-action/?skill=:id     */
/* ------------------------------------------------------------------ */
export type ChunkType =
    | 'rule'
    | 'example'
    | 'practice'
    | 'error'
    | 'hint'
    | 'real_life';

interface Chunk {
    id: number;
    code: string;
    chunk_type: ChunkType;
    title: string;
    content: string;
    options: string[];
    difficulty: number;
    order_index: number;
    points: number;
    time_limit: number | null;
    skill: {
        id: number;
        code: string;
        name: string;
        skill_type: string;
        difficulty: number;
    };
}

interface NextAction {
    action: string; // "show_chunk", ...
    current_skill: { id: number; code: string };
    chunk: Chunk | null; // ⚠️ peut être null (ex: skill 7 et 9)
    context: {
        reason: string;
        current_mastery: number;
        attempts: number;
    };
}

interface SubmitAnswerResult {
    is_correct: boolean;
    error_type: string | null;
    error_detail: string | null;
    progress: {
        attempts: number;
        correct_count: number;
        mastery: number;
        consecutive_correct: number;
        status: string;
    };
}

const CHUNK_TYPE_COLORS: Record<ChunkType, string> = {
    rule: 'blue',
    example: 'green',
    practice: 'purple',
    error: 'red',
    hint: 'gold',
    real_life: 'cyan',
};

// Ordre logique des étapes, utilisé pour le libellé du bouton "Suivant"
const CHUNK_TYPE_ORDER: ChunkType[] = ['rule', 'example', 'practice'];

const AssignmentViewStudent: React.FC = () => {
    const { t } = useTranslation();

    const authId = AuthService.getUserId();

    const { data: skills, isPending: isSkillsPending } = useGetSkills();
    const [selectedSkillId, setSelectedSkillId] = React.useState<number>();

    // Sélection automatique du premier skill
    useEffect(() => {
        if (skills && skills.length > 0 && !selectedSkillId) {
            setSelectedSkillId(skills[0].id);
        }
    }, [skills, selectedSkillId]);

    const {
        data: rawActivities,
        isPending: isActivityPending,
        isFetching,
        refetch,
    } = useGetAssignmentActivity(Number(authId), selectedSkillId ?? 0);

    // La réponse est un OBJET (pas un tableau)
    const activity = rawActivities as NextAction | undefined;

    /* --------------------- Passage à l'étape suivante (rule/example) --------------------- */
    const [isAdvancing, setIsAdvancing] = React.useState(false);

    const handleNextStep = async () => {
        setIsAdvancing(true);
        try {
            await refetch();
        } finally {
            setIsAdvancing(false);
        }
    };

    const getNextStepLabel = (currentType?: ChunkType) => {
        if (!currentType) return t('assignment.next');
        const idx = CHUNK_TYPE_ORDER.indexOf(currentType);
        const nextType = idx >= 0 && idx < CHUNK_TYPE_ORDER.length - 1 ? CHUNK_TYPE_ORDER[idx + 1] : null;

        if (nextType === 'example') return t('assignment.goToExample');
        if (nextType === 'practice') return t('assignment.goToPractice');
        return t('assignment.continue');
    };

    /* --------------------- Gestion du "practice" (exercice) --------------------- */
    const { mutateAsync: submitAnswer, isPending: isSubmitting } = useSubmitAnswer();

    const [selectedAnswer, setSelectedAnswer] = React.useState<string>('');
    const [freeTextAnswer, setFreeTextAnswer] = React.useState<string>('');
    const [answerResult, setAnswerResult] = React.useState<SubmitAnswerResult | null>(null);

    // Timer pour calculer time_taken (en secondes)
    const startTimeRef = useRef<number>(Date.now());

    // Reset l'état d'exercice à chaque nouveau chunk
    useEffect(() => {
        setSelectedAnswer('');
        setFreeTextAnswer('');
        setAnswerResult(null);
        startTimeRef.current = Date.now();
    }, [activity?.chunk?.id]);

    const handleSubmitAnswer = async () => {
        if (!activity?.chunk) return;

        const answer = activity.chunk.options.length > 0 ? selectedAnswer : freeTextAnswer;
        if (!answer) return;

        const time_taken = Math.round((Date.now() - startTimeRef.current) / 1000);

        try {
            const result = await submitAnswer({
                studentId: Number(authId),
                chunk_id: activity.chunk.id,
                answer,
                time_taken,
            });
            setAnswerResult(result);
        } catch (err) {
            console.error('Erreur lors de la soumission de la réponse', err);
        }
    };

    const handleAfterAnswer = async () => {
        setIsAdvancing(true);
        try {
            await refetch();
        } finally {
            setIsAdvancing(false);
        }
    };

    /* ------------------------------ Header ------------------------------ */
    const renderHeader = () => (
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <Space direction="vertical" size="small" className="w-full md:w-auto">
                    <Space>
                        <BookOutlined className="text-2xl text-green-500" />
                        <Text strong className="text-gray-700">
                            {t('assignment.selectSkill')}
                        </Text>
                    </Space>
                    <Select
                        placeholder={t('assignment.selectSkill')}
                        style={{ width: '100%', minWidth: 260 }}
                        onChange={(id: number) => setSelectedSkillId(id)}
                        value={selectedSkillId}
                        loading={isSkillsPending}
                    >
                        {skills?.map((skill: Skill) => (
                            <Option key={skill.id} value={skill.id}>
                                {skill.name}
                            </Option>
                        ))}
                    </Select>
                </Space>

                <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
                    {t('common.refresh')}
                </Button>
            </div>
        </Card>
    );

    /* ------------------------ Progression du skill ----------------------- */
    const renderProgress = (data: NextAction) => (
        <Card className="mb-6 shadow border-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <Text type="secondary">{t('assignment.mastery')}</Text>
                    <Progress
                        percent={Math.round(data.context.current_mastery * 100)}
                        status="active"
                        strokeColor="#22c55e"
                    />
                </div>
                <Space size="middle" wrap>
                    <Tag color="default">{data.current_skill.code}</Tag>
                    <Tag color="orange">
                        {t('assignment.attempts')} : {data.context.attempts}
                    </Tag>
                </Space>
            </div>

            {data.context.reason && (
                <Alert
                    className="mt-4"
                    type="info"
                    showIcon
                    icon={<BulbOutlined />}
                    message={data.context.reason}
                />
            )}
        </Card>
    );

    /* --------------------------- Bloc résultat exercice --------------------------- */
    const renderAnswerResult = (result: SubmitAnswerResult) => (
        <Alert
            className="mt-4"
            type={result.is_correct ? 'success' : 'error'}
            showIcon
            icon={
                result.is_correct ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                )
            }
            message={
                result.is_correct
                    ? t('assignment.correctAnswer')
                    : t('assignment.wrongAnswer')
            }
            description={
                <div>
                    {!result.is_correct && result.error_detail && (
                        <Paragraph className="!mb-2">{result.error_detail}</Paragraph>
                    )}
                    <Space size="middle" wrap>
                        <Tag color="blue">
                            {t('assignment.mastery')} : {Math.round(result.progress.mastery * 100)}%
                        </Tag>
                        <Tag color="green">
                            {t('assignment.correctCount')} : {result.progress.correct_count}
                        </Tag>
                        <Tag color="purple">
                            {t('assignment.consecutiveCorrect')} : {result.progress.consecutive_correct}
                        </Tag>
                    </Space>
                </div>
            }
        />
    );

    /* ------------------------------- Chunk ------------------------------- */
    const renderChunk = (chunk: Chunk | null) => {
        // Cas skill sans contenu (chunk === null)
        if (!chunk) {
            return (
                <Card className="shadow border-0">
                    <Empty
                        image={<QuestionCircleOutlined className="text-6xl text-yellow-500" />}
                        description={<Text type="secondary">{t('assignment.noChunk')}</Text>}
                    />
                </Card>
            );
        }

        const isPractice = chunk.chunk_type === 'practice';

        return (
            <Card
                className="shadow-xl border-0"
                title={
                    <Space wrap>
                        <Tag color={CHUNK_TYPE_COLORS[chunk.chunk_type] ?? 'default'}>{chunk.chunk_type}</Tag>
                        <Text strong>{chunk.title}</Text>
                    </Space>
                }
                extra={
                    <Space>
                        {chunk.points > 0 && (
                            <Tag color="gold">
                                {chunk.points} {t('assignment.points')}
                            </Tag>
                        )}
                        {chunk.time_limit && <Tag color="orange">{chunk.time_limit}s</Tag>}
                    </Space>
                }
            >
                {/* Contenu en arabe → RTL */}
                <div dir="rtl" className="text-right">
                    <Text type="secondary">{chunk.skill.name}</Text>

                    <Paragraph className="!mt-3 !mb-0 text-xl leading-10">{chunk.content}</Paragraph>

                    {/* --------- Cas PRACTICE : réponse cliquable ou texte libre --------- */}
                    {isPractice && !answerResult && (
                        <div className="mt-4">
                            {chunk.options.length > 0 ? (
                                <Radio.Group
                                    className="w-full"
                                    value={selectedAnswer}
                                    onChange={(e) => setSelectedAnswer(e.target.value)}
                                >
                                    <Space direction="vertical" className="w-full">
                                        {chunk.options.map((opt) => (
                                            <Radio key={opt} value={opt} className="w-full">
                                                {opt}
                                            </Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                            ) : (
                                <Input
                                    dir="rtl"
                                    size="large"
                                    placeholder={t('assignment.yourAnswer')}
                                    value={freeTextAnswer}
                                    onChange={(e) => setFreeTextAnswer(e.target.value)}
                                    onPressEnter={handleSubmitAnswer}
                                />
                            )}
                        </div>
                    )}

                    {/* --------- Non-practice : affichage simple des options (rule/example) --------- */}
                    {!isPractice && chunk.options.length > 0 && (
                        <List
                            className="mt-4"
                            bordered
                            dataSource={chunk.options}
                            renderItem={(opt) => <List.Item>{opt}</List.Item>}
                        />
                    )}
                </div>

                {/* --------- Résultat après soumission de l'exercice --------- */}
                <AnimatePresence>
                    {isPractice && answerResult && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {renderAnswerResult(answerResult)}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --------------------- Bouton d'action en bas --------------------- */}
                <div className="mt-6 flex justify-end">
                    {isPractice ? (
                        !answerResult ? (
                            <Button
                                type="primary"
                                loading={isSubmitting}
                                disabled={chunk.options.length > 0 ? !selectedAnswer : !freeTextAnswer}
                                onClick={handleSubmitAnswer}
                            >
                                {t('assignment.validate')}
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<ArrowRightOutlined />}
                                loading={isAdvancing || isFetching}
                                onClick={handleAfterAnswer}
                            >
                                {t('assignment.continue')}
                            </Button>
                        )
                    ) : (
                        <Button
                            type="primary"
                            icon={<ArrowRightOutlined />}
                            loading={isAdvancing || isFetching}
                            onClick={handleNextStep}
                        >
                            {getNextStepLabel(chunk.chunk_type)}
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    /* --------------------- Rendu selon l'action reçue -------------------- */
    const renderAction = (data: NextAction) => {
        switch (data.action) {
            case 'show_chunk':
                return renderChunk(data.chunk);
            default:
                // Actions futures pas encore gérées
                return (
                    <Alert
                        type="warning"
                        showIcon
                        message={`${t('assignment.unhandledAction')} : ${data.action}`}
                        description={<pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>}
                    />
                );
        }
    };

    /* ------------------------------- Rendu ------------------------------- */
    if (isSkillsPending) {
        return <SpinnerLoader />;
    }

    if (!skills || skills.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 flex items-center justify-center p-4">
                <Card className="shadow-2xl border-0 max-w-md w-full text-center">
                    <QuestionCircleOutlined className="text-6xl text-yellow-500 mb-4" />
                    <Title level={3}>{t('assignment.noChapitres')}</Title>
                    <Text className="text-gray-500">{t('assignment.noChapitresMessage')}</Text>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 p-4 md:p-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w mx-auto">
                {renderHeader()}

                {isActivityPending || isFetching ? (
                    <SpinnerLoader />
                ) : !activity ? (
                    <Card className="p-10 text-center">
                        <Title level={3}>{t('assignment.noActivities')}</Title>
                    </Card>
                ) : (
                    <>
                        {renderProgress(activity)}
                        {renderAction(activity)}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AssignmentViewStudent;