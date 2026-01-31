import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Select,
    Switch,
    Button,
    message,
    ColorPicker,
    Card,
    Row,
    Col,
    Divider,
    Steps,
    Tag
} from 'antd';
import {
    SaveOutlined,
    CloseOutlined,
    CalculatorOutlined,
    BookOutlined,
    CodeOutlined,
    HistoryOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUpdateMatiere } from '../../../Services/Admin/Matieres/useUpdateMatiere';
import type { typeMatiere } from '../../../Services/Admin/Matieres/typeMatiere';

const { TextArea } = Input;
const { Option } = Select;

type UpdateMatiereProps = {
    onCancel: () => void;
    matiere: typeMatiere
}

const UpdateMatiere: React.FC<UpdateMatiereProps> = ({ onCancel, matiere }) => {

    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedColor, setSelectedColor] = useState('#4CAF50');
    const [isFormInitialized, setIsFormInitialized] = useState(false);
    const { mutate: updateMatiere, isPending } = useUpdateMatiere()


    useEffect(() => {
        if (matiere && Object.keys(matiere).length > 0 && !isFormInitialized) {
            form.setFieldsValue({
                name: matiere.name || '',
                grade: matiere.grade || 1,
                description: matiere.description || '',
                icon: matiere.icon || 'book',
                is_active: matiere.is_active ?? true, // 👈 clé ici
            });

            setSelectedColor(matiere.color || '#4CAF50');
            setIsFormInitialized(true);
        }
    }, [matiere, form, isFormInitialized]);


    // const handleCancel = () => {
    //     // setCurrentStep(0)
    //     onCancel()
    // }

    const handleCancel = () => {
        form.resetFields();
        setIsFormInitialized(false); // ← IMPORTANT
        setCurrentStep(0);
        onCancel();
    }



    // Options d'icônes
    const iconOptions = [
        { value: 'calculator', icon: <CalculatorOutlined />, label: t('matieresAdd.icons.calculator') },
        { value: 'book', icon: <BookOutlined />, label: t('matieresAdd.icons.book') },
        { value: 'code', icon: <CodeOutlined />, label: t('matieresAdd.icons.code') },
        { value: 'history', icon: <HistoryOutlined />, label: t('matieresAdd.icons.history') },
        { value: 'chart', icon: <LineChartOutlined />, label: t('matieresAdd.icons.chart') },
    ];

    // Options de niveaux
    const gradeOptions = [
        { value: 1, label: t('matieresAdd.grades.grade1'), color: 'blue' },
        { value: 2, label: t('matieresAdd.grades.grade2'), color: 'green' },
        { value: 3, label: t('matieresAdd.grades.grade3'), color: 'orange' },
        { value: 4, label: t('matieresAdd.grades.grade4'), color: 'purple' },
        { value: 5, label: t('matieresAdd.grades.grade5'), color: 'red' },
        { value: 6, label: t('matieresAdd.grades.grade6'), color: 'cyan' },
    ];

    // Couleurs prédéfinies
    const presetColors = [
        '#4CAF50', // Vert
        '#2196F3', // Bleu
        '#FF9800', // Orange
        '#9C27B0', // Violet
        '#F44336', // Rouge
        '#00BCD4', // Cyan
        '#FFC107', // Jaune
        '#795548', // Marron
        '#607D8B', // Gris Bleu
        '#E91E63', // Rose
    ];

    const handleSubmit = async () => {
        if (!matiere?.id) return;

        const values = form.getFieldsValue(true);

        const params = {
            ...values,
            color: selectedColor, // ← N'oubliez pas la couleur
            id: matiere.id!,
        };

        try {
            // const payload = {
            //     name: values.name,
            //     grade: values.grade,
            //     description: values.description,
            //     icon: values.icon,
            //     color: selectedColor,
            //     is_active: values.is_active || true,
            // };

            updateMatiere(params, {
                onSuccess: () => {
                    // form.resetFields();
                    // setSelectedColor('#4CAF50');
                    setCurrentStep(0);
                    onCancel();
                    message.success(t('matieresAdd.messages.addSuccess'));
                }
            })

        } catch (error) {
            message.error(t('matieresAdd.messages.addError'));
        }
    };

    const nextStep = () => {
        form.validateFields()
            .then(() => {
                setCurrentStep(currentStep + 1);
            })
            .catch((errorInfo) => {
                message.error(errorInfo)
            });
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const steps = [
        {
            title: t('matieresAdd.steps.basicInfo'),
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-sm border-0">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label={t('matieresAdd.form.name')}
                                    rules={[
                                        { required: true, message: t('matieresAdd.validation.nameRequired') },
                                        { min: 3, message: t('matieresAdd.validation.nameMinLength') },
                                        { max: 100, message: t('matieresAdd.validation.nameMaxLength') }
                                    ]}
                                >
                                    <Input
                                        size="large"
                                        placeholder={t('matieresAdd.form.namePlaceholder')}
                                        prefix={<BookOutlined className="text-gray-400" />}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="grade"
                                    label={t('matieresAdd.form.grade')}
                                    rules={[{ required: true, message: t('matieresAdd.validation.gradeRequired') }]}
                                >
                                    <Select
                                        size="large"
                                        placeholder={t('matieresAdd.form.gradePlaceholder')}
                                    >
                                        {gradeOptions.map(grade => (
                                            <Option key={grade.value} value={grade.value}>
                                                <Tag color={grade.color} className="mr-2">
                                                    {grade.value}
                                                </Tag>
                                                {grade.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="icon"
                                    label={t('matieresAdd.form.icon')}
                                    rules={[{ required: true, message: t('matieresAdd.validation.iconRequired') }]}
                                >
                                    <Select
                                        size="large"
                                        placeholder={t('matieresAdd.form.iconPlaceholder')}
                                        dropdownRender={menu => (
                                            <div>
                                                {menu}
                                                <Divider className="my-2" />
                                                <div className="p-2">
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {t('matieresAdd.form.iconPreview')}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {iconOptions.map(icon => (
                                                            <div
                                                                key={icon.value}
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer border-2 hover:border-primary transition-all ${form.getFieldValue('icon') === icon.value
                                                                    ? 'border-primary bg-primary/10'
                                                                    : 'border-gray-200'
                                                                    }`}
                                                                onClick={() => form.setFieldValue('icon', icon.value)}
                                                            >
                                                                <span className="text-lg">{icon.icon}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    >
                                        {iconOptions.map(icon => (
                                            <Option key={icon.value} value={icon.value}>
                                                <div className="flex items-center">
                                                    <span className="mr-2 text-lg">{icon.icon}</span>
                                                    {icon.label}
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label={t('matieresAdd.form.description')}
                                    rules={[
                                        { required: true, message: t('matieresAdd.validation.descriptionRequired') },
                                        { min: 5, message: t('matieresAdd.validation.descriptionMinLength') },
                                        { max: 500, message: t('matieresAdd.validation.descriptionMaxLength') }
                                    ]}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder={t('matieresAdd.form.descriptionPlaceholder')}
                                        maxLength={500}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>
            ),
        },
        {
            title: t('matieresAdd.steps.appearance'),
            content: (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-sm border-0">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('matieresAdd.form.color')}
                                    </label>
                                    <div className="mb-4">
                                        <div className="flex items-center mb-4">
                                            <div
                                                className="w-12 h-12 rounded-lg mr-4 border-2 border-gray-200"
                                                style={{ backgroundColor: selectedColor }}
                                            />
                                            <div className="flex-1">
                                                <ColorPicker
                                                    value={selectedColor}
                                                    onChange={(color) => setSelectedColor(color.toHexString())}
                                                    presets={[{ label: t('matieresAdd.form.presetColors'), colors: presetColors }]}
                                                    showText
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-sm text-gray-500 mb-2">
                                                {t('matieresAdd.form.presetColors')}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {presetColors.map(color => (
                                                    <div
                                                        key={color}
                                                        className={`w-8 h-8 rounded-lg cursor-pointer border-2 hover:scale-110 transition-transform ${selectedColor === color
                                                            ? 'border-gray-800 scale-110'
                                                            : 'border-gray-300'
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setSelectedColor(color)}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    label={t('matieresAdd.form.status')}
                                >
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {t('matieresAdd.form.activeStatus')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {t('matieresAdd.form.activeDescription')}
                                            </div>
                                        </div>

                                        <Form.Item
                                            name="is_active"
                                            valuePropName="checked"
                                            noStyle
                                        >
                                            <Switch
                                                checkedChildren={t('matieresAdd.common.active')}
                                                unCheckedChildren={t('matieresAdd.common.inactive')}
                                            />
                                        </Form.Item>
                                    </div>
                                </Form.Item>


                            </Col>

                            <Col span={24}>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-2">
                                        <CheckCircleOutlined className="text-blue-500 mr-2" />
                                        <span className="font-medium text-blue-800">
                                            {t('matieresAdd.form.preview')}
                                        </span>
                                    </div>
                                    <div className="flex items-center p-3 gap-6 bg-white rounded border">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                            style={{ backgroundColor: selectedColor }}
                                        >
                                            {(() => {
                                                const selectedIcon = iconOptions.find(icon => icon.value === form.getFieldValue('icon'));
                                                return selectedIcon ? selectedIcon.icon : <BookOutlined className="text-white" />;
                                            })()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {form.getFieldValue('name') || t('matieresAdd.form.sampleName')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {form.getFieldValue('grade')
                                                    ? `${t('matieresAdd.grades.grade')} ${form.getFieldValue('grade')}`
                                                    : t('matieresAdd.form.sampleGrade')
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </motion.div>
            ),
        },
    ];

    return (
        <div className="py-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Steps
                    current={currentStep}
                    className="mb-1"
                    items={steps.map(step => ({
                        title: step.title,
                    }))}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="space-y-6"
                >
                    {steps[currentStep].content}


                    {currentStep === 0 ? (
                        // Étape 1 : Informations de base
                        <div className="grid grid-cols-2 pt-6 border-t gap-4">
                            <Button
                                onClick={handleCancel}
                                size="large"
                                className="!w-full !border-gray-300 !text-gray-700 hover:!border-gray-400 hover:!text-gray-800"
                                icon={<CloseOutlined />}
                            >
                                {t('matieresAdd.common.cancel')}
                            </Button>
                            <Button
                                onClick={nextStep}
                                size="large"
                                className="!w-full !bg-main-color hover:!bg-main-color-dark !border-none !text-white font-medium"
                                icon={<ArrowLeftOutlined />}
                            >
                                {t('matieresAdd.common.next')}
                            </Button>
                        </div>
                    ) : (
                        // Étape 2 : Apparence et validation
                        <div className="grid grid-cols-2 pt-6 border-t gap-4">
                            <Button
                                onClick={prevStep}
                                size="large"
                                className="!w-full !border-gray-300 !text-gray-700 hover:!border-gray-400 hover:!text-gray-800"
                                icon={<ArrowLeftOutlined />}
                            >
                                {t('matieresAdd.common.back')}
                            </Button>
                            <Button
                                type="primary"
                                // htmlType="submit"
                                size="large"
                                loading={isPending}
                                className="!w-full !bg-green-500 hover:!bg-green-600 !border-none !text-white font-medium"
                                icon={<SaveOutlined />}
                                onClick={handleSubmit}
                            >
                                {t("matieres.modal.editTitle")}
                            </Button>
                        </div>
                    )}


                </Form>
            </motion.div>
        </div>
    );
};

export default UpdateMatiere;


