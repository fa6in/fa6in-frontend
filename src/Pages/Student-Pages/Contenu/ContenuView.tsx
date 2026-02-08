import { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Tag,
    Input,
    Select,
    Space,
    Badge,
    Empty,
    Divider,
    Tooltip,
    Modal,
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    BookOutlined,
    FileTextOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    FilePdfOutlined,
    PlayCircleOutlined,
    SortAscendingOutlined,
    EyeOutlined,
    InfoCircleOutlined,
    MenuOutlined,
    AppstoreOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetContent } from '../../../Services/Admin/Content/useGetContent';
import type { TypeContent } from '../../../Services/Admin/Content/typeContent';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import SpinnerLoader from '../../../ui/SpinnerLoader';
import AddNewContenu from './AddNewContenu';

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

const contentCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};

/* =======================
Component
======================= */
const ContenuView = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    // États
    const [searchText, setSearchText] = useState('');
    const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState('order');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedContent, setSelectedContent] = useState<TypeContent | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    // const [contents, setContents] = useState<ContentItem[]>([]);

    const [selectChapitre, setSelectedChapitre] = useState<number | undefined>(undefined);
    const { data: chapitreData, isPending: isPendingChapitre } = useGetChapitre();

    useEffect(() => {
        if (chapitreData && chapitreData.length > 0) {
            setSelectedChapitre(chapitreData[0]?.id);
        }
    }, [chapitreData]);

    const { data: contents, isPending } = useGetContent(selectChapitre!);

    const handleSelectChapitre = (value: number) => {
        setSelectedChapitre(value);
    };

    const filterContents = contents?.filter((content) => {
        const searchTerm = searchText?.trim();
        if (!searchTerm) return true;

        // Pour l'arabe, pas besoin de toLowerCase() si vous voulez préserver la casse
        return content?.title?.includes(searchTerm) ||
            content?.content_type?.includes(searchTerm) ||
            content?.content?.includes(searchText);
    }) || [];

    const stats = {
        total: contents?.length!,
        completed: 1,
        totalDuration: 6,
        textContents: contents?.filter(c => c.content_type === 'text')?.length,
        videoContents: contents?.filter(c => c.content_type === 'video')?.length,
        quizContents: contents?.filter(c => c.content_type === 'quiz')?.length
    };

    // Icône selon le type de contenu
    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <FileTextOutlined />;
            case 'video': return <VideoCameraOutlined />;
            case 'audio': return <AudioOutlined />;
            case 'pdf': return <FilePdfOutlined />;
            case 'quiz': return <BookOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    // Couleur selon le type de contenu
    const getContentTypeColor = (type: string) => {
        switch (type) {
            case 'text': return 'green';
            case 'video': return 'purple';
            case 'audio': return 'green';
            case 'pdf': return 'red';
            case 'quiz': return 'orange';
            default: return 'gray';
        }
    };






    // Gérer le contenu sélectionné
    const handleContentSelect = (content: TypeContent) => {
        setSelectedContent(content);
        setIsDetailVisible(true);
    };

    // Rendu du contenu selon le type
    const renderContentPreview = (content: TypeContent) => {
        switch (content.content_type) {
            case 'text':
                return (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-gray-700 line-clamp-4" style={{
                            fontSize: content.metadata.font_size === 'large' ? '1.1rem' : '1rem'
                        }}>
                            {content.content}
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                        <div className="h-40 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <PlayCircleOutlined className="text-white text-4xl" />
                        </div>
                        <div className="absolute top-2 right-2">
                            <Tag color="purple" className="rounded-full">
                                {t('content.video')}
                            </Tag>
                        </div>
                    </div>
                );
            // case 'quiz':
            //     return (
            //         <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
            //             <div className="flex items-center justify-between">
            //                 <div>
            //                     <h4 className="font-semibold text-gray-800">{t('content.quiz')}</h4>
            //                     <p className="text-sm text-gray-600 mt-1">
            //                         {content.metadata.questions_count || 5} {t('content.questions')}
            //                     </p>
            //                 </div>
            //                 <Button type="primary" shape="circle" icon={<PlayCircleOutlined />} />
            //             </div>
            //         </div>
            //     );

            case 'pdf':
                return (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-red-100 rounded flex items-center justify-center">
                                <FilePdfOutlined className="text-red-500 text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">PDF</h4>
                                <p className="text-sm text-gray-600">
                                    {/* {content.metadata.file_size || '1.5 MB'} */}
                                    {'1.5 MB'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isPending || isPendingChapitre) {
        return <SpinnerLoader />
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 p-4 md:p-6"
        >
            {/* Header avec animations */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                            {t('content.title')}
                        </h1>
                        {/* <p className="text-gray-600 text-lg mt-2">
                            {t('content.subtitle')}
                            <span className="font-semibold text-blue-600"> {stats.total} </span>
                            {t('content.itemsAvailable')}
                        </p> */}
                    </div>

                    {/* Sélecteur d'unité */}
                    <div className="flex items-center gap-4">
                        <Button
                            className='!bg-main-color !text-white !border-none'
                            icon={<PlusOutlined />}
                            size="large"
                        onClick={()=>setIsModalVisible(true)}
                        >
                            محتوى جديد
                        </Button>
                    </div>
                </div>

                {/* Statistiques */}
                {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="rounded-2xl border-0 shadow-lg h-full">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
                                <div className="text-sm text-gray-600">{t('content.stats.total')}</div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="rounded-2xl border-0 shadow-lg h-full">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
                                <div className="text-sm text-gray-600">{t('content.stats.completed')}</div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="rounded-2xl border-0 shadow-lg h-full">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.videoContents}</div>
                                <div className="text-sm text-gray-600">{t('content.stats.videos')}</div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="rounded-2xl border-0 shadow-lg h-full">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.quizContents}</div>
                                <div className="text-sm text-gray-600">{t('content.stats.quizzes')}</div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="rounded-2xl border-0 shadow-lg h-full">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 mb-1">
                                    {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
                                </div>
                                <div className="text-sm text-gray-600">{t('content.stats.duration')}</div>
                            </div>
                        </Card>
                    </motion.div>
                </div> */}
            </motion.div>

            {/* Barre de contrôle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
            >
                <Card className="rounded-2xl shadow-md border-0 bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
                        <div className="flex-1 w-full">
                            <Input
                                placeholder={t('content.search.placeholder')}
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="rounded-full h-12 text-base"
                                allowClear
                                size="large"
                            />
                        </div>

                        <Space wrap className="flex flex-wrap justify-center gap-3">
                            <Select
                                value={selectChapitre}
                                onChange={handleSelectChapitre}
                                className="w-48"
                                size="large"
                            >
                                {chapitreData?.map((chapitre) => {
                                    return (
                                        <Option value={chapitre?.id}>{chapitre.title}</Option>

                                    )
                                })}

                            </Select>

                            {/* Filtre type */}
                            <Select
                                value={contentTypeFilter}
                                onChange={setContentTypeFilter}
                                className="w-40"
                                size="large"
                                suffixIcon={<FilterOutlined />}
                                placeholder={t('content.filter.type')}
                            >
                                <Option value="all">{t('content.filter.allTypes')}</Option>
                                <Option value="text">{t('content.type.text')}</Option>
                                <Option value="video">{t('content.type.video')}</Option>
                                <Option value="audio">{t('content.type.audio')}</Option>
                                <Option value="pdf">{t('content.type.pdf')}</Option>
                                <Option value="quiz">{t('content.type.quiz')}</Option>
                            </Select>

                            {/* Tri */}
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                className="w-40"
                                size="large"
                                suffixIcon={<SortAscendingOutlined />}
                                placeholder={t('content.sort.title')}
                            >
                                <Option value="order">{t('content.sort.byOrder')}</Option>
                                <Option value="title">{t('content.sort.byName')}</Option>
                                <Option value="duration">{t('content.sort.byDuration')}</Option>
                                <Option value="progress">{t('content.sort.byProgress')}</Option>
                            </Select>

                            {/* Mode d'affichage */}
                            <Button.Group className="hidden md:flex">
                                <Button
                                    type={viewMode === 'grid' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => setViewMode('grid')}
                                    size="large"
                                />
                                <Button
                                    type={viewMode === 'list' ? 'primary' : 'default'}
                                    icon={<MenuOutlined />}
                                    onClick={() => setViewMode('list')}
                                    size="large"
                                />
                            </Button.Group>

                            {/* Reset */}
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText('');
                                    setContentTypeFilter('all');
                                    setSortBy('order');
                                }}
                                size="large"
                                className="rounded-full"
                            >
                                {t('content.filter.reset')}
                            </Button>
                        </Space>
                    </div>

                    {/* Info résultats */}
                    <div className="mt-4 text-center">
                        <span className="text-gray-600">
                            {t('content.showing')} <span className="font-bold text-green-600">{contents?.length!}</span>
                            {t('content.of')} <span className="font-bold">{stats.total}</span> {t('content.items')}
                        </span>
                    </div>
                </Card>
            </motion.div>

            {/* Contenu principal */}
            {viewMode === 'grid' ? (
                // Vue Grille
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {contents ? (
                            filterContents?.map((content, index) => (
                                <motion.div
                                    key={content.id}
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
                                        onClick={() => handleContentSelect(content)}
                                    >
                                        {/* En-tête de la carte */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge
                                                    count={`#${content.order}`}
                                                    style={{ backgroundColor: getContentTypeColor(content.content_type) }}
                                                    className="mr-2"
                                                />
                                                <Tag
                                                    color={getContentTypeColor(content.content_type)}
                                                    icon={getContentTypeIcon(content.content_type)}
                                                    className="rounded-full px-3"
                                                >
                                                    {t(`content.type.${content.content_type}`)}
                                                </Tag>
                                                <h3 className="text-xl font-bold text-gray-800 mt-2 group-hover:text-green-600 transition-colors line-clamp-2">
                                                    {content.title}
                                                </h3>
                                            </div>

                                        </div>

                                        {/* Aperçu du contenu */}
                                        <div className="mb-4">
                                            {renderContentPreview(content)}
                                        </div>

                                        {/* Métadonnées */}


                                        {/* Actions */}
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                {/* {content.created_at && new Date(content.created_at).toLocaleDateString()} */}
                                            </div>
                                            <Space size="small">
                                                <Tooltip title={t('content.view')}>
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<EyeOutlined />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleContentSelect(content);
                                                        }}
                                                    />
                                                </Tooltip>

                                            </Space>
                                        </div>

                                        {/* Effet hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-green-500/5 group-hover:via-purple-500/10 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />
                                    </Card>
                                </motion.div>
                            ))
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
                                            {t('content.noResults')}
                                        </span>
                                    }
                                    className="py-12"
                                >
                                    <Button
                                        onClick={() => {
                                            setSearchText('');
                                            setContentTypeFilter('all');
                                        }}
                                        size="large"
                                        className="rounded-full px-8"
                                    >
                                        {t('content.resetFilters')}
                                    </Button>
                                </Empty>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                // Vue Liste
                <div className="space-y-4">
                    <AnimatePresence>
                        {contents?.map((content, index) => (
                            <motion.div
                                key={content.id}
                                variants={contentCardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="rounded-2xl border-0 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
                                    onClick={() => handleContentSelect(content)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Icône et numéro */}
                                        <div className="flex-shrink-0 flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${getContentTypeColor(content.content_type)}-500 to-${getContentTypeColor(content.content_type)}-600 flex items-center justify-center text-white`}>
                                                {getContentTypeIcon(content.content_type)}
                                            </div>
                                            <div className="text-2xl font-bold text-gray-300">#{content.order}</div>
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
                                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                        {content.content}
                                                    </p>
                                                </div>
                                                <Tag color={getContentTypeColor(content.content_type)}>
                                                    {t(`content.type.${content.content_type}`)}
                                                </Tag>
                                            </div>


                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal de détails */}
            <AnimatePresence>
                {isDetailVisible && selectedContent && (
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
                            className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6">
                                {/* En-tête */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${getContentTypeColor(selectedContent.content_type)}-500 to-${getContentTypeColor(selectedContent.content_type)}-600 flex items-center justify-center text-white`}>
                                            {getContentTypeIcon(selectedContent.content_type)}
                                        </div>
                                        <div>
                                            <Tag color={getContentTypeColor(selectedContent.content_type)} className="rounded-full">
                                                {t(`content.type.${selectedContent.content_type}`)}
                                            </Tag>
                                            <div className="text-xs text-gray-500 mt-1">
                                                #{selectedContent.order} • {t('content.unit')} {selectedContent.unit}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        icon={<span className="text-xl">×</span>}
                                        type="text"
                                        onClick={() => setIsDetailVisible(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    />
                                </div>

                                {/* Titre */}
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                    {selectedContent.title}
                                </h2>



                                {/* Contenu principal */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                        <FileTextOutlined className="mr-2 text-green-500" />
                                        {t('content.content')}
                                    </h3>
                                    <div className={`bg-gray-50 rounded-xl p-6 ${selectedContent.metadata.font_size === 'large' ? 'text-lg' : ''}`}>
                                        {selectedContent.content}
                                    </div>
                                </div>



                                {/* Actions */}
                                <div className="space-y-4">
                                    {/* <Button
                                        type="primary"
                                        size="large"
                                        block
                                        icon={<PlayCircleOutlined />}
                                        className="rounded-full h-12"
                                    >
                                        {selectedContent.content_type === 'video' ? t('content.watchNow') : t('content.startReading')}
                                    </Button> */}

                                    {/* <div className="grid grid-cols-3 gap-3">
                                        <Button
                                            icon={<DownloadOutlined />}
                                            size="large"
                                            block
                                            className="rounded-lg"
                                        >
                                            {t('content.download')}
                                        </Button>
                                        
                                        <Button
                                            icon={<StarOutlined />}
                                            size="large"
                                            block
                                            className="rounded-lg"
                                        >
                                            {t('content.save')}
                                        </Button>
                                    </div> */}



                                    <Button
                                        size="large"
                                        block
                                        className="rounded-full h-12"
                                        onClick={() => setIsDetailVisible(false)}
                                    >
                                        {t('content.close')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Footer informatif */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
            >
                <Divider>
                    <span className="text-gray-400 text-sm flex items-center justify-center">
                        <InfoCircleOutlined className="mr-2" />
                        {t('content.tip')}
                    </span>
                </Divider>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    {t('content.instruction')}
                </p>
            </motion.div>
            <Modal
                open={isModalVisible}
                footer={null}
                title={t("matieres.modal.addTitle")}
                onCancel={() => setIsModalVisible(false)}
                width={750}
                maskClosable={false}
                closeIcon={false}
            >
                <AddNewContenu onCancel={() => setIsModalVisible(false)} />
            </Modal>
        </motion.div>
    );
};

export default ContenuView;