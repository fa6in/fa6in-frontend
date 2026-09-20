import React, { useState, useMemo } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Button,
    Upload,
    message,
    Row,
    Col,
    Steps,
    Card,
    Tag
} from 'antd';
import {
    UploadOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    BookOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    WarningFilled,
    ArrowRightOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAddChapitre } from '../../../Services/Admin/Chapitres/useAddChapitre';
import { useGetMatiere } from '../../../Services/Admin/Matieres/useGetMatiere';
import RelationSelect, { toRelationItems } from '../../../ui/RelationSelect';

const { TextArea } = Input;
const { Option } = Select;

interface AddNewChapitreProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddNewChapitre: React.FC<AddNewChapitreProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const { mutate: addChapitre, isPending } = useAddChapitre();
    const { data: getMatieres, isPending: isPendingMatiere } = useGetMatiere()
    const matieres = Array.isArray(getMatieres) ? getMatieres : [];
    const matiereOptions = useMemo(
        () => toRelationItems(matieres, (m) => m.name, (m) => m.description),
        [matieres]
    );


    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue(true);

            const formData = {
                ...values,
                thumbnail: thumbnailFile,
                is_published: values.is_published || false,
                subject: values.subject,
            };


            addChapitre(formData, {
                onSuccess: () => {
                    message.success(t('chapitres.messages.addSuccess'));
                    onSuccess();
                    handleClose();
                },
                onError: (error) => {
                    console.error('Erreur:', error);
                    message.error(t('chapitres.messages.addError'));
                }
            });

        } catch (error) {
            console.error('Erreur de validation:', error);
            message.error(t('chapitres.messages.addError'));
        }
    };

    const handleFileUpload = (file: File) => {
        // Validation du fichier
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Vous ne pouvez uploader que des images !');
            return false;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('L\'image doit faire moins de 5MB !');
            return false;
        }

        setThumbnailFile(file);

        // Créer une preview
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);

        return false; // Empêche l'upload automatique
    };

    const validateUrl = (_: any, value: string) => {
        if (!value || value.trim() === '') {
            return Promise.resolve();
        }

        try {
            new URL(value);
            return Promise.resolve();
        } catch {
            return Promise.reject(new Error('URL invalide'));
        }
    };

    const handleClose = () => {
        form.resetFields();
        setCurrentStep(0);
        setThumbnailFile(null);
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailPreview('');
        onClose();
    };

    const steps = [
        {
            title: t('chapitres.steps.basicInfo'),
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-sm border-0">
                        <div className='grid md:grid-cols-2 grid-cols-1 gap-3'>
                            <Form.Item
                                name="code"
                                label={t('curriculum.code')}
                                rules={[{ required: true, message: t('curriculum.required') }]}
                            >
                                <Input size="large" placeholder="UNIT-001" />
                            </Form.Item>
                            <Form.Item
                                name="title"
                                label={t('chapitres.form.title')}
                                rules={[
                                    { required: true, message: t('chapitres.validation.titleRequired') },
                                    { min: 4, message: t('chapitres.validation.titleMinLength') }
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder={t('chapitres.form.titlePlaceholder')}
                                    prefix={<BookOutlined className="text-gray-400" />}
                                />
                            </Form.Item>

                            <Form.Item
                                name="subject"
                                label={t('chapitres.form.subject')}
                                rules={[{ required: true, message: t('chapitres.validation.subjectRequired') }]}
                            >
                                <RelationSelect
                                    placeholder={t('chapitres.form.subjectPlaceholder')}
                                    loading={isPendingMatiere}
                                    items={matiereOptions}
                                />
                            </Form.Item>

                            <Form.Item
                                name="order_index"
                                label={t('chapitres.form.order')}
                                rules={[{ required: true, message: t('chapitres.validation.orderRequired') }]}
                            >
                                <InputNumber
                                    type='number'
                                    size="large"
                                    min={1}
                                    max={100}
                                    className="w-full"
                                    placeholder={t('chapitres.form.orderPlaceholder')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="central_question"
                                label={t('chapitres.form.centralQuestion')}
                                rules={[{ required: true, message: t('chapitres.validation.learningObjectiveRequired') }]}
                            >
                                <Input
                                    placeholder={t('chapitres.form.learningObjectivePlaceholder')}
                                    maxLength={300}
                                    showCount
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label={t('chapitres.form.description')}
                                rules={[
                                    { required: true, message: t('chapitres.validation.descriptionRequired') },
                                    { min: 5, message: t('chapitres.validation.descriptionMinLength') }
                                ]}
                                className="md:col-span-2"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder={t('chapitres.form.descriptionPlaceholder')}
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>
                        </div>
                    </Card>
                </motion.div>
            ),
        },
        {
            title: t('chapitres.steps.media'),
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-sm border-0">
                        <Row >
                            <Col >
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('chapitres.form.thumbnail')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Form.Item
                                        name="thumbnail"
                                    >
                                        <Upload
                                            beforeUpload={handleFileUpload}
                                            maxCount={1}
                                            showUploadList={false}
                                            accept="image/*"
                                            className="w-full"
                                        >
                                            <Button
                                                icon={<UploadOutlined />}
                                                className='!h-[40px] !border-main-color !text-main-color !font-bold w-full'
                                            >
                                                {t('chapitres.common.upload')}
                                            </Button>
                                        </Upload>
                                    </Form.Item>
                                    {thumbnailPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-4"
                                        >
                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {thumbnailFile?.name} ({(thumbnailFile?.size! / 1024).toFixed(2)} KB)
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </Col>


                        </Row>
                        <Row className=' grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <Col>
                                <Form.Item
                                    name="video_url"
                                    label={t('chapitres.form.videoUrl')}
                                    rules={[{ validator: validateUrl }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="https://youtube.com/watch?v=..."
                                        prefix={<VideoCameraOutlined />}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    name="audio_url"
                                    label={t('chapitres.form.audioUrl')}
                                    rules={[{ validator: validateUrl }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="https://example.com/audio.mp3"
                                        prefix={<AudioOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>
            ),
        },
        {
            title: t('chapitres.steps.settings'),
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-sm border-0">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    name="duration_minutes"
                                    label={t('chapitres.form.duration')}
                                    rules={[{ required: true, message: t('chapitres.validation.durationRequired') }]}
                                >
                                    <InputNumber
                                        size="large"
                                        min={1}
                                        max={300}
                                        className="w-full"
                                        placeholder="30"
                                        addonAfter={t('chapitres.form.minutes')}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="difficulty"
                                    label={t('chapitres.form.difficulty')}
                                    rules={[{ required: true, message: t('chapitres.validation.difficultyRequired') }]}
                                >
                                    <Select size="large" placeholder={t('chapitres.form.selectDifficulty')}>
                                        <Option value="easy">
                                            <Tag color="green">{t('chapitres.difficulty.easy')}</Tag>
                                        </Option>
                                        <Option value="medium">
                                            <Tag color="orange">{t('chapitres.difficulty.medium')}</Tag>
                                        </Option>
                                        <Option value="hard">
                                            <Tag color="red">{t('chapitres.difficulty.hard')}</Tag>
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    name="is_published"
                                    label={t('chapitres.form.status')}
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">
                                                    {t('chapitres.form.publishNow')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {t('chapitres.form.publishDescription')}
                                                </div>
                                            </div>
                                            <Switch defaultChecked={false} />
                                        </div>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>
            ),
        },
    ];

    const visibleSteps = [steps[0]];


    const nextStep = () => {
        form.validateFields()
            .then(() => {
                setCurrentStep(currentStep + 1);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };
    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <BookOutlined className="text-blue-500" />
                    <span className="text-xl font-semibold">{t('chapitres.addTitle')}</span>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={700}
            maskClosable={false}

        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Steps
                    current={currentStep}
                    className="mb-6"
                    items={visibleSteps.map(step => ({ title: step.title }))}
                />

                <Form
                    form={form}
                    layout="vertical"
                    className="space-y-6"
                    initialValues={{
                        is_published: false,
                        difficulty: 'medium'
                    }}
                >
                    {visibleSteps[currentStep].content}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t">
                        {visibleSteps.length === 1 ? (
                            <>
                                <Button
                                    onClick={handleClose}
                                    size="large"
                                    icon={<WarningFilled />}
                                    className='!text-secondary-color !border-secondary-color'
                                >
                                    {t('chapitres.common.cancel')}
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    size="large"
                                    loading={isPending}
                                    icon={<SaveOutlined />}
                                    className="!bg-main-color border-none"
                                >
                                    {t('common.save')}
                                </Button>
                            </>
                        ) : currentStep === 1 ? (
                            <>
                                <Button
                                    onClick={prevStep}
                                    size="large"
                                    icon={<ArrowRightOutlined />}
                                    className='!text-secondary-color !border-secondary-color'
                                >
                                    {t('chapitres.common.back')}
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    size="large"
                                    icon={<ArrowLeftOutlined />}
                                    className='!bg-main-color !text-white'
                                >
                                    {t('chapitres.common.next')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={prevStep}
                                    size="large"
                                    icon={<ArrowRightOutlined />}
                                    className='!text-secondary-color !border-secondary-color'
                                >
                                    {t('chapitres.common.back')}
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    size="large"
                                    loading={isPending}
                                    icon={<SaveOutlined />}
                                    className="!bg-main-color border-none"
                                >
                                    {t('common.save')}
                                </Button>
                            </>
                        )}
                    </div>
                </Form>
            </motion.div>
        </Modal>
    );
};

export default AddNewChapitre;

