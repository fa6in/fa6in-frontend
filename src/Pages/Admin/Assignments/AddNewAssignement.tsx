

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    Space,
    Typography,
    Switch,
    InputNumber,
    Radio,
    Divider,
    Alert,
    Tag,
    Tooltip,
    Steps,
    Badge
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    BulbOutlined,
    FieldTimeOutlined,
    TrophyOutlined,
    OrderedListOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import { useAddActivite } from '../../../Services/Admin/Assignments/useAddAssignement';
import type { Activitytype } from '../../../Services/Admin/Assignments/typeAssignement';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Types d'activités
type ActivityType = 'multiple_choice' | 'true_false' | 'fill_blank';

interface BaseActivity {
    title: string;
    activity_type: ActivityType;
    question: string;
    points: number;
    explanation?: string;
    time_limit?: number;
    order: number;
    is_active: boolean;
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

type Activity = MultipleChoiceActivity | TrueFalseActivity | FillBlankActivity;

type props = {
    onCancel: () => void;
}

const AddNewAssignment = ({ onCancel }: props) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [activityType, setActivityType] = useState<ActivityType>('multiple_choice');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [currentStep, setCurrentStep] = useState(0);
    const [previewMode, setPreviewMode] = useState(true);
    const [formValues, setFormValues] = useState<any>({});

    const { data: chapitres, isPending: isChapitresPending } = useGetChapitre();
    const { mutate: addActivity, isPending: isPendigAdd } = useAddActivite();

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // CORRECTION: Utiliser useCallback pour éviter les recréations de fonction
    const updateFormValues = useCallback(() => {
        const values = form.getFieldsValue();
        setFormValues(values);
    }, [form]);

    // CORRECTION: useEffect avec dépendance correcte
    useEffect(() => {
        // Ne mettre à jour que si les valeurs ont vraiment changé
        const values = form.getFieldsValue();
        if (JSON.stringify(values) !== JSON.stringify(formValues)) {
            setFormValues(values);
        }
    }, [form, form.getFieldsValue()]); // Ajout de la dépendance correcte

    const handleActivityTypeChange = (value: ActivityType) => {
        setActivityType(value);
        form.setFieldsValue({ activity_type: value });

        // Réinitialiser les champs spécifiques
        if (value === 'multiple_choice') {
            setOptions(['', '', '', '']);
            form.setFieldsValue({ correct_answer: undefined });
        } else if (value === 'true_false') {
            form.setFieldsValue({
                options: ['صح', 'خطأ'],
                correct_answer: undefined
            });
        } else {
            form.setFieldsValue({ correct_answer: '' });
        }

        // Mettre à jour la prévisualisation
        setTimeout(() => updateFormValues(), 0);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
        // Mettre à jour la prévisualisation
        setTimeout(() => updateFormValues(), 0);
    };

    // Ajoutez cette fonction dans votre composant
    const handleNext = async () => {
        try {
            // Valider les champs de l'étape courante
            let fieldsToValidate: string[] = [];

            switch (currentStep) {
                case 0:
                    fieldsToValidate = ['activity_type', "unit"];
                    break;
                case 1:
                    fieldsToValidate = ['title', 'question', 'points'];
                    break;
                case 2:
                    if (activityType === 'multiple_choice') {
                        // Vérifier que les options ne sont pas vides
                        if (options.filter(opt => opt.trim() !== '').length < 2) {
                            form.setFields([
                                {
                                    name: 'options',
                                    errors: [t('addActivity.validation.minOptions')]
                                }
                            ]);
                            return;
                        }
                    }
                    fieldsToValidate = ['correct_answer'];
                    break;
            }

            // Valider les champs requis
            await form.validateFields(fieldsToValidate);

            // Si validation réussie, passer à l'étape suivante
            setCurrentStep(prev => prev + 1);
        } catch (error) {
            // La validation a échoué, Ant Design affiche automatiquement les erreurs
            console.log('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        onCancel();
        form.resetFields();
        setCurrentStep(0)
    }

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        // Mettre à jour la prévisualisation
        setTimeout(() => updateFormValues(), 0);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
        // Mettre à jour la prévisualisation
        setTimeout(() => updateFormValues(), 0);
    };

    const handleSubmit = async () => {
        let activityData: Activity;

        const values = form.getFieldsValue(true);

        // console.log('Form values new new submit:', valuesnEW);
        switch (activityType) {
            case 'multiple_choice':
                activityData = {
                    ...values,
                    options: options.filter(opt => opt.trim() !== ''),
                    correct_answer: parseInt(values.correct_answer)
                } as MultipleChoiceActivity;
                break;
            case 'true_false':
                activityData = {
                    ...values,
                    options: ['صح', 'خطأ'],
                    correct_answer: parseInt(values.correct_answer) as 0 | 1
                } as TrueFalseActivity;
                break;
            case 'fill_blank':
                activityData = {
                    ...values,
                    correct_answer: values.correct_answer
                } as FillBlankActivity;
                break;
            default:
                return;
        }

        console.log('Activity data:', activityData);

        const params: Activitytype = {
            title: activityData.title ? activityData.title : "",
            activity_type: activityType,
            options: 'options' in activityData ? activityData.options : undefined,
            correct_answer: activityData.correct_answer,
            is_active: activityData.is_active ? activityData.is_active : true,
            order: activityData.order ? activityData.order : 1,
            points: activityData.points ? activityData.points : 10,
            question: activityData.question ? activityData.question : "",
            unit: activityData?.unit!,
            explanation: activityData.explanation ? activityData.explanation : "",

        }
        console.log('Params to submit:', params);
        await addActivity(params, {
            onSuccess: () => {
                handleCancel()
            }
        });
    };

    const renderActivityPreview = () => {
        const values = formValues;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 shadow-inner"
            >
                {/* En-tête de prévisualisation */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <Space>
                        <Badge status="processing" color="green" />
                        <Text type="secondary" className="text-xs uppercase tracking-wider">
                            {t('addActivity.preview.livePreview')}
                        </Text>
                    </Space>
                    <Tag color="green" className="text-xs">
                        {t('addActivity.preview.realtime')}
                    </Tag>
                </div>

                {/* Tags d'information */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Tag color="green" className="px-3 py-1 text-sm font-medium">
                        {activityType === 'multiple_choice' && t('addActivity.form.step1.activityType.multipleChoice.tag')}
                        {activityType === 'true_false' && t('addActivity.form.step1.activityType.trueFalse.tag')}
                        {activityType === 'fill_blank' && t('addActivity.form.step1.activityType.fillBlank.tag')}
                    </Tag>
                    {values.points && (
                        <Tag color="gold" className="px-3 py-1 text-sm font-medium">
                            <TrophyOutlined className="mr-1" /> {values.points} {t('addActivity.preview.points')}
                        </Tag>
                    )}
                    {values.time_limit && (
                        <Tag color="cyan" className="px-3 py-1 text-sm font-medium">
                            <FieldTimeOutlined className="mr-1" /> {values.time_limit}s
                        </Tag>
                    )}
                    {values.is_active === false && (
                        <Tag color="default" className="px-3 py-1 text-sm font-medium">
                            {t('addActivity.preview.inactive')}
                        </Tag>
                    )}
                </div>

                {/* Titre et question */}
                <div className="mb-6">
                    <Title level={4} className="!mb-2 text-gray-800">
                        {values.title || (
                            <span className="text-gray-400 italic">
                                {t('addActivity.preview.titlePlaceholder')}
                            </span>
                        )}
                    </Title>
                    <Paragraph className="text-base bg-white p-4 rounded-lg border border-gray-200">
                        {values.question || (
                            <span className="text-gray-400 italic">
                                {t('addActivity.preview.questionPlaceholder')}
                            </span>
                        )}
                    </Paragraph>
                </div>

                {/* Contenu dynamique selon le type */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activityType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activityType === 'multiple_choice' && (
                            <div className="space-y-3">
                                {options.filter(opt => opt.trim() !== '').length > 0 ? (
                                    options.filter(opt => opt.trim() !== '').map((opt, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Card
                                                className={`border-2 transition-all duration-200 ${values.correct_answer === idx
                                                    ? 'border-green-500 bg-green-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                size="small"
                                            >
                                                <Radio checked={values.correct_answer === idx} className="w-full">
                                                    <Text strong className={values.correct_answer === idx ? 'text-green-700' : ''}>
                                                        {opt}
                                                    </Text>
                                                </Radio>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                        <Text type="secondary" className="italic">
                                            {t('addActivity.preview.noOptions')}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        )}

                        {activityType === 'true_false' && (
                            <div className="space-y-3">
                                {['صح', 'خطأ'].map((opt, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card
                                            className={`border-2 transition-all duration-200 cursor-pointer ${values.correct_answer === idx
                                                ? idx === 0
                                                    ? 'border-green-500 bg-green-50 shadow-md'
                                                    : 'border-red-500 bg-red-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            size="small"
                                        >
                                            <div className="flex items-center gap-3">
                                                {idx === 0 ? (
                                                    <CheckCircleOutlined className={`text-xl ${values.correct_answer === idx ? 'text-green-500' : 'text-gray-400'}`} />
                                                ) : (
                                                    <CloseOutlined className={`text-xl ${values.correct_answer === idx ? 'text-red-500' : 'text-gray-400'}`} />
                                                )}
                                                <Text strong className={values.correct_answer === idx
                                                    ? idx === 0 ? 'text-green-700' : 'text-red-700'
                                                    : 'text-gray-700'
                                                }>
                                                    {opt}
                                                </Text>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activityType === 'fill_blank' && (
                            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-green-300">
                                <Text className="text-base mb-4 block text-gray-700">
                                    {values.question || (
                                        <span className="text-gray-400 italic">
                                            {t('addActivity.preview.fillBlankQuestion')}
                                        </span>
                                    )}
                                </Text>
                                <div className="relative">
                                    <Input
                                        placeholder={t('addActivity.preview.correctAnswerPlaceholder')}
                                        value={values.correct_answer}
                                        className="rounded-lg bg-gray-50"
                                        readOnly
                                        prefix={<CheckCircleOutlined className="text-green-500" />}
                                    />
                                    {values.correct_answer && (
                                        <Tag color="green" className="absolute -top-2 -right-2">
                                            {t('addActivity.preview.correctAnswer')}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Explication */}
                {values.explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4"
                    >
                        <Alert
                            message={
                                <Space>
                                    <BulbOutlined className="text-yellow-500" />
                                    <Text strong>{t('addActivity.preview.explanation')}</Text>
                                </Space>
                            }
                            description={values.explanation}
                            type="info"
                            showIcon={false}
                            className="bg-yellow-50 border-yellow-200"
                        />
                    </motion.div>
                )}

                {/* Indicateur d'ordre */}
                {values.order && (
                    <div className="mt-4 text-right text-xs text-gray-400">
                        {t('addActivity.preview.order')} {values.order}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur sticky top-4 z-10">
                    <div className="flex items-center justify-between">
                        <Space>
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                <PlusOutlined className="text-3xl text-green-500" />
                            </motion.div>
                            <div>
                                <Title level={3} className="!mb-0">
                                    {t('addActivity.title')}
                                </Title>
                                <Text className="text-gray-500">
                                    {t('addActivity.subtitle')}
                                </Text>
                            </div>
                        </Space>
                        <Space>
                            <Tooltip title={previewMode ? t('addActivity.hidePreview') : t('addActivity.showPreview')}>
                                <Button
                                    type={previewMode ? 'primary' : 'default'}
                                    icon={previewMode ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className={previewMode ? 'bg-green-500' : ''}
                                >
                                    {previewMode ? t('addActivity.buttons.hidePreview') : t('addActivity.buttons.showPreview')}
                                </Button>
                            </Tooltip>
                        </Space>
                    </div>
                </Card>

                {/* Steps */}
                <Card className="mb-6 shadow-lg border-0">
                    <Steps
                        current={currentStep}
                        items={[
                            { title: t('addActivity.steps.step1.title') },
                            { title: t('addActivity.steps.step2.title') },
                            { title: t('addActivity.steps.step3.title') }
                        ]}
                    />
                </Card>

                <div className={`grid ${previewMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                    {/* Formulaire */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        layout
                    >
                        <Card className="shadow-xl border-0">
                            <Form
                                form={form}
                                layout="vertical"

                                onValuesChange={updateFormValues} // CORRECTION: Utiliser la fonction memoïsée
                                initialValues={{
                                    is_active: true,
                                    order: 1,
                                    points: 10,
                                    time_limit: 60
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {currentStep === 0 && (
                                        <motion.div
                                            key="step1"
                                            variants={fadeInUp}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                        >
                                            <Title level={4} className="!mb-6">
                                                {t('addActivity.form.step1.title')}
                                            </Title>

                                            <Form.Item
                                                name="activity_type"
                                                label={t('addActivity.form.step1.activityType.label')}
                                                rules={[{ required: true, message: t('addActivity.form.step1.activityType.required') }]}
                                            >
                                                <Select
                                                    size="large"
                                                    placeholder={t('addActivity.form.step1.activityType.placeholder')}
                                                    onChange={handleActivityTypeChange}
                                                    className="w-full"
                                                >
                                                    <Option value="multiple_choice">
                                                        <Space>
                                                            <Tag color="green">{t('addActivity.form.step1.activityType.multipleChoice.tag')}</Tag>
                                                            <Text>{t('addActivity.form.step1.activityType.multipleChoice.description')}</Text>
                                                        </Space>
                                                    </Option>
                                                    <Option value="true_false">
                                                        <Space>
                                                            <Tag color="green">{t('addActivity.form.step1.activityType.trueFalse.tag')}</Tag>
                                                            <Text>{t('addActivity.form.step1.activityType.trueFalse.description')}</Text>
                                                        </Space>
                                                    </Option>
                                                    <Option value="fill_blank">
                                                        <Space>
                                                            <Tag color="purple">{t('addActivity.form.step1.activityType.fillBlank.tag')}</Tag>
                                                            <Text>{t('addActivity.form.step1.activityType.fillBlank.description')}</Text>
                                                        </Space>
                                                    </Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                name="unit"
                                                label={t('addActivity.chapter.label')}
                                                rules={[{ required: true, message: t('addActivity.chapter.required') }]}
                                            >
                                                <Select
                                                    size="large"
                                                    placeholder={t('addActivity.chapter.placeholder')}
                                                    loading={isChapitresPending}
                                                    className="w-full"
                                                    showSearch
                                                    optionFilterProp="label" // Changé de "children" à "label"
                                                    filterOption={(input, option) =>
                                                        (option?.label as unknown as string)?.toLowerCase()?.includes(input.toLowerCase())
                                                    }
                                                    notFoundContent={t('addActivity.chapter.noData')}
                                                >
                                                    {chapitres?.map((chapitre: typeChapitre) => (
                                                        <Option
                                                            key={chapitre.id}
                                                            value={chapitre.id}
                                                            label={chapitre.title} // Ajout de la propriété label
                                                        >
                                                            <Space>
                                                                <BookOutlined className="text-blue-500" />
                                                                <Text>{chapitre.title}</Text>
                                                            </Space>
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </motion.div>
                                    )}

                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step2"
                                            variants={fadeInUp}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="space-y-4"
                                        >
                                            <Title level={4} className="!mb-6">
                                                {t('addActivity.form.step2.title')}
                                            </Title>

                                            <Form.Item
                                                name="title"
                                                label={t('addActivity.form.step2.titleField.label')}
                                                rules={[{ required: true, message: t('addActivity.form.step2.titleField.required') }]}
                                            >
                                                <Input
                                                    size="large"
                                                    placeholder={t('addActivity.form.step2.titleField.placeholder')}
                                                    prefix={<OrderedListOutlined className="text-gray-400" />}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="question"
                                                label={t('addActivity.form.step2.question.label')}
                                                rules={[{ required: true, message: t('addActivity.form.step2.question.required') }]}
                                            >
                                                <TextArea
                                                    rows={4}
                                                    placeholder={t('addActivity.form.step2.question.placeholder')}
                                                    className="resize-none"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="points"
                                                label={t('addActivity.form.step2.points.label')}
                                                rules={[{ required: true, message: t('addActivity.form.step2.points.required') }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={100}
                                                    className="w-full"
                                                    prefix={<TrophyOutlined className="text-yellow-500" />}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="order"
                                                label={t('addActivity.form.step2.order.label')}
                                                tooltip={t('addActivity.form.step2.order.tooltip')}
                                            >
                                                <InputNumber min={1} className="w-full" />
                                            </Form.Item>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step3"
                                            variants={fadeInUp}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="space-y-4"
                                        >
                                            <Title level={4} className="!mb-6">
                                                {t('addActivity.form.step3.title')}
                                            </Title>

                                            {activityType === 'multiple_choice' && (
                                                <Form.Item
                                                    label={t('addActivity.form.step3.options.label')}
                                                    required
                                                >
                                                    <div className="space-y-3">
                                                        {options.map((opt, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex gap-2"
                                                            >
                                                                <Input
                                                                    placeholder={t('addActivity.form.step3.options.placeholder', { number: index + 1 })}
                                                                    value={opt}
                                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                    className="flex-1"
                                                                />
                                                                {options.length > 2 && (
                                                                    <Button
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => handleRemoveOption(index)}
                                                                    />
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                        <Button
                                                            type="dashed"
                                                            onClick={handleAddOption}
                                                            icon={<PlusOutlined />}
                                                            block
                                                        >
                                                            {t('addActivity.form.step3.options.addOption')}
                                                        </Button>
                                                    </div>
                                                </Form.Item>
                                            )}

                                            <Form.Item
                                                name="correct_answer"
                                                label={t('addActivity.form.step3.correctAnswer.label')}
                                                rules={[{ required: true, message: t('addActivity.form.step3.correctAnswer.required') }]}
                                            >
                                                {activityType === 'multiple_choice' ? (
                                                    <Select placeholder={t('addActivity.form.step3.correctAnswer.placeholder')}>
                                                        {options.map((opt, idx) => (
                                                            <Option key={idx} value={idx}>
                                                                {opt || t('addActivity.form.step3.options.placeholder', { number: idx + 1 })}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                ) : activityType === 'true_false' ? (
                                                    <Radio.Group>
                                                        <Space direction="vertical">
                                                            <Radio value={0}>{t('addActivity.form.step3.correctAnswer.true')}</Radio>
                                                            <Radio value={1}>{t('addActivity.form.step3.correctAnswer.false')}</Radio>
                                                        </Space>
                                                    </Radio.Group>
                                                ) : (
                                                    <Input placeholder={t('addActivity.form.step3.correctAnswer.enterAnswer')} />
                                                )}
                                            </Form.Item>

                                            <Form.Item
                                                name="explanation"
                                                label={t('addActivity.form.step3.explanation.label')}
                                            >
                                                <TextArea
                                                    rows={3}
                                                    placeholder={t('addActivity.form.step3.explanation.placeholder')}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="time_limit"
                                                label={t('addActivity.form.step3.timeLimit.label')}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    className="w-full"
                                                    prefix={<FieldTimeOutlined className="text-gray-400" />}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="is_active"
                                                label={t('addActivity.form.step3.isActive.label')}
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Divider />

                                {/* Navigation buttons */}
                                <div className="flex justify-between">
                                    <Button
                                        onClick={currentStep === 0 ? handleCancel : () => setCurrentStep(prev => Math.max(0, prev - 1))}
                                        icon={currentStep === 0 ? <CloseOutlined /> : <ArrowRightOutlined />}
                                    >
                                        {/* {t('addActivity.buttons.previous')} */}
                                        {currentStep === 0 ? t('common.buttons.cancel') : t('addActivity.buttons.previous')}
                                    </Button>

                                    <Space>
                                        {/* <Button onClick={() => form.resetFields()}>
                                            {t('addActivity.buttons.reset')}
                                        </Button> */}

                                        {currentStep < 2 ? (
                                            <Button
                                                type="primary"
                                                // onClick={() => setCurrentStep(prev => prev + 1)}
                                                onClick={handleNext}

                                                icon={<ArrowLeftOutlined />}
                                            >
                                                {t('addActivity.buttons.next')}
                                            </Button>
                                        ) : (
                                            <Button
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={isPendigAdd}
                                                onClick={handleSubmit}
                                                className="!bg-green-500 !text-white !border-none hover:!bg-green-600"
                                            >
                                                {t('addActivity.buttons.create')}
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>

                    {/* Preview Panel */}
                    <AnimatePresence>
                        {previewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                <Card className="shadow-xl border-0 sticky top-24">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag color="purple" className="px-3 py-1">
                                            {t('addActivity.preview.livePreview')}
                                        </Tag>
                                        <Badge status="processing" color="green" />
                                        <Text type="secondary" className="text-xs">
                                            {t('addActivity.preview.livePreviewDescription')}
                                        </Text>
                                    </div>
                                    {renderActivityPreview()}
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AddNewAssignment;
