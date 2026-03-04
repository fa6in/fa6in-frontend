import React, { useState } from 'react';
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import {
    SaveOutlined,
    CloseOutlined,
    BookOutlined,
    PlusOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAddMatiere } from '../../../Services/Admin/Matieres/useAddmatiere';

const { TextArea } = Input;
const { Step } = Steps;
const { Option } = Select;

type AddNewMatiereProps = {
    onCancel: () => void;
}

const AddNewMatiere: React.FC<AddNewMatiereProps> = ({ onCancel }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedColor, setSelectedColor] = useState('#4CAF50');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Utilisation du hook avec gestion correcte du statut
    const { mutate: addMatiere, isPending: isPendingAdd } = useAddMatiere();

    const handleCancel = () => {
        setCurrentStep(0);
        onCancel();
        form.resetFields();
        setSelectedColor('#4CAF50');
        setIsSubmitting(false);
    }

    // Options d'icônes
    // const iconOptions: { value: IconName; label: string }[] = [
    //     { value: "calculator", label: t('matieresAdd.icons.calculator') },
    //     { value: "book-open", label: t('matieresAdd.icons.book') },
    //     { value: "code", label: t('matieresAdd.icons.code') },
    //     { value: "landmark", label: t('matieresAdd.icons.history') },
    //     { value: "chart-line", label: t('matieresAdd.icons.chart') },
    // ];

    const iconOptions: { value: IconName; label: string }[] = [
        { value: "calculator", label: t("matieresAdd.icons.calculator") },
        { value: "book-open", label: t("matieresAdd.icons.book-open") },
        { value: "language", label: t("matieresAdd.icons.language") },
        { value: "mosque", label: t("matieresAdd.icons.mosque") },
        { value: "flask", label: t("matieresAdd.icons.flask") },
        { value: "scale-balanced", label: t("matieresAdd.icons.scale-balanced") },
        { value: "futbol", label: t("matieresAdd.icons.futbol") },
        { value: "landmark", label: t("matieresAdd.icons.landmark") },
        { value: "globe", label: t("matieresAdd.icons.globe") },
    ];

    // Options de niveaux
    const gradeOptions = [
        { value: 1, label: t('matieresAdd.grades.grade1'), color: 'blue' },
        { value: 2, label: t('matieresAdd.grades.grade2'), color: 'green' },
        { value: 3, label: t('matieresAdd.grades.grade3'), color: 'orange' },
        { value: 4, label: t('matieresAdd.grades.grade4'), color: 'purple' },
        { value: 5, label: t('matieresAdd.grades.grade5'), color: 'red' },
        { value: 6, label: t('matieresAdd.grades.grade6'), color: 'cyan' },
        { value: 7, label: t('matieresAdd.grades.grade7'), color: 'red' },
        { value: 8, label: t('matieresAdd.grades.grade8'), color: 'blue' },
        { value: 9, label: t('matieresAdd.grades.grade9'), color: 'green' },
        { value: 10, label: t('matieresAdd.grades.grade10'), color: 'gray' },
        { value: 11, label: t('matieresAdd.grades.grade11'), color: 'pink' },
        { value: 12, label: t('matieresAdd.grades.grade12'), color: 'purple' },
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
        // Empêcher les soumissions multiples
        if (isSubmitting || isPendingAdd) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Valider tous les champs du formulaire
            await form.validateFields();

            const values = form.getFieldsValue(true);

            // Ajouter la couleur sélectionnée aux valeurs
            const finalValues = {
                ...values,
                color: selectedColor
            };

            console.log('Soumission des données:', finalValues);

            // Utiliser mutate avec des callbacks complets
            addMatiere(finalValues, {
                onSuccess: (data) => {
                    console.log('Succès de l\'ajout:', data);
                    message.success(t('matieresAdd.messages.addSuccess'));

                    // Réinitialiser le formulaire
                    form.resetFields();
                    setSelectedColor('#4CAF50');
                    setCurrentStep(0);
                    setIsSubmitting(false);

                    // Fermer le modal
                    onCancel();
                },
                onError: (error) => {
                    console.error('Erreur lors de l\'ajout:', error);

                    // Réinitialiser l'état de soumission
                    setIsSubmitting(false);

                    // Les messages d'erreur sont déjà gérés dans le hook useAddMatiere
                    // Vous pouvez ajouter une logique supplémentaire ici si nécessaire

                    // Par exemple, revenir au premier step si l'erreur est liée aux données de base
                    if (error?.response?.status === 400) {
                        // Optionnel: Revenir au premier step pour corriger les erreurs
                        // setCurrentStep(0);
                    }
                }
            });

        } catch (validationError) {
            // Cette erreur vient de la validation du formulaire, pas de l'API
            console.error('Erreur de validation:', validationError);
            setIsSubmitting(false);

            // Afficher un message si la validation échoue
            message.error(t('matieresAdd.validation.formValidationFailed'));

            // Revenir au premier step pour corriger les erreurs
            setCurrentStep(0);
        }
    };

    const nextStep = () => {
        // Valider uniquement les champs visibles
        const fieldNames = steps[currentStep].content.props.children.props.children;
        const fieldsToValidate = extractFieldNames(fieldNames);

        form.validateFields(fieldsToValidate)
            .then(() => {
                setCurrentStep(currentStep + 1);
            })
            .catch((errorInfo) => {
                console.log('Validation échouée:', errorInfo);
                message.error(t('matieresAdd.validation.pleaseCompleteFields'));
            });
    };

    // Fonction utilitaire pour extraire les noms de champs d'une étape
    const extractFieldNames = (elements: any): string[] => {
        const fieldNames: string[] = [];

        React.Children.forEach(elements, (element) => {
            if (element && element.props) {
                if (element.props.name) {
                    fieldNames.push(element.props.name);
                }

                // Vérifier les enfants récursivement
                if (element.props.children) {
                    const childFields = extractFieldNames(element.props.children);
                    fieldNames.push(...childFields);
                }
            }
        });

        return fieldNames;
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
                                        disabled={isPendingAdd}
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
                                        disabled={isPendingAdd}
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
                                        disabled={isPendingAdd}
                                        allowClear
                                        optionLabelProp="label"
                                        dropdownRender={(menu) => (
                                            <div>
                                                {menu}
                                                <Divider className="my-2" />
                                                <div className="p-2">
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {t('matieresAdd.form.iconPreview')}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {iconOptions.map((icon) => (
                                                            <div
                                                                key={icon.value}
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all ${form.getFieldValue('icon') === icon.value
                                                                    ? 'border-primary bg-primary/10'
                                                                    : 'border-gray-200'
                                                                    }`}
                                                                onClick={() =>
                                                                    !isPendingAdd && form.setFieldValue('icon', icon.value)
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={["fas", icon.value]} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    >
                                        {iconOptions.map((icon) => (
                                            <Select.Option
                                                key={icon.value}
                                                value={icon.value}
                                                label={icon.label}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={["fas", icon.value]} />
                                                    {icon.label}
                                                </div>
                                            </Select.Option>
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
                                        { max: 5000, message: t('matieresAdd.validation.descriptionMaxLength') }
                                    ]}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder={t('matieresAdd.form.descriptionPlaceholder')}
                                        maxLength={5000}
                                        showCount
                                        disabled={isPendingAdd}
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
                                                    onChange={(color) => !isPendingAdd && setSelectedColor(color.toHexString())}
                                                    presets={[{ label: t('matieresAdd.form.presetColors'), colors: presetColors }]}
                                                    showText
                                                    disabled={isPendingAdd}
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
                                                        onClick={() => !isPendingAdd && setSelectedColor(color)}
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
                                    name="is_active"
                                    label={t('matieresAdd.form.status')}
                                    valuePropName="checked"
                                    initialValue={true}
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
                                        <Switch
                                            defaultChecked
                                            checkedChildren={t('matieresAdd.common.active')}
                                            unCheckedChildren={t('matieresAdd.common.inactive')}
                                            disabled={isPendingAdd}
                                        />
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
                                        {/* <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                            style={{ backgroundColor: selectedColor }}
                                        >
                                            {(() => {
                                                const selectedIcon = iconOptions.find(icon => icon.value === form.getFieldValue('icon'));
                                                return selectedIcon ? selectedIcon.icon : <BookOutlined className="text-white" />;
                                            })()}
                                        </div> */}
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

    // Déterminer l'état de chargement
    const isLoading = isPendingAdd || isSubmitting;

    return (
        <div className="py-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Steps current={currentStep} className="mb-1">
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>

                <Form
                    form={form}
                    layout="vertical"
                    className="space-y-6"
                >
                    {steps[currentStep].content}

                    <div className="flex justify-between pt-6 border-t">
                        <div>
                            {currentStep > 0 && (
                                <Button
                                    onClick={prevStep}
                                    icon={<CloseOutlined />}
                                    size="large"
                                    className="mr-2 !border-main-color !text-main-color"
                                    disabled={isLoading}
                                >
                                    {t('matieresAdd.common.back')}
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {currentStep < steps.length - 1 ? (
                                <>
                                    <Button
                                        onClick={handleCancel}
                                        size="large"
                                        className="mr-2 !border-main-color !text-main-color"
                                        disabled={isLoading}
                                    >
                                        {t('matieresAdd.common.cancel')}
                                    </Button>
                                    <Button
                                        className='!bg-main-color !text-white font-bold !w-full'
                                        onClick={nextStep}
                                        size="large"
                                        icon={<PlusOutlined />}
                                        disabled={isLoading}
                                    >
                                        {t('matieresAdd.common.next')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleCancel}
                                        size="large"
                                        className="mr-2 !border-main-color !text-main-color"
                                        disabled={isLoading}
                                    >
                                        {t('matieresAdd.common.cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        size="large"
                                        loading={isLoading}
                                        disabled={isLoading}
                                        icon={<SaveOutlined />}
                                        className="!bg-main-color !text-white !font-bold"
                                        type="primary"
                                    >
                                        {isLoading ? t('matieresAdd.common.create') : t('matieresAdd.common.create')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default AddNewMatiere;