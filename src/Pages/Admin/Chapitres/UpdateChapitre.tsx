import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Upload,
    message,
    Row,
    Col,
    Steps,
    Card,
    Tag,
} from 'antd';
import {
    UploadOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    BookOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SaveOutlined,
    WarningFilled,
    DeleteOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import { useGetMatiere } from '../../../Services/Admin/Matieres/useGetMatiere';
import { useUpdateChapitre } from '../../../Services/Admin/Chapitres/useUpdateChapitre';
import SpinnerLoader from '../../../ui/SpinnerLoader';

const { TextArea } = Input;
const { Option } = Select;

interface UpdateChapitreProps {
    visible: boolean;
    onClose: () => void;
    chapitre: typeChapitre;
    onSuccess: () => void;
}

const UpdateChapitre: React.FC<UpdateChapitreProps> = ({
    visible,
    onClose,
    chapitre,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [showExistingImage, setShowExistingImage] = useState<boolean>(true);
    const { mutate: updateChapitre, isPending } = useUpdateChapitre()
    const { data: getMatieres, isPending: isPendingMatiere } = useGetMatiere()

    useEffect(() => {
        if (chapitre && visible) {
            form.setFieldsValue({
                ...chapitre,
                subject: chapitre.subject,
            });
            setThumbnailFile(null);
            setThumbnailPreview('');
            setShowExistingImage(true);
        }
    }, [chapitre, visible, form]);

    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue(true);


            const formData = {
                ...values,
                id: chapitre.id,
                thumbnail: thumbnailFile || chapitre.thumbnail, 
                is_published: values.is_published === true, 
                subject_id: values.subject, // 
            };


            updateChapitre(formData, {
                onSuccess: () => {
                    message.success(t('chapitres.messages.updateSuccess'));
                    onSuccess();
                    handleClose();
                },
                onError: (error) => {
                    console.error('Erreur:', error);
                    message.error(t('chapitres.messages.updateError'));
                }
            });

        } catch (error) {
            console.error('Erreur de validation:', error);
            message.error(t('chapitres.messages.updateError'));
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
        setShowExistingImage(false); // Masquer l'image existante quand on upload une nouvelle

        // Créer une preview
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);

        return false; // Empêche l'upload automatique
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
        setShowExistingImage(true);
        form.setFieldValue('thumbnail', chapitre.thumbnail); // Réinitialiser à l'original
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
        setShowExistingImage(true);
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
                                <Select
                                    size="large"
                                    placeholder={t('chapitres.form.subjectPlaceholder')}
                                    loading={isPendingMatiere}
                                    disabled
                                >
                                    {getMatieres?.map((matiere, index) => {
                                        return (
                                            <Option key={index} value={matiere?.id}>{matiere?.name}</Option>
                                        )
                                    })}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="order"
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
                                name="learning_objective"
                                label={t('chapitres.form.learningObjective')}
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
                        <Row>
                            <Col>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('chapitres.form.thumbnail')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex flex-col gap-4">
                                        {/* Upload Button */}
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
                                                {t('chapitres.common.change_image')}
                                            </Button>
                                        </Upload>

                                        {/* Affichage de l'image */}
                                        <div className="mt-4">
                                            {/* Afficher l'image existante si pas de nouveau fichier */}
                                            {showExistingImage && chapitre?.thumbnail && !thumbnailPreview && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-start gap-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                                            <img
                                                                src={chapitre.thumbnail}
                                                                alt="Image existante"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <p>{t("chapitres.common.img_actuelle")}</p>
                                                            <p className="text-xs text-gray-400">{t("chapitres.common.click")}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Afficher la preview de la nouvelle image */}
                                            {thumbnailPreview && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-start gap-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                                            <img
                                                                src={thumbnailPreview}
                                                                alt="Nouvelle image"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <p>Nouvelle image</p>
                                                            <p className="text-xs text-gray-500">
                                                                {thumbnailFile?.name} ({(thumbnailFile?.size! / 1024).toFixed(2)} KB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={handleRemoveThumbnail}
                                                    >
                                                        {t("chapitres.common.delete_img")}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row className='grid grid-cols-1 gap-3 md:grid-cols-2 mt-4'>
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

                            <Col>
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
                                    label={t('chapitres.filter.difficulty')}
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

                            {/* <Col span={24}>
                                <Form.Item
                                    name="is_published"
                                    label={t('chapitres.form.status')}
                                    valuePropName="checked"
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
                                            <Switch />
                                        </div>
                                    </div>
                                </Form.Item>
                            </Col> */}
                        </Row>
                    </Card>
                </motion.div>
            ),
        },
    ];

    const nextStep = () => {
        form.validateFields()
            .then(() => setCurrentStep(currentStep + 1))
            .catch(() => { });
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    if (isPendingMatiere) {
        return <SpinnerLoader />
    }

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <BookOutlined className="text-blue-500" />
                    <span className="text-xl font-semibold">{t('chapitres.editTitle')}</span>
                    <Tag color="blue" className="ml-2">ID: {chapitre.id}</Tag>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={700}
            className="top-8"
            styles={{
                body: { maxHeight: '70vh', overflowY: 'auto' }
            }}
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
                    items={steps.map(step => ({ title: step.title }))}
                />

                <Form
                    form={form}
                    layout="vertical"
                    className="space-y-6"
                    initialValues={{
                        ...chapitre,
                        is_published: chapitre.is_published || false,
                        subject: chapitre.subject,
                    }}
                >
                    {steps[currentStep].content}

                    {/* <Divider /> */}

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-3  pt-6 border-t">
                        {currentStep === 0 ? (
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
                                    onClick={nextStep}
                                    size="large"
                                    icon={<ArrowLeftOutlined />}
                                    className='!bg-main-color !text-white'
                                >
                                    {t('chapitres.common.next')}
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
                                    {t('common.update')}
                                </Button>
                            </>
                        )}
                    </div>
                </Form>
            </motion.div>
        </Modal>
    );
};

export default UpdateChapitre;