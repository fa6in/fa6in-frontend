



import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Card,
    Alert,
    message,
    Row,
    Col,
    Steps,
    Radio,
    Typography,
    Space,
    Badge,
    Tag,
    Progress,
    Tooltip
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    EditOutlined,
    VideoCameraOutlined,
    FileTextOutlined,
    PictureOutlined,
    SoundOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    FilePdfOutlined,
    FontSizeOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import SpinnerLoader from '../../../ui/SpinnerLoader';
import { useUpdateContent } from '../../../Services/Admin/Content/useUpdateContent';
import { useGetOnceChapitre } from '../../../Services/Admin/Chapitres/useGetOnceChapiter';
import { useGetOnceContent } from '../../../Services/Admin/Content/useGetOnceContent';
import type { TypeContent } from '../../../Services/Admin/Content/typeContent';
import { getContentUnitId } from '../../../Services/Admin/Content/typeContent';
import { useGetGoals } from '../../../Services/Curriculum/Goals/useGetGoals';
import { normalizeRelationId } from '../../../ui/RelationSelect';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text } = Typography;

type props = {
    onCancel: () => void;
    contentId: string | number; // ID du contenu à modifier
    content?: TypeContent
}

export default function UpdateContenu({ onCancel, contentId, content }: props) {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [contentType, setContentType] = useState('text');
    const [loading, setLoading] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null | number>(null);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [goalsComplete, setGoalsComplete] = useState(false);

    const selectedUnit = Form.useWatch('unit', form);

    // Récupérer les données du contenu à modifier
    // const { data: contentData, isPending: isPendingContent } = useGetOnceContent(contentId, {
    //     enabled: !!contentId,
    // });

    const { data: contentData, isPending: isPendingContent } = useGetOnceContent(String(getContentUnitId(content?.unit) ?? ''), String(content?.id ?? ''), {
        enabled: !!(getContentUnitId(content?.unit) && contentId),
    });

    const { data: chapitreData, isPending: isPendingChapitre } = useGetChapitre();
    const { data: goals = [] } = useGetGoals();

    const { data: onceChapitre, isPending: isPendingChapitreOnce } =
        useGetOnceChapitre(String(selectedUnitId)!, {
            enabled: !!selectedUnitId,
        });

    const { mutate: updateContent, isPending: isPendingUpdate } = useUpdateContent();

    // Mettre à jour selectedUnitId quand selectedUnit change
    useEffect(() => {
        if (selectedUnit) {
            setSelectedUnitId(selectedUnit);
        }
    }, [selectedUnit]);

    // Charger les données initiales dans le formulaire
    useEffect(() => {
        if (contentData && !initialDataLoaded) {
            // Définir le type de contenu
            setContentType(contentData.content_type || 'text');
            const lessonId = Number(contentId);
            const lessonGoals = goals.filter((goal) => normalizeRelationId(goal.lesson) === lessonId);
            const hasConceptual = lessonGoals.filter((goal) => goal.goal_type === 'conceptual').length === 1;
            const hasOperational = lessonGoals.filter((goal) => goal.goal_type === 'operational').length === 1;
            setGoalsComplete(hasConceptual && hasOperational);

            // Récupérer l'ID de l'unité
            if (contentData.unit) {
                setSelectedUnitId(getContentUnitId(contentData.unit) ?? null);
            }

            // Préparer les données du formulaire
            const formData = {
                code: contentData.code || '',
                title: contentData.title || '',
                content: contentData.content || '',
                content_type: contentData.content_type || 'text',
                order: contentData.order || 1,
                unit: getContentUnitId(contentData.unit),
                is_published: contentData.is_published ?? true,
                metadata: contentData.metadata || getDefaultMetadata(contentData.content_type || 'text')
            };

            // Remplir le formulaire
            form.setFieldsValue(formData);
            setInitialDataLoaded(true);
        }
    }, [contentData, contentId, goals, form, initialDataLoaded]);

    useEffect(() => {
        const lessonId = Number(contentId);
        const lessonGoals = goals.filter((goal) => normalizeRelationId(goal.lesson) === lessonId);
        const hasConceptual = lessonGoals.filter((goal) => goal.goal_type === 'conceptual').length === 1;
        const hasOperational = lessonGoals.filter((goal) => goal.goal_type === 'operational').length === 1;
        setGoalsComplete(hasConceptual && hasOperational);
    }, [contentId, goals]);

    const funHanldeOnCancel = () => {
        form.resetFields();
        setCurrentStep(0);
        setContentType('text');
        setInitialDataLoaded(false);
        onCancel();
    };

    // Options pour les types de contenu avec design amélioré
    const contentTypes = [
        {
            value: 'text',
            label: t('content.types.text'),
            icon: <FileTextOutlined style={{ fontSize: '2rem', color: '#3b82f6' }} />,
            gradient: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-200',
            color: 'blue'
        },
        {
            value: 'video',
            label: t('content.types.video'),
            icon: <VideoCameraOutlined style={{ fontSize: '2rem', color: '#ef4444' }} />,
            gradient: 'from-red-50 to-red-100',
            borderColor: 'border-red-200',
            color: 'red'
        },
        {
            value: 'image',
            label: t('content.types.image'),
            icon: <PictureOutlined style={{ fontSize: '2rem', color: '#8b5cf6' }} />,
            gradient: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200',
            color: 'purple'
        },
        {
            value: 'audio',
            label: t('content.types.audio'),
            icon: <SoundOutlined style={{ fontSize: '2rem', color: '#10b981' }} />,
            gradient: 'from-green-50 to-green-100',
            borderColor: 'border-green-200',
            color: 'green'
        },
        {
            value: 'pdf',
            label: t('content.types.pdf'),
            icon: <FilePdfOutlined style={{ fontSize: '2rem', color: '#f97316' }} />,
            gradient: 'from-orange-50 to-orange-100',
            borderColor: 'border-orange-200',
            color: 'orange'
        },
    ];

    // Options pour la taille de police
    const fontSizes = [
        { value: 'small', label: t('content.fontSizes.small'), size: '14px' },
        { value: 'medium', label: t('content.fontSizes.medium'), size: '16px' },
        { value: 'large', label: t('content.fontSizes.large'), size: '18px' },
        { value: 'xlarge', label: t('content.fontSizes.xlarge'), size: '20px' },
    ];

    const steps = [
        {
            title: t('form.steps.step2.title'),
            description: t('form.steps.step2.description'),
            icon: <InfoCircleOutlined />
        },
        {
            title: t('form.steps.step3.title'),
            description: t('form.steps.step3.description'),
            icon: <FontSizeOutlined />
        },
        {
            title: t('form.steps.step4.title'),
            description: t('form.steps.step4.description'),
            icon: <CheckCircleOutlined />
        }
    ];

    const handleContentTypeChange = (value: string) => {
        setContentType(value);
        form.setFieldsValue({
            content_type: value,
            metadata: getDefaultMetadata(value)
        });
    };

    const getDefaultMetadata = (type: string) => {
        switch (type) {
            case 'text':
                return { font_size: 'medium', has_quiz: false };
            case 'video':
                return { duration: 0, autoplay: false };
            case 'image':
                return { width: 800, height: 600, alt_text: '' };
            case 'audio':
                return { duration: 0, autoplay: false };
            default:
                return {};
        }
    };

    const renderMetadataFields = () => {
        switch (contentType) {
            case 'text':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-4">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={['metadata', 'font_size']}
                                        label={<Text strong>{t('form.fields.fontSize')}</Text>}
                                        rules={[{ required: true, message: t('form.validation.requiredFontSize') }]}
                                    >
                                        <Select
                                            placeholder={t('form.placeholders.selectFontSize')}
                                            className="w-full"
                                            dropdownStyle={{ borderRadius: '8px' }}
                                        >
                                            {fontSizes.map(size => (
                                                <Option key={size.value} value={size.value}>
                                                    <Space>
                                                        <span style={{ fontSize: size.size }}>Aa</span>
                                                        <span>{size.label}</span>
                                                    </Space>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </motion.div>
                );

            case 'video':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl mb-4">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={['metadata', 'duration']}
                                        label={<Text strong>{t('form.fields.duration')}</Text>}
                                        rules={[{ required: true, message: t('form.validation.requiredDuration') }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            className="w-full"
                                            placeholder={t('form.placeholders.duration')}
                                            addonAfter={t('dashboard_admin.stats.minutes')}
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </motion.div>
                );

            case 'image':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-4">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={['metadata', 'width']}
                                        label={<Text strong>{t('form.fields.width')}</Text>}
                                    >
                                        <InputNumber
                                            min={0}
                                            className="w-full"
                                            placeholder="800"
                                            addonAfter="px"
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={['metadata', 'height']}
                                        label={<Text strong>{t('form.fields.height')}</Text>}
                                    >
                                        <InputNumber
                                            min={0}
                                            className="w-full"
                                            placeholder="600"
                                            addonAfter="px"
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item
                                        name={['metadata', 'alt_text']}
                                        label={<Text strong>{t('form.fields.altText')}</Text>}
                                    >
                                        <Input
                                            placeholder={t('form.placeholders.altText')}
                                            style={{ borderRadius: '8px' }}
                                            prefix={<InfoCircleOutlined className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </motion.div>
                );

            case 'audio':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-4">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={['metadata', 'duration']}
                                        label={<Text strong>{t('form.fields.duration')}</Text>}
                                    >
                                        <InputNumber
                                            min={0}
                                            className="w-full"
                                            placeholder={t('form.placeholders.duration')}
                                            addonAfter={t('common.seconds')}
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    const handleNext = async () => {
        try {
            await form.validateFields();
            setCurrentStep(currentStep + 1);
        } catch (error) {
            message.error({
                content: t('form.validation.fillRequiredFields'),
                icon: <InfoCircleOutlined className="text-red-500" />,
                style: { borderRadius: '8px' }
            });
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue(true);

            if (values.is_published === true && !goalsComplete) {
                message.error('Impossible de publier : la leçon doit avoir exactement 1 Goal Conceptual et 1 Goal Operational.');
                form.setFieldValue('is_published', false);
                return;
            }

            const formattedData: TypeContent = {
                id: contentId,
                code: values.code,
                title: values.title,
                unit: selectedUnitId!,
                content: values.content,
                is_published: goalsComplete ? (values.is_published ?? true) : false,
            };

            console.log('Data to update:', formattedData);

            updateContent(formattedData, {
                onSuccess: () => {
                    funHanldeOnCancel();
                    message.success({
                        content: t('messages.success.contentUpdated'),
                        icon: <CheckCircleOutlined className="text-green-500" />,
                        style: { borderRadius: '8px' }
                    });
                    onCancel();
                    funHanldeOnCancel();
                },
                onError: (error) => {
                    message.error({
                        content: t('messages.errors.updateContentError'),
                        style: { borderRadius: '8px' }
                    });
                    console.error(error);
                }
            });

        } catch (error) {
            message.error({
                content: t('messages.errors.updateContentError'),
                style: { borderRadius: '8px' }
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case -1:
                return (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* <div className="text-center mb-8">
                            <Title level={3} className="!text-gray-800 mb-2">
                                {t('form.contentType.title')}
                            </Title>
                            <Text type="secondary" className="text-lg">
                                {t('form.contentType.updateDescription')}
                            </Text>
                        </div> */}

                        <Form.Item
                            name="content_type"
                            rules={[{ required: true, message: t('form.validation.requiredContentType') }]}
                        >
                            <Radio.Group
                                className="w-full"
                                onChange={(e) => handleContentTypeChange(e.target.value)}
                                value={contentType}
                            >
                                <Row gutter={[16, 16]} className="w-full">
                                    {contentTypes.map(type => (
                                        <Col xs={24} sm={12} md={8} key={type.value}>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Radio.Button
                                                    value={type.value}
                                                    className={`w-full h-36 border-2 transition-all duration-300
                                                        ${contentType === type.value
                                                            ? `border-${type.color}-500 bg-gradient-to-br ${type.gradient} shadow-lg`
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    style={{
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '1rem'
                                                    }}
                                                >
                                                    <Space direction="vertical" align="center" size={8}>
                                                        <div className={`p-3 rounded-full 
                                                            ${contentType === type.value
                                                                ? `bg-${type.color}-100`
                                                                : 'bg-gray-50'
                                                            }`}>
                                                            {type.icon}
                                                        </div>
                                                        <Text strong={contentType === type.value}>
                                                            {type.label}
                                                        </Text>
                                                        {contentType === type.value && (
                                                            <Badge
                                                                count={<CheckCircleOutlined className={`text-${type.color}-500`} />}
                                                            />
                                                        )}
                                                    </Space>
                                                </Radio.Button>
                                            </motion.div>
                                        </Col>
                                    ))}
                                </Row>
                            </Radio.Group>
                        </Form.Item>
                    </motion.div>
                );

            case 0:
                return (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="code"
                                        label={<Text strong>{t('curriculum.code')}</Text>}
                                        rules={[{ required: true, message: t('curriculum.required') }]}
                                    >
                                        <Input placeholder="MATH-5AP-01-02" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="title"
                                        label={<Text strong>{t('form.fields.title')}</Text>}
                                        rules={[{ required: true, message: t('form.validation.requiredTitle') }]}
                                    >
                                        <Input
                                            placeholder={t('form.placeholders.title')}
                                            size="large"
                                            className="rounded-lg"
                                            prefix={<FileTextOutlined className="text-gray-400" />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="order"
                                        label={<Text strong>{t('form.fields.order')}</Text>}
                                        rules={[{ required: true, message: t('form.validation.requiredOrder') }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            className="w-full rounded-lg"
                                            size="large"
                                            placeholder="1"
                                            prefix={<ClockCircleOutlined className="text-gray-400 mr-1" />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="content"
                                label={<Text strong>{t('form.fields.content')}</Text>}
                                rules={[{ required: true, message: t('form.validation.requiredContent') }]}
                            >
                                {contentType === 'text' ? (
                                    <TextArea
                                        rows={6}
                                        placeholder={t('form.placeholders.content')}
                                        showCount
                                        maxLength={5000}
                                        className="rounded-lg"
                                    />
                                ) : (
                                    <Input
                                        placeholder={
                                            contentType === 'video' ? t('form.placeholders.videoUrl') :
                                                contentType === 'image' ? t('form.placeholders.imageUrl') :
                                                    contentType === 'audio' ? t('form.placeholders.audioUrl') :
                                                        t('form.placeholders.fileUrl')
                                        }
                                        size="large"
                                        className="rounded-lg"
                                        prefix={
                                            contentType === 'video' ? <VideoCameraOutlined className="text-gray-400" /> :
                                                contentType === 'image' ? <PictureOutlined className="text-gray-400" /> :
                                                    contentType === 'audio' ? <SoundOutlined className="text-gray-400" /> :
                                                        <FileTextOutlined className="text-gray-400" />
                                        }
                                    />
                                )}
                            </Form.Item>

                            <Form.Item
                                name="unit"
                                label={<Text strong>{t('form.fields.unit')}</Text>}
                                rules={[{ required: true, message: t('form.validation.requiredUnit') }]}
                            >
                                <Select
                                    placeholder={t('form.placeholders.selectUnit')}
                                    size="large"
                                    className="rounded-lg"
                                    showSearch
                                    optionFilterProp="children"
                                    notFoundContent={isPendingChapitre ? <SpinnerLoader /> : t('common.noData')}
                                    dropdownStyle={{ borderRadius: '8px' }}
                                >
                                    {chapitreData?.map(unit => (
                                        <Option key={unit.id} value={unit.id}>
                                            <Space>
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                {unit.title}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="is_published" valuePropName="checked">
                                {!goalsComplete && (
                                    <Alert
                                        type="warning"
                                        showIcon
                                        className="mb-3"
                                        message="La publication nécessite 1 Goal Conceptual et 1 Goal Operational."
                                    />
                                )}
                                <Radio.Group>
                                    <Radio value={true} disabled={!goalsComplete}>{t('common.yes')}</Radio>
                                    <Radio value={false}>{t('common.no')}</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    </motion.div>
                );

            case 1:
                return (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Title level={4} className="!text-gray-700">
                                    {t('form.metadata.title')}
                                </Title>
                                <Tag color="blue" className="px-3 py-1">
                                    {contentTypes.find(c => c.value === contentType)?.label}
                                </Tag>
                            </div>
                            <AnimatePresence mode="wait">
                                {renderMetadataFields()}
                            </AnimatePresence>

                            <Progress
                                percent={100}
                                showInfo={false}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                className="mt-4"
                            />
                        </div>
                    </motion.div>
                );

            case 2:
                const formValues = form.getFieldsValue(true);

                return (
                    <motion.div
                        key="step-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mb-6">
                            {/* <div className="text-center mb-6">
                                <EditOutlined className="text-5xl text-blue-500 mb-3" />
                                <Title level={3} className="!text-blue-800">
                                    {t('form.summary.reviewUpdate')}
                                </Title>
                                <Text className="text-blue-600">
                                    {t('form.summary.checkBeforeUpdate')}
                                </Text>
                            </div> */}

                            <Card className="shadow-sm border-blue-100">
                                <Space direction="vertical" size="middle" className="w-full">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <Text strong className="text-gray-600 w-32">
                                            {t('form.summary.type')}:
                                        </Text>
                                        <Tag color={contentTypes.find(c => c.value === formValues.content_type)?.color || 'blue'}
                                            className="px-4 py-1 text-sm">
                                            {contentTypes.find(c => c.value === formValues.content_type)?.label}
                                        </Tag>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <Text strong className="text-gray-600 w-32">
                                            {t('form.summary.title')}:
                                        </Text>
                                        <Text className="text-gray-800 font-medium">
                                            {formValues.title || '—'}
                                        </Text>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <Text strong className="text-gray-600 w-32">
                                            {t('form.summary.order')}:
                                        </Text>
                                        <Badge
                                            count={formValues.order || 1}
                                            style={{ backgroundColor: '#52c41a' }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <Text strong className="text-gray-600 w-32">
                                            {t('form.summary.unit')}:
                                        </Text>
                                        <div className="flex items-center gap-2">
                                            {isPendingChapitreOnce ? (
                                                <SpinnerLoader />
                                            ) : (
                                                <>
                                                    <Tag color="green" className="px-3 py-1">
                                                        {onceChapitre?.title || t('common.notSelected')}
                                                    </Tag>
                                                    {onceChapitre?.description && (
                                                        <Tooltip title={onceChapitre.description}>
                                                            <InfoCircleOutlined className="text-gray-400 cursor-help" />
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {contentType === 'text' && formValues.metadata?.font_size && (
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <Text strong className="text-gray-600 w-32">
                                                {t('form.fields.fontSize')}:
                                            </Text>
                                            <Tag color="blue">
                                                {fontSizes.find(f => f.value === formValues.metadata.font_size)?.label}
                                            </Tag>
                                        </div>
                                    )}

                                    {formValues.metadata?.duration > 0 && (
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <Text strong className="text-gray-600 w-32">
                                                {t('form.fields.duration')}:
                                            </Text>
                                            <Tag color="orange">
                                                {formValues.metadata.duration} {t('dashboard_admin.stats.minutes')}
                                            </Tag>
                                        </div>
                                    )}
                                </Space>
                            </Card>
                        </div>
                    </motion.div>
                );
        }
    };

    if (isPendingContent || isPendingChapitre) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SpinnerLoader />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    className="max-w-5xl mx-auto shadow-2xl border-0 overflow-hidden"
                    style={{
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div className="mb-2">
                        <div className="grid grid-cols-2 mb-4">
                            <Badge
                                count={`${currentStep + 1}/${steps.length}`}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                        </div>

                        <div className="text-center mb-6">
                            <Title level={2} className="!text-gray-800 !mb-2 flex items-center justify-center gap-3">
                                <EditOutlined className="text-blue-600 bg-blue-100 p-2 rounded-lg" />
                                {/* {t('page.updateTitle')} */}
                            </Title>
                            <Text type="secondary" className="text-lg">
                                {/* {t('page.updateDescription')} */}
                            </Text>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <Steps
                                current={currentStep}
                                className="custom-steps"
                                size="small"
                                labelPlacement="vertical"
                                responsive
                            >
                                {steps.map((step, index) => (
                                    <Step
                                        key={index}
                                        title={step.title}
                                        icon={step.icon}
                                        description={
                                            <Text type="secondary" className="text-xs hidden md:block">
                                                {step.description}
                                            </Text>
                                        }
                                    />
                                ))}
                            </Steps>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            content_type: 'text',
                            order: 1,
                            metadata: getDefaultMetadata('text')
                        }}
                        className="space-y-1"
                    >
                        <AnimatePresence mode="wait">
                            <div className="">
                                {renderStepContent()}
                            </div>
                        </AnimatePresence>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <Button
                                        onClick={handlePrev}
                                        size="large"
                                        className="w-full sm:w-auto rounded-lg px-6"
                                        icon={<ArrowLeftOutlined />}
                                    >
                                        {t('common.buttons.previous')}
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={funHanldeOnCancel}
                                    size="large"
                                    className="w-full sm:w-auto rounded-lg px-6 border-gray-300 hover:border-gray-400"
                                >
                                    {t('common.buttons.cancel')}
                                </Button>

                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        onClick={handleNext}
                                        size="large"
                                        className="w-full sm:w-auto rounded-lg px-8 !bg-blue-600 !text-white hover:!bg-blue-700"
                                    >
                                        {t('common.buttons.next')}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        htmlType="submit"
                                        size="large"
                                        loading={loading || isPendingUpdate}
                                        icon={<SaveOutlined />}
                                        className="w-full sm:w-auto rounded-lg px-8 !bg-blue-600 !text-white hover:!bg-blue-700"
                                    >
                                        تحديث
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form>
                </Card>
            </motion.div>

            <style>{`
                .custom-steps .ant-steps-item-icon {
                    background: white !important;
                    border-color: #1890ff !important;
                }
                .custom-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: #1890ff !important;
                }
                .custom-steps .ant-steps-item-process .ant-steps-icon {
                    color: white !important;
                }
                .ant-radio-button-wrapper-checked {
                    box-shadow: 0 4px 12px rgba(24,144,255,0.2) !important;
                }
            `}</style>
        </div>
    );
};