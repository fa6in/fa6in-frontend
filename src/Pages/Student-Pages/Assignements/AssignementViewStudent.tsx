import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Tag, Typography, Progress, Button, Space, Alert, Select, Empty, List } from 'antd';
import { BookOutlined, BulbOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AuthService from '../../../Auth-service/AuthService'; // ⚠️ adapte le chemin selon ton projet
import useGetAssignmentActivity from '../../../Services/Admin/Assignments/useGetAssignement';
import { useGetSkills } from '../../../Services/Skills/useGetSkills';
import type { Skill } from '../../../Services/Skills/typeSkill';
import SpinnerLoader from '../../../ui/SpinnerLoader';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/* ------------------------------------------------------------------ */
/* Types de la réponse de /api/students/:id/next-action/?skill=:id     */
/* ------------------------------------------------------------------ */
interface Chunk {
    id: number;
    code: string;
    chunk_type: string; // "rule", ...
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

const CHUNK_TYPE_COLORS: Record<string, string> = {
    rule: 'blue',
    example: 'green',
    exercise: 'purple',
};

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
                    {t('common.refresh', 'Actualiser')}
                </Button>
            </div>
        </Card>
    );

    /* ------------------------ Progression du skill ----------------------- */
    const renderProgress = (data: NextAction) => (
        <Card className="mb-6 shadow border-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <Text type="secondary">{t('assignment.mastery', 'Maîtrise')}</Text>
                    <Progress
                        percent={Math.round(data.context.current_mastery * 100)}
                        status="active"
                        strokeColor="#22c55e"
                    />
                </div>
                <Space size="middle" wrap>
                    <Tag color="default">{data.current_skill.code}</Tag>
                    <Tag color="orange">
                        {t('assignment.attempts', 'Tentatives')} : {data.context.attempts}
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

    /* ------------------------------- Chunk ------------------------------- */
    const renderChunk = (chunk: Chunk | null) => {
        // Cas skill sans contenu (chunk === null)
        if (!chunk) {
            return (
                <Card className="shadow border-0">
                    <Empty
                        image={<QuestionCircleOutlined className="text-6xl text-yellow-500" />}
                        description={
                            <Text type="secondary">
                                {t('assignment.noChunk', 'Aucun contenu disponible pour cette compétence pour le moment.')}
                            </Text>
                        }
                    />
                </Card>
            );
        }

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

                    {chunk.options.length > 0 && (
                        <List
                            className="mt-4"
                            bordered
                            dataSource={chunk.options}
                            renderItem={(opt) => <List.Item>{opt}</List.Item>}
                        />
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
                // Actions futures (question, exercice...) pas encore gérées
                return (
                    <Alert
                        type="warning"
                        showIcon
                        message={`Action non gérée : ${data.action}`}
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