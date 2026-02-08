import  { useState } from 'react';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Button,
    Card,
    message,
    Row,
    Col,
    Divider,
    Steps,
    Radio
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    PlusOutlined,
    VideoCameraOutlined,
    FileTextOutlined,
    PictureOutlined,
    SoundOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import SpinnerLoader from '../../../ui/SpinnerLoader';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;
type props = {
    onCancel: () => void
}

export default function AddNewContenu({ onCancel }: props) {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [contentType, setContentType] = useState('text');
    const [loading, setLoading] = useState(false);

    const { data: chapitreData, isPending: isPendingChapitre } = useGetChapitre();


    // Options pour les types de contenu
    const contentTypes = [
        { value: 'text', label: t('content.types.text'), icon: <FileTextOutlined /> },
        { value: 'video', label: t('content.types.video'), icon: <VideoCameraOutlined /> },
        { value: 'image', label: t('content.types.image'), icon: <PictureOutlined /> },
        { value: 'audio', label: t('content.types.audio'), icon: <SoundOutlined /> },
        { value: 'pdf', label: t('content.types.pdf'), icon: <FileTextOutlined /> },
    ];

    // Options pour la taille de police
    const fontSizes = [
        { value: 'small', label: t('content.fontSizes.small') },
        { value: 'medium', label: t('content.fontSizes.medium') },
        { value: 'large', label: t('content.fontSizes.large') },
        { value: 'xlarge', label: t('content.fontSizes.xlarge') },
    ];

    // Options d'unités
    const units = [
        { value: 1, label: t('content.units.unit1') },
        { value: 2, label: t('content.units.unit2') },
        { value: 3, label: t('content.units.unit3') },
    ];

    const steps = [
        {
            title: t('form.steps.step1.title'),
            description: t('form.steps.step1.description')
        },
        {
            title: t('form.steps.step2.title'),
            description: t('form.steps.step2.description')
        },
        {
            title: t('form.steps.step3.title'),
            description: t('form.steps.step3.description')
        },
        {
            title: t('form.steps.step4.title'),
            description: t('form.steps.step4.description')
        }
    ];

    const handleContentTypeChange = (value: string) => {
        setContentType(value);
        form.setFieldsValue({
            metadata: getDefaultMetadata(value)
        });
    };

    const getDefaultMetadata = (type: string) => {
        switch (type) {
            case 'text':
                return { font_size: 'medium', has_quiz: false };
            case 'video':
                return { duration: 0, autoplay: true };
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'font_size']}
                                    label={t('form.fields.fontSize')}
                                    rules={[{ required: true, message: t('form.validation.requiredFontSize') }]}
                                >
                                    <Select placeholder={t('form.placeholders.selectFontSize')}>
                                        {fontSizes.map(size => (
                                            <Option key={size.value} value={size.value}>
                                                {size.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'has_quiz']}
                                    label={t('form.fields.hasQuiz')}
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                    </motion.div>
                );

            case 'video':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'duration']}
                                    label={t('form.fields.duration')}
                                    rules={[{ required: true, message: t('form.validation.requiredDuration') }]}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        placeholder={t('form.placeholders.duration')}
                                        addonAfter={t('common.seconds')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'autoplay']}
                                    label={t('form.fields.autoplay')}
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                    </motion.div>
                );

            case 'image':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'width']}
                                    label={t('form.fields.width')}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        placeholder="800"
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['metadata', 'height']}
                                    label={t('form.fields.height')}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: '100%' }}
                                        placeholder="600"
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name={['metadata', 'alt_text']}
                                    label={t('form.fields.altText')}
                                >
                                    <Input placeholder={t('form.placeholders.altText')} />
                                </Form.Item>
                            </Col>
                        </Row>
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
            message.error(t('form.validation.fillRequiredFields'));
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formattedData = {
                ...values,
                metadata: values.metadata || {}
            };

            console.log('Data to submit:', formattedData);

            // API call would go here
            // await api.post('/api/curriculum/contents/', formattedData);

            message.success(t('messages.success.contentAdded'));
            // form.resetFields();
            // setCurrentStep(0);

            // setTimeout(() => {
            //     navigate('/contenus');
            // }, 1500);

        } catch (error) {
            message.error(t('messages.errors.addContentError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-semibold text-gray-700">
                                {t('form.contentType.title')}
                            </h3>
                            <p className="text-gray-500 mt-2">
                                {t('form.contentType.description')}
                            </p>
                        </div>

                        <Form.Item
                            name="content_type"
                            rules={[{ required: true, message: t('form.validation.requiredContentType') }]}
                        >
                            <Radio.Group
                                className="w-full"
                                onChange={(e) => handleContentTypeChange(e.target.value)}
                                buttonStyle="solid"
                            >
                                <Row gutter={[16, 16]} className="w-full">
                                    {contentTypes.map(type => (
                                        <Col xs={24} sm={12} md={8} key={type.value}>
                                            <Radio.Button
                                                value={type.value}
                                                className="h-32 w-full flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
                                            >
                                                <div className="text-2xl mb-2">{type.icon}</div>
                                                <div className="font-medium">{type.label}</div>
                                            </Radio.Button>
                                        </Col>
                                    ))}
                                </Row>
                            </Radio.Group>
                        </Form.Item>
                    </motion.div>
                );

            case 1:
                return (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="title"
                                    label={t('form.fields.title')}
                                    rules={[{ required: true, message: t('form.validation.requiredTitle') }]}
                                >
                                    <Input
                                        placeholder={t('form.placeholders.title')}
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="order"
                                    label={t('form.fields.order')}
                                    rules={[{ required: true, message: t('form.validation.requiredOrder') }]}
                                >
                                    <InputNumber
                                        min={1}
                                        style={{ width: '100%' }}
                                        size="large"
                                        placeholder="1"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="content"
                            label={t('form.fields.content')}
                            rules={[{ required: true, message: t('form.validation.requiredContent') }]}
                        >
                            {contentType === 'text' ? (
                                <TextArea
                                    rows={6}
                                    placeholder={t('form.placeholders.content')}
                                    showCount
                                    maxLength={5000}
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
                                />
                            )}
                        </Form.Item>

                        <Form.Item
                            name="unit"
                            label={t('form.fields.unit')}
                            rules={[{ required: true, message: t('form.validation.requiredUnit') }]}
                        >
                            <Select
                                placeholder={t('form.placeholders.selectUnit')}
                                size="large"
                                showSearch
                                optionFilterProp="children"
                            >
                                {chapitreData?.map(unit => (
                                    <Option key={unit.id} value={unit.id}>
                                        {unit.title}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Divider orientation="left">{t('form.metadata.title')}</Divider>
                        {renderMetadataFields()}
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h4 className="text-lg font-semibold text-green-800 mb-4">
                                {t('form.summary.title')}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row">
                                    <span className="w-40 font-medium text-gray-600">{t('form.summary.type')}:</span>
                                    <span className="text-gray-800">{form.getFieldValue('content_type')}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="w-40 font-medium text-gray-600">{t('form.summary.title')}:</span>
                                    <span className="text-gray-800">{form.getFieldValue('title')}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="w-40 font-medium text-gray-600">{t('form.summary.order')}:</span>
                                    <span className="text-gray-800">{form.getFieldValue('order')}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="w-40 font-medium text-gray-600">{t('form.summary.unit')}:</span>
                                    <span className="text-gray-800">
                                        {units.find(u => u.value === form.getFieldValue('unit'))?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                {t('form.summary.checkBeforeSubmit')}
                            </p>
                        </div>
                    </motion.div>
                );
        }
    };

    if(isPendingChapitre){
        return <SpinnerLoader/>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    className="max-w-4xl mx-auto shadow-xl border-0"
                    styles={{
                        body: { padding: '2rem' }
                    }}
                >
                    <div className="mb-8">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={onCancel}
                            className="mb-4"
                        >
                            {t('common.buttons.back')}
                        </Button>

                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <PlusOutlined className="text-blue-600" />
                            {t('page.title')}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t('page.description')}
                        </p>
                    </div>

                    <Steps current={currentStep} className="mb-8">
                        {steps.map((step, index) => (
                            <Step
                                key={index}
                                title={step.title}
                            // description={step.description}
                            />
                        ))}
                    </Steps>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            content_type: 'text',
                            order: 1,
                            unit: 1,
                            metadata: getDefaultMetadata('text')
                        }}
                        className="space-y-6"
                    >
                        <div className="min-h-[400px]">
                            {renderStepContent()}
                        </div>

                        <Divider />

                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                {currentStep > 0 && (
                                    <Button
                                        onClick={handlePrev}
                                        size="large"
                                        className="w-full sm:w-auto"
                                    >
                                        {t('common.buttons.previous')}
                                    </Button>
                                )}
                            </div>

                            <div>
                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        onClick={handleNext}
                                        size="large"
                                        className="w-full sm:w-auto !text-white !bg-main-color hover:bg-main-color"
                                    >
                                        {t('common.buttons.next')}
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                                    >
                                        {t('common.buttons.createContent')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form>

                    {/* Preview section */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8 p-6 bg-gray-50 rounded-lg border"
                        >
                            <h4 className="text-lg font-semibold mb-4">
                                {t('form.preview.title')}
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded shadow-sm">
                                    <h5 className="font-medium">
                                        {form.getFieldValue('title') || t('form.preview.defaultTitle')}
                                    </h5>
                                    <p className="text-gray-600 mt-2 text-sm">
                                        {form.getFieldValue('content')
                                            ? `${form.getFieldValue('content').substring(0, 100)}...`
                                            : t('form.preview.defaultContent')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

