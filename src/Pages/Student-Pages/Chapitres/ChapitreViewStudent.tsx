import React, { useState } from 'react';
import {
    Card,
    Button,
    Tag,
    Input,
    Select,
    Space,
    Badge,
    Empty,
    Tooltip,
    Progress
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    BookOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SortAscendingOutlined,
    FireOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';

const { Option } = Select;

/* =======================
Animations
======================= */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    },
    hover: {
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 15
        }
    },
    tap: {
        scale: 0.98
    }
};

/* =======================
Component
======================= */
const ChapitresView: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const [searchText, setSearchText] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState('order');
    const [selectedChapitre, setSelectedChapitre] = useState<typeChapitre | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);

    const { data: DataChapitre, isPending } = useGetChapitre();

    // Fonction pour obtenir la couleur de difficulté
    const difficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'blue';
        }
    };

    // Icône de difficulté
    const getDifficultyIcon = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy': return <CheckCircleOutlined />;
            case 'medium': return <RocketOutlined />;
            case 'hard': return <FireOutlined />;
            default: return <BookOutlined />;
        }
    };

    // Fonction de filtrage
    const chapitres = Array.isArray(DataChapitre) ? DataChapitre : [];
    const filteredChapitres = chapitres.filter(chapitre => {
        const matchesSearch = searchText === '' ||
            chapitre.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            chapitre.description?.toLowerCase().includes(searchText.toLowerCase()) ||
            chapitre.code?.toLowerCase().includes(searchText.toLowerCase());

        const matchesDifficulty = selectedDifficulty === 'all' ||
            chapitre.difficulty === selectedDifficulty;

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'published' && chapitre.is_published) ||
            (selectedStatus === 'draft' && !chapitre.is_published);

        return matchesSearch && matchesDifficulty && matchesStatus;
    });

    // Trier les chapitres
    const sortedChapitres = [...filteredChapitres].sort((a, b) => {
        switch (sortBy) {
            case 'order':
                return (a.order ?? a.order_index ?? 0) - (b.order ?? b.order_index ?? 0);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'duration':
                return (b.duration_minutes || 0) - (a.duration_minutes || 0);
            case 'activities':
                return (b.activity_count || 0) - (a.activity_count || 0);
            default:
                return 0;
        }
    });


    if (isPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main-color"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6"
        >


            {/* Barre de filtres */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <Card className="rounded-2xl shadow-md border-0 bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
                        <div className="flex-1 w-full">
                            <Input
                                placeholder={t('chapitres.search.placeholder')}
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="rounded-full h-12 text-base"
                                allowClear
                                size="large"
                            />
                        </div>

                        <Space wrap className="flex flex-wrap justify-center gap-3">
                            <Select
                                value={selectedDifficulty}
                                onChange={setSelectedDifficulty}
                                className="w-40"
                                size="large"
                                suffixIcon={<FilterOutlined />}
                                placeholder={t('chapitres.filter.difficulty')}
                            >
                                <Option value="all">{t('chapitres.filter.allDifficulties')}</Option>
                                <Option value="easy">{t('chapitres.difficulty.easy')}</Option>
                                <Option value="medium">{t('chapitres.difficulty.medium')}</Option>
                                <Option value="hard">{t('chapitres.difficulty.hard')}</Option>
                            </Select>

                            <Select
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                className="w-40"
                                size="large"
                                placeholder={t('chapitres.filter.status')}
                            >
                                <Option value="all">{t('chapitres.filter.allStatus')}</Option>
                                <Option value="published">{t('chapitres.common.published')}</Option>
                                <Option value="draft">{t('chapitres.common.draft')}</Option>
                            </Select>

                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                className="w-40"
                                size="large"
                                suffixIcon={<SortAscendingOutlined />}
                                placeholder={t('chapitres.sort.title')}
                            >
                                <Option value="order">{t('chapitres.sort.byOrder')}</Option>
                                <Option value="title">{t('chapitres.sort.byName')}</Option>
                                <Option value="duration">{t('chapitres.sort.byDuration')}</Option>
                                <Option value="activities">{t('chapitres.sort.byActivities')}</Option>
                            </Select>

                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setSelectedDifficulty("all");
                                    setSelectedStatus("all");
                                    setSortBy("order");
                                }}
                                size="large"
                                className="rounded-full"
                            >
                                {t('chapitres.filters.reset')}
                            </Button>
                        </Space>
                    </div>


                </Card>
            </motion.div>

            {/* Grille des chapitres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {sortedChapitres.length > 0 ? (
                        sortedChapitres.map((chapitre, index) => {
                            const difficultyColorClass = difficultyColor(chapitre.difficulty);

                            return (
                                <motion.div
                                    key={chapitre.id}
                                    variants={{ cardVariants }}
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <Card
                                        className="rounded-2xl border-0 shadow-lg hover:shadow-2xl h-full cursor-pointer transition-all duration-300 overflow-hidden group"
                                        onClick={() => {
                                            setSelectedChapitre(chapitre);
                                            setIsDetailVisible(true);
                                        }}
                                    >
                                        {/* Header de la carte */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge
                                                    count={`#${chapitre.order}`}
                                                    style={{ backgroundColor: '#1890ff' }}
                                                    className="mr-2"
                                                />
                                                <Badge
                                                    status={chapitre.is_published ? "success" : "error"}
                                                    text={
                                                        <span className={`text-sm font-medium ${chapitre.is_published ? 'text-green-600' : 'text-red-500'}`}>
                                                            {chapitre.is_published ? t('chapitres.common.published') : t('chapitres.common.draft')}
                                                        </span>
                                                    }
                                                />
                                                <h3 className="text-xl font-bold text-gray-800 mt-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {chapitre.title}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <Tooltip title={t(`chapitres.difficulty.${chapitre.difficulty || "medium"}`)}>
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${difficultyColorClass}-500 to-${difficultyColorClass}-600 flex items-center justify-center text-white`}>
                                                        {getDifficultyIcon(chapitre.difficulty)}
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Image miniature */}
                                        {chapitre.thumbnail && (
                                            <div className="mb-4 overflow-hidden rounded-lg">
                                                <img
                                                    src={String(chapitre.thumbnail)}
                                                    alt={chapitre.title}
                                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}

                                        {/* Description */}
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {chapitre.description || t('chapitres.noDescription')}
                                        </p>

                                        {/* Informations supplémentaires */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-gray-500">
                                                    <BookOutlined className="mr-2" />
                                                    <span>{chapitre.subject_name}</span>
                                                </div>
                                                <div className="flex items-center text-gray-500">
                                                    <ClockCircleOutlined className="mr-2" />
                                                    <span>{chapitre.duration_minutes} {t('chapitres.table.minutes')}</span>
                                                </div>
                                            </div>

                                            {/* Progression des activités */}
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>{t('chapitres.table.activities')}</span>
                                                    <span>{chapitre.activity_count}</span>
                                                </div>
                                                <Progress
                                                    percent={Math.min(chapitre?.activity_count! * 20, 100)}
                                                    size="small"
                                                    strokeColor="#52c41a"
                                                    showInfo={false}
                                                />
                                            </div>
                                        </div>

                                        {/* Footer de la carte */}
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                {new Date(chapitre?.created_at!).toLocaleDateString()}
                                            </div>
                                            <Button
                                                    ghost
                                                    size="small"
                                                    className="rounded-full !bg-main-color !text-white"
                                                >
                                                    {t("matieres.student.viewDetails")}
                                                </Button>
                                        </div>

                                        {/* Effet de surbrillance au hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                                    </Card>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full"
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span className="text-gray-500 text-lg">
                                        {t('chapitres.noResults')}
                                    </span>
                                }
                                className="py-12"
                            >
                                <Button
                                    onClick={() => {
                                        setSearchText("");
                                        setSelectedDifficulty("all");
                                        setSelectedStatus("all");
                                    }}
                                    size="large"
                                    className="rounded-full px-8"
                                >
                                    {t('chapitres.resetFilters')}
                                </Button>
                            </Empty>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal de détails */}
            <AnimatePresence>
                {isDetailVisible && selectedChapitre && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={() => setIsDetailVisible(false)}
                        />

                        {/* Panel de détails */}
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Button
                                            icon={<span className="text-xl">×</span>}
                                            type="text"
                                            onClick={() => setIsDetailVisible(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        />
                                    </div>
                                    <Tag color="blue" className="rounded-full px-4 py-1 text-base">
                                        #{selectedChapitre.order}
                                    </Tag>
                                </div>

                                {/* Image */}
                                {selectedChapitre.thumbnail && (
                                    <div className="mb-6 overflow-hidden rounded-xl">
                                        <img
                                            src={String(selectedChapitre.thumbnail)}
                                            alt={selectedChapitre.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                )}

                                {/* Titre */}
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    {selectedChapitre.title}
                                </h2>

                                {/* Statut */}
                                <div className="flex items-center mb-6">
                                   
                                    <span className={`text-lg ${selectedChapitre.is_published ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedChapitre.is_published ? t('chapitres.common.published') : t('chapitres.common.draft')}
                                    </span>
                                </div>

                                {/* Description complète */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                                        <FileTextOutlined className="mr-2 text-blue-500" />
                                        {t('chapitres.description')}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {selectedChapitre.description || t('chapitres.noDescriptionAvailable')}
                                    </p>
                                </div>

                                {/* Statistiques détaillées */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <Card className="rounded-xl border border-gray-200">
                                        <div className="text-center">
                                            <ClockCircleOutlined className="text-2xl text-blue-500 mb-2" />
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {selectedChapitre.duration_minutes}
                                            </div>
                                            <div className="text-gray-600">{t('chapitres.table.minutes')}</div>
                                        </div>
                                    </Card>
                                    <Card className="rounded-xl border border-gray-200">
                                        <div className="text-center">
                                            <BookOutlined className="text-2xl text-purple-500 mb-2" />
                                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                                {selectedChapitre.activity_count}
                                            </div>
                                            <div className="text-gray-600">{t('chapitres.table.activities')}</div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Métadonnées */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center">
                                        <span className="text-gray-700 font-medium w-32">{t('chapitres.table.subject')}:</span>
                                        <Tag color="blue" icon={<BookOutlined />}>
                                            {selectedChapitre.subject_name}
                                        </Tag>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-700 font-medium w-32">{t('chapitres.table.difficulty')}:</span>
                                        <Tag color={difficultyColor(selectedChapitre.difficulty)}>
                                            {t(`chapitres.difficulty.${selectedChapitre.difficulty || "medium"}`)}
                                        </Tag>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-700 font-medium w-32">{t('chapitres.table.createdAt')}:</span>
                                        <span className="text-gray-600">
                                            {new Date(selectedChapitre?.created_at!).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                              

                                <div className="pt-6 border-t border-gray-200 mt-4">
                                    <Button
                                        size="large"
                                        block
                                        className="rounded-full h-12"
                                        onClick={() => setIsDetailVisible(false)}
                                    >
                                        {t('chapitres.close')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChapitresView;