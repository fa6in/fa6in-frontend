import { useEffect, useState } from 'react';
import {
    Card,
    Table,
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
    Dropdown,
    type MenuProps,
    Typography,
    Avatar,
    // theme
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
    PlusOutlined,
    MoreOutlined,
    EditFilled,
    DeleteFilled,
    ClockCircleOutlined,
    OrderedListOutlined,
    FormatPainterOutlined,
    CloseOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetContent } from '../../../Services/Admin/Content/useGetContent';
import type { TypeContent } from '../../../Services/Admin/Content/typeContent';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import SpinnerLoader from '../../../ui/SpinnerLoader';
import AddNewContenu from './AddNewContenu';
import { FcViewDetails } from 'react-icons/fc';
import UpdateContenu from './UpdateContent';
import AuthService from '../../../Auth-service/AuthService';
import { useDeleteContent } from '../../../Services/Admin/Content/useDeleteContent';
import { getContentUnitId } from '../../../Services/Admin/Content/typeContent';

const { Option } = Select;
const { Text, Title } = Typography;
// const { useToken } = theme;

/* =======================
Animations améliorées
======================= */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 100
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
        }
    },
    hover: {
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 20
        }
    }
};

const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 15
        }
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: {
            duration: 0.2
        }
    }
};

const statsCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 12
        }
    },
    hover: {
        scale: 1.05,
        transition: {
            type: "spring",
            stiffness: 400
        }
    }
};

const modalVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 200
        }
    },
    exit: {
        opacity: 0,
        x: "100%",
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

/* =======================
Types et constantes
======================= */
const contentColors = {
    text: { primary: '#10b981', secondary: '#d1fae5', gradient: 'from-emerald-500 to-teal-500' },
    video: { primary: '#8b5cf6', secondary: '#ede9fe', gradient: 'from-violet-500 to-purple-500' },
    audio: { primary: '#06b6d4', secondary: '#cffafe', gradient: 'from-cyan-500 to-blue-500' },
    pdf: { primary: '#ef4444', secondary: '#fee2e2', gradient: 'from-red-500 to-rose-500' },
    image: { primary: '#f59e0b', secondary: '#fef3c7', gradient: 'from-amber-500 to-orange-500' },
    default: { primary: '#6b7280', secondary: '#f3f4f6', gradient: 'from-gray-500 to-gray-600' }
};

/* =======================
Component
======================= */
const ContenuView = () => {
    const { t, i18n } = useTranslation();
    // const { token } = useToken();
    const isRTL = i18n.language === "ar";

    // États
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('order');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
    const [selectedContent, setSelectedContent] = useState<TypeContent | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalshow, setIsModalShow] = useState<{ visible: boolean, content: TypeContent | null, type: string | null }>({
        visible: false, content: null!, type: null
    });
    const [selectedChapitre, setSelectedChapitre] = useState<number | undefined>(undefined);
    const [hoveredContentId, setHoveredContentId] = useState<number | null>(null);

    const role = AuthService.getRole()
    const { mutate: deleteContent } = useDeleteContent();
    const { data: chapitreData, isPending: isPendingChapitre } = useGetChapitre();

   

    useEffect(() => {
        if (chapitreData && chapitreData.length > 0) {
            setSelectedChapitre(chapitreData[0]?.id);
        }
    }, [chapitreData]);

    const getDirectImageUrl = (url: string): string => {
        try {
            // Gestion des liens files.fm
            if (url.includes('files.fm')) {
                const fileId = url.split('/').pop();
                if (fileId) {
                    return `https://files.fm/down.php?i=${fileId}`;
                }
            }

            // Gestion des liens Google Drive
            if (url.includes('drive.google.com')) {
                // https://drive.google.com/file/d/FILE_ID/view -> https://drive.google.com/uc?id=FILE_ID
                const match = url.match(/\/d\/([^\/]+)/);
                if (match) {
                    return `https://drive.google.com/uc?id=${match[1]}`;
                }
            }

            // Gestion des liens Dropbox
            if (url.includes('dropbox.com')) {
                // Remplacer ?dl=0 par ?dl=1 pour le téléchargement direct
                return url.replace('?dl=0', '?dl=1');
            }

            // Gestion des liens Imgur
            if (url.includes('imgur.com')) {
                if (url.includes('/a/') || url.includes('/gallery/')) {
                    // Pour les albums/galleries, on ne peut pas afficher directement
                    return url;
                }
                // Ajouter l'extension .jpg si ce n'est pas déjà une image
                if (!url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return `${url}.jpg`;
                }
            }

            return url;
        } catch (error) {
            console.error('Erreur lors du traitement de l\'URL image:', error);
            return url;
        }
    };

    // Fonction pour vérifier si l'URL est une image valide
    const isImageUrl = (url: string): boolean => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    

    const { data: contents, isPending } = useGetContent(selectedChapitre!);

    const generateItems = (content: TypeContent): MenuProps["items"] => role !== "student" ? [
        {
            key: '1',
            label: t("teachers.common.viewDetails"),
            icon: <FcViewDetails />,
            onClick: () => handleContentSelect(content)
        },
        {
            key: '2',
            label: t("common.edit"),
            icon: <EditFilled />,
            onClick: () => handleShow(content, "update"),
        },
        {
            key: '3',
            label: t("common.delete"),
            icon: <DeleteFilled />,
            danger: true,
            onClick: () => {
                if (content.id && getContentUnitId(content.unit)) {
                    handleDeleteContent(content);
                }
            },
        },
    ] : [
        {
            key: '1',
            label: t("teachers.common.viewDetails"),
            icon: <FcViewDetails />,
            onClick: () => handleContentSelect(content)
        },
    ]

    const getYouTubeEmbedUrl = (url: string): string => {
        try {
            // Regex pour extraire l'ID de la vidéo YouTube depuis différentes formes d'URL
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
                /^([^&\n?#]+)$/ // Si c'est juste l'ID
            ];

            let videoId = null;

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    videoId = match[1];
                    break;
                }
            }

            if (videoId) {
                // Nettoyer l'ID des paramètres supplémentaires
                videoId = videoId.split('?')[0].split('&')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            }

            // Si ce n'est pas une URL YouTube, retourner l'URL originale
            return url;
        } catch (error) {
            console.error('Erreur lors du parsing de l\'URL YouTube:', error);
            return url;
        }
    };

    const isAudioUrl = (url: string): boolean => {
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
        return audioExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const handleSelectChapitre = (value: number) => {
        setSelectedChapitre(value);
    };

    const handleShow = (content: TypeContent, type: string) => {
        setIsModalShow({ visible: true, content, type });
    };

    const handleDeleteContent = (content: TypeContent) => {
        const unitId = getContentUnitId(content.unit);
        if (!content.id || !unitId) return;

        Modal.confirm({
            title: t('common.confirm_delete'),
            content: content.title,
            okText: t('common.delete'),
            cancelText: t('common.cancel'),
            okButtonProps: { danger: true },
            onOk: () => deleteContent({ unitId, contentId: content.id! }),
        });
    };

    const CancelShow = () => {
        setIsModalShow({ visible: false, content: null!, type: null });
    };

    const filterContents = contents?.filter((content) => {
        const searchTerm = searchText?.trim().toLowerCase();
        if (!searchTerm) return true;

        return content?.title?.toLowerCase().includes(searchTerm) ||
            content?.code?.toLowerCase().includes(searchTerm) ||
            content?.content_type?.toLowerCase().includes(searchTerm) ||
            content?.content?.toLowerCase().includes(searchTerm);
    }) || [];

    // Tri des contenus
    const sortedContents = [...filterContents].sort((a, b) => {
        switch (sortBy) {
            case 'order':
                return (a.order ?? a.order_index ?? 0) - (b.order ?? b.order_index ?? 0);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'duration':
                return (a.metadata?.duration || 0) - (b.metadata?.duration || 0);
            default:
                return (a.order ?? a.order_index ?? 0) - (b.order ?? b.order_index ?? 0);
        }
    });

    const stats = {
        total: contents?.length || 0,
        textContents: contents?.filter(c => c.content_type === 'text')?.length || 0,
        videoContents: contents?.filter(c => c.content_type === 'video')?.length || 0,
        audioContents: contents?.filter(c => c.content_type === 'audio')?.length || 0,
        imageContents: contents?.filter(c => c.content_type === 'image')?.length || 0,
        totalDuration: contents?.reduce((acc, c) => acc + (c.metadata?.duration || 0), 0) || 0
    };

    const getContentTypeConfig = (type?: string) => {
        return contentColors[type as keyof typeof contentColors] || contentColors.default;
    };

    const getContentTypeIcon = (type?: string) => {
        switch (type) {
            case 'text': return <FileTextOutlined />;
            case 'video': return <VideoCameraOutlined />;
            case 'audio': return <AudioOutlined />;
            case 'pdf': return <FilePdfOutlined />;
            case 'image': return <FormatPainterOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    const getContentTypeLabel = (type?: string | null) => {
        if (!type) return "—";
        return t(`content.type.${type}`, { defaultValue: type });
    };

    const getContentUnitLabel = (content: TypeContent) => {
        if (typeof content.unit === 'object') {
            return content.unit.title || content.unit.code || `#${content.unit.id}`;
        }
        return content.unit ? `#${content.unit}` : "—";
    };

    const selectedUnit = typeof selectedContent?.unit === 'object' ? selectedContent.unit : undefined;
    const selectedSubject = selectedUnit?.subject;
    const selectedLevel = selectedSubject?.level;
    const selectedStage = selectedLevel?.stage;

    const renderContentPreview = (content: TypeContent) => {
        const config = getContentTypeConfig(content.content_type);

        switch (content.content_type) {
            case 'text':
                return (
                    <motion.div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-10 -mt-10" />
                        <Text className="text-gray-700 line-clamp-4" style={{
                            fontSize: content.metadata?.font_size === 'large' ? '1.1rem' : '1rem',
                            lineHeight: '1.6'
                        }}>
                            {content.content}
                        </Text>
                        {content.metadata?.has_quiz && (
                            <Badge count="Quiz" className="absolute top-2 left-2" />
                        )}
                    </motion.div>
                );

            case 'video':
                return (
                    <motion.div
                        className="relative rounded-xl overflow-hidden group/video cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleContentSelect(content)}
                    >
                        <div className={`h-40 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}>
                            {content.content?.includes('youtube.com') || content.content?.includes('youtu.be') ? (
                                <div className="w-full h-full relative">
                                    <iframe
                                        src={getYouTubeEmbedUrl(content.content)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={content.title}
                                    />
                                </div>
                            ) : (
                                <>
                                    <PlayCircleOutlined className="text-white text-5xl opacity-90 group-hover/video:opacity-100 group-hover/video:scale-110 transition-all duration-300" />
                                    {content.metadata?.duration! > 0 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            <ClockCircleOutlined className="mr-1" />
                                            {content.metadata?.duration ?? 0} min
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                );
            case 'audio':
                return (
                    <motion.div
                        className={`bg-gradient-to-br ${config.gradient} p-4 rounded-xl relative overflow-hidden cursor-pointer`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleContentSelect(content)}
                    >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <div className="relative flex items-center gap-3">
                            <Avatar
                                size={48}
                                icon={<AudioOutlined />}
                                className="bg-white/20 shadow-lg"
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <PlayCircleOutlined className="text-white text-xl" />
                                    <Text className="text-white text-sm font-medium truncate">
                                        {content?.title}
                                    </Text>
                                </div>
                                <div className="h-1.5 bg-white/30 rounded-full w-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <Text className="text-white/80 text-xs">
                                        {isAudioUrl(content.content)}
                                    </Text>
                                    {/* {content.metadata?.duration > 0 && (
                                        <Text className="text-white text-xs font-medium">
                                            {Math.floor((content.metadata?.duration ?? 0) / 60)}:
                                            {((content.metadata?.duration ?? 0) % 60).toString().padStart(2, '0')} min
                                        </Text>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'image':
                const imageUrl = getDirectImageUrl(content.content);
                const isDirectImage = isImageUrl(imageUrl);

                return (
                    <motion.div
                        className="relative rounded-xl overflow-hidden group/image cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleContentSelect(content)}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 group-hover/image:opacity-30 transition-opacity z-10`} />

                        {isDirectImage ? (
                            // Image directe
                            <div className="h-40 relative">
                                <img
                                    src={imageUrl}
                                    alt={content.metadata?.alt_text || content.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error('Erreur de chargement image:', imageUrl);
                                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+non+disponible';
                                        e.currentTarget.alt = 'Image non disponible';
                                    }}
                                />
                                {/* Overlay avec informations */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-20">
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="flex justify-between items-center">
                                            <Text className="text-white text-xs truncate flex-1">
                                                {content.title}
                                            </Text>
                                            <EyeOutlined className="text-white text-sm" />
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Lien de partage (pas d'image directe)
                            <div className={`h-40 bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center p-4 text-center relative`}>
                                <FormatPainterOutlined className="text-white text-4xl mb-2 opacity-80" />
                                <Text className="text-white text-sm font-medium line-clamp-2">
                                    {content.title}
                                </Text>
                                <Text className="text-white/80 text-xs mt-2">
                                    انقر لعرض الصورة
                                </Text>
                                <div className="absolute bottom-2 right-2 bg-white/20 rounded-full px-2 py-1">
                                    <Text className="text-white text-xs">
                                        رابط خارجي
                                    </Text>
                                </div>
                            </div>
                        )}

                        {/* Badge pour les métadonnées */}
                        {content.metadata?.alt_text && (
                            <Tooltip title={content.metadata.alt_text}>
                                <InfoCircleOutlined className="absolute top-2 right-2 text-white/80 z-20" />
                            </Tooltip>
                        )}
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const handleContentSelect = (content: TypeContent) => {
        setSelectedContent(content);
        setIsDetailVisible(true);
    };

    if (isPending || isPendingChapitre) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SpinnerLoader />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6"
        >
            {/* Header avec animations */}
            <motion.div variants={{ headerVariants }} className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Title level={1} className="!mb-2">
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {t('content.title')}
                                </span>
                            </Title>
                            <Text type="secondary" className="text-lg">
                                {t('content.subtitle')} <strong className="text-emerald-600">{stats.total}</strong> {t('content.itemsAvailable')}
                            </Text>
                        </motion.div>
                    </div>

                    {role !== "student" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={() => setIsModalVisible(true)}
                                className="!bg-gradient-to-r !from-emerald-500 !to-teal-500 !border-none shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                {t('common.add')}
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Statistiques améliorées */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { icon: <BookOutlined />, value: stats.total, label: t('content.stats.total'), color: 'emerald' },
                        { icon: <FileTextOutlined />, value: stats.textContents, label: t('content.type.text'), color: 'emerald' },
                        { icon: <VideoCameraOutlined />, value: stats.videoContents, label: t('content.type.video'), color: 'emerald' },
                        { icon: <AudioOutlined />, value: stats.audioContents, label: t('content.type.audio'), color: 'emerald' },
                        // { icon: <ClockCircleOutlined />, value: `${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`, label: t('content.stats.duration'), color: 'emerald' }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={{ statsCardVariants }}
                            whileHover="hover"
                            custom={index}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="text-center relative">
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-transparent`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: index * 0.1 + 0.5 }}
                                    />
                                    <Avatar
                                        size={48}
                                        icon={stat.icon}
                                        className={`!bg-${stat.color}-500 !text-white mb-3 shadow-lg`}
                                    />
                                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Barre de contrôle améliorée */}
            <motion.div
                variants={{ headerVariants }}
                className="mb-8"
            >
                <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
                        <motion.div
                            className="flex-1 w-full"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Input
                                placeholder={t('content.search.placeholder')}
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="rounded-full h-12 text-base shadow-sm hover:shadow-md transition-shadow"
                                allowClear
                                size="large"
                            />
                        </motion.div>

                        <Space wrap className="flex flex-wrap justify-center gap-3">
                            <Select
                                value={selectedChapitre}
                                onChange={handleSelectChapitre}
                                className="w-48"
                                size="large"
                                dropdownMatchSelectWidth={false}
                            >
                                {chapitreData?.map((chapitre) => (
                                    <Option key={chapitre.id} value={chapitre.id}>
                                        {chapitre.title}
                                    </Option>
                                ))}
                            </Select>

                            {/* <Select
                                value={contentTypeFilter}
                                onChange={setContentTypeFilter}
                                className="w-40"
                                size="large"
                                suffixIcon={<FilterOutlined />}
                                placeholder={t('content.filter.type')}
                                dropdownMatchSelectWidth={false}
                            >
                                <Option value="all">{t('content.filter.allTypes')}</Option>
                                <Option value="text">{t('content.type.text')}</Option>
                                <Option value="video">{t('content.type.video')}</Option>
                                <Option value="audio">{t('content.type.audio')}</Option>
                                <Option value="image">{t('content.type.image')}</Option>
                                <Option value="pdf">{t('content.type.pdf')}</Option>
                            </Select> */}

                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                className="w-40"
                                size="large"
                                suffixIcon={<SortAscendingOutlined />}
                                placeholder={t('content.sort.title')}
                                dropdownMatchSelectWidth={false}
                            >
                                <Option value="order">
                                    <OrderedListOutlined /> {t('content.sort.byOrder')}
                                </Option>
                                <Option value="title">
                                    <FileTextOutlined /> {t('content.sort.byName')}
                                </Option>
                                <Option value="duration">
                                    <ClockCircleOutlined /> {t('content.sort.byDuration')}
                                </Option>
                            </Select>

                            <Button.Group className="hidden md:flex">
                                <Button
                                    type={viewMode === 'grid' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => setViewMode('grid')}
                                    size="large"
                                    className={viewMode === 'grid' ? '!bg-emerald-500' : ''}
                                />
                                <Button
                                    type={viewMode === 'list' ? 'primary' : 'default'}
                                    icon={<MenuOutlined />}
                                    onClick={() => setViewMode('list')}
                                    size="large"
                                    className={viewMode === 'list' ? '!bg-emerald-500' : ''}
                                />
                                <Button
                                    type={viewMode === 'table' ? 'primary' : 'default'}
                                    icon={<OrderedListOutlined />}
                                    onClick={() => setViewMode('table')}
                                    size="large"
                                    className={viewMode === 'table' ? '!bg-emerald-500' : ''}
                                />
                            </Button.Group>

                            <Tooltip title={t('content.filter.reset')}>
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => {
                                        setSearchText('');
                                        setSortBy('order');
                                    }}
                                    size="large"
                                    className="rounded-full hover:rotate-180 transition-transform duration-300"
                                />
                            </Tooltip>
                        </Space>
                    </div>

                    {/* Résultats de recherche */}
                    <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Text type="secondary">
                            {t('content.showing')} <Text strong className="text-emerald-600">{sortedContents.length}</Text>
                            {t('content.of')} <Text strong>{stats.total}</Text> {t('content.items')}
                        </Text>
                    </motion.div>
                </Card>
            </motion.div>

            {/* Contenu principal */}
            {viewMode === 'table' && (
                <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                    <Table
                        rowKey="id"
                        dataSource={sortedContents}
                        pagination={{ pageSize: 8 }}
                        columns={[
                            { title: t('curriculum.code'), dataIndex: 'code', key: 'code', render: (value: string, record: TypeContent) => value || `#${record.id}` },
                            { title: t('form.fields.title'), dataIndex: 'title', key: 'title' },
                            { title: t('content.unit'), key: 'unit', render: (_: unknown, record: TypeContent) => getContentUnitLabel(record) },
                            { title: t('curriculum.order'), key: 'order', render: (_: unknown, record: TypeContent) => record.order ?? record.order_index ?? 0 },
                            {
                                title: t('common.status'),
                                key: 'status',
                                render: (_: unknown, record: TypeContent) => (
                                    <Tag color={record.is_published ? 'success' : 'default'}>
                                        {record.is_published ? t('common.yes') : t('common.no')}
                                    </Tag>
                                ),
                            },
                            {
                                title: t('common.actions'),
                                key: 'actions',
                                render: (_: unknown, record: TypeContent) => (
                                    <Space>
                                        <Button type="link" onClick={() => handleContentSelect(record)}>{t('content.view')}</Button>
                                        {role !== 'student' && (
                                            <>
                                                <Button type="link" onClick={() => handleShow(record, 'update')}>{t('common.edit')}</Button>
                                                <Button type="link" danger onClick={() => handleDeleteContent(record)}>{t('common.delete')}</Button>
                                            </>
                                        )}
                                    </Space>
                                ),
                            },
                        ]}
                    />
                </Card>
            )}
            <div className={viewMode === 'table' ? 'hidden' : ''}>
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    // Vue Grille améliorée
                    <motion.div
                        key="grid"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {sortedContents.length > 0 ? (
                            sortedContents.map((content) => {
                                const config = getContentTypeConfig(content.content_type);
                                return (
                                    <motion.div
                                        key={content.id}
                                        variants={{ cardVariants }}
                                        whileHover="hover"
                                        onHoverStart={() => setHoveredContentId(Number(content.id!))}
                                        onHoverEnd={() => setHoveredContentId(null)}
                                        layout
                                    >
                                        <Card
                                            className="rounded-2xl border-0 shadow-lg h-full cursor-pointer overflow-hidden group"
                                            bodyStyle={{ padding: 0 }}
                                        >
                                            {/* En-tête avec gradient */}
                                            <div className={`bg-gradient-to-r ${config.gradient} p-4 relative overflow-hidden`}>
                                                <motion.div
                                                    className="absolute inset-0 bg-white/20"
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: hoveredContentId === content.id ? '100%' : '-100%' }}
                                                    transition={{ duration: 0.8 }}
                                                />

                                                <div className="flex justify-between items-start relative">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            count={content.order ?? content.order_index ?? 0}
                                                            className="bg-white/20 text-white border-0"
                                                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                                        />
                                                        <Tag color="white" className="!bg-white/20 !text-white border-0 rounded-full px-3">
                                                            {content.code || `#${content.id}`}
                                                        </Tag>
                                                    </div>

                                                    <Dropdown
                                                        menu={{ items: generateItems(content) }}
                                                        trigger={['click']}
                                                        placement="bottomRight"
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<MoreOutlined className="text-white" />}
                                                            className="hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full border-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </Dropdown>
                                                </div>

                                                <Title level={4} className="!text-white !mt-4 !mb-0 line-clamp-2">
                                                    {content.title}
                                                </Title>
                                                <Text className="!text-white/80 text-xs block mt-1">
                                                    {getContentUnitLabel(content)}
                                                </Text>
                                            </div>

                                            {/* Aperçu du contenu */}
                                            <div className="p-4">
                                                {renderContentPreview(content)}
                                            </div>

                                            {/* Métadonnées et actions */}
                                            <div className="px-4 pb-4">
                                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                    <Text type="secondary" className="text-xs">
                                                        {t('content.unit')}: {getContentUnitLabel(content)}
                                                    </Text>

                                                    <Space size="small">
                                                        <Tag color={content.is_published ? 'success' : 'default'}>
                                                            {content.is_published ? t('common.yes') : t('common.no')}
                                                        </Tag>
                                                        <Tooltip title={t('content.view')}>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<EyeOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleContentSelect(content);
                                                                }}
                                                                className="hover:!text-emerald-500"
                                                            />
                                                        </Tooltip>

                                                        {content.metadata?.has_quiz && (
                                                            <Tooltip title={t('content.hasQuiz')}>
                                                                <CheckCircleOutlined className="text-emerald-500" />
                                                            </Tooltip>
                                                        )}
                                                    </Space>
                                                </div>
                                            </div>
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
                                        <Text type="secondary" className="text-lg">
                                            {t('content.noResults')}
                                        </Text>
                                    }
                                    className="py-12"
                                >
                                    <Button
                                        onClick={() => {
                                            setSearchText('');
                                        }}
                                        size="large"
                                        className="rounded-full px-8"
                                    >
                                        {t('content.resetFilters')}
                                    </Button>
                                </Empty>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    // Vue Liste améliorée
                    <motion.div
                        key="list"
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <AnimatePresence>
                            {sortedContents.map((content) => {
                                const config = getContentTypeConfig(content.content_type);
                                return (
                                    <motion.div
                                        key={content.id}
                                        variants={{ listItemVariants }}
                                        whileHover={{ scale: 1.01, x: 5 }}
                                        layout
                                    >
                                        <Card
                                            className="rounded-2xl border-0 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300"
                                            onClick={() => handleContentSelect(content)}
                                            bodyStyle={{ padding: '16px' }}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Icône et numéro d'ordre */}
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}
                                                        whileHover={{ rotate: 5, scale: 1.1 }}
                                                    >
                                                        {getContentTypeIcon(content.content_type)}
                                                    </motion.div>
                                                    <div className="text-2xl font-bold text-gray-300">
                                                        #{content.order ?? content.order_index ?? 0}
                                                    </div>
                                                </div>

                                                {/* Contenu */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <Title level={5} className="!mb-1">
                                                                {content.title}
                                                            </Title>
                                                            <Text type="secondary" className="text-xs block mb-1">
                                                                {content.code || `#${content.id}`} · {getContentUnitLabel(content)}
                                                            </Text>
                                                            <Text type="secondary" className="line-clamp-2 block">
                                                                {content.content}
                                                            </Text>
                                                        </div>
                                                        <Tag
                                                            color={config.primary}
                                                            className="rounded-full px-3 ml-4"
                                                            icon={getContentTypeIcon(content.content_type)}
                                                        >
                                                            {getContentTypeLabel(content.content_type)}
                                                        </Tag>
                                                    </div>

                                                    {/* Barre de progression ou métadonnées supplémentaires */}
                                                    <div className="mt-3 flex items-center gap-4">
                                                        <Space size="small" className="text-gray-400">
                                                            <ClockCircleOutlined />
                                                            <Text type="secondary" className="text-xs">
                                                                {content.metadata?.duration || 0} min
                                                            </Text>
                                                        </Space>

                                                        {content.metadata?.has_quiz && (
                                                            <Badge
                                                                count="Quiz"
                                                                style={{ backgroundColor: '#10b981' }}
                                                                className="rounded-full"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>

            {/* Modal de détails amélioré avec animations */}
            <AnimatePresence>
                {isDetailVisible && selectedContent && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsDetailVisible(false)}
                        />

                        <motion.div
                            variants={{ modalVariants }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-2/5 bg-white z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="relative min-h-full">
                                {/* En-tête avec gradient */}
                                <div className={`bg-gradient-to-r ${getContentTypeConfig(selectedContent.content_type).gradient} p-8 relative overflow-hidden`}>
                                    <motion.div
                                        className="absolute inset-0 bg-white/10"
                                        animate={{
                                            x: ['-100%', '100%'],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    />

                                    <Button
                                        icon={<CloseOutlined className="text-white" />}
                                        type="text"
                                        onClick={() => setIsDetailVisible(false)}
                                        className="absolute top-4 left-4 hover:bg-white/20"
                                    />

                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {getContentTypeIcon(selectedContent.content_type)}
                                        </motion.div>
                                        <div>
                                            <Tag color="white" className="!bg-white/20 !text-white border-0 rounded-full">
                                                {selectedContent.code || `#${selectedContent.id}`} • {getContentUnitLabel(selectedContent)}
                                            </Tag>
                                            <Title level={3} className="!text-white !mt-2 !mb-0">
                                                {selectedContent.title}
                                            </Title>
                                            <Tag color={selectedContent.is_published ? 'success' : 'default'}>
                                                {selectedContent.is_published ? t('common.yes') : t('common.no')}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu du modal */}
                                <div className="p-6">
                                    <div className="mb-6">
                                        <Title level={5} className="!mb-3 flex items-center gap-2">
                                            <BookOutlined className="text-emerald-500" />
                                            {t('content.unit')}
                                        </Title>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Code</Text>
                                                <Text strong>{selectedUnit?.code || '—'}</Text>
                                            </Card>
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Titre</Text>
                                                <Text strong>{selectedUnit?.title || '—'}</Text>
                                            </Card>
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Matière</Text>
                                                <Text strong>{selectedUnit?.subject_name || selectedSubject?.name || '—'}</Text>
                                            </Card>
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Niveau</Text>
                                                <Text strong>{selectedUnit?.subject?.level_name || selectedLevel?.name || '—'}</Text>
                                            </Card>
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Cycle</Text>
                                                <Text strong>{selectedStage?.name || selectedLevel?.stage_name || '—'}</Text>
                                            </Card>
                                            <Card size="small" className="border-0 bg-gray-50">
                                                <Text type="secondary" className="text-xs block">Leçons dans l'unité</Text>
                                                <Text strong>{selectedUnit?.lessons_count ?? 0}</Text>
                                            </Card>
                                        </div>
                                        {(selectedSubject?.description || selectedLevel?.description || selectedStage?.description) && (
                                            <Card size="small" className="border-0 bg-emerald-50 mt-3">
                                                <Text type="secondary" className="text-xs block">Description</Text>
                                                <Text>
                                                    {selectedSubject?.description || selectedLevel?.description || selectedStage?.description}
                                                </Text>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Métadonnées */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <Card className="text-center border-0 bg-gray-50">
                                            <Text type="secondary" className="text-xs block">
                                                {t('curriculum.code')}
                                            </Text>
                                            <Text strong className="text-sm break-all">
                                                {selectedContent.code || `#${selectedContent.id}`}
                                            </Text>
                                        </Card>

                                        <Card className="text-center border-0 bg-gray-50">
                                            <Text type="secondary" className="text-xs block">
                                                {t('content.unit')}
                                            </Text>
                                            <Text strong className="text-sm">
                                                {getContentUnitLabel(selectedContent)}
                                            </Text>
                                        </Card>

                                        <Card className="text-center border-0 bg-gray-50">
                                            <Text type="secondary" className="text-xs block">
                                                {t('curriculum.order')}
                                            </Text>
                                            <Text strong className="text-lg">
                                                {selectedContent.order_index ?? selectedContent.order ?? 0}
                                            </Text>
                                        </Card>

                                        <Card className="text-center border-0 bg-gray-50">
                                            <Text type="secondary" className="text-xs block">
                                                {t('curriculum.published')}
                                            </Text>
                                            <Tag color={selectedContent.is_published ? 'success' : 'default'} className="mt-1">
                                                {selectedContent.is_published ? t('common.yes') : t('common.no')}
                                            </Tag>
                                        </Card>

                                        <Card className="text-center border-0 bg-gray-50">
                                            <Text type="secondary" className="text-xs block">Goals complets</Text>
                                            <Tag color={selectedContent.goals_complete ? 'success' : 'warning'} className="mt-1">
                                                {selectedContent.goals_complete ? t('common.yes') : t('common.no')}
                                            </Tag>
                                        </Card>
                                    </div>

                                    {/* Aperçu complet du contenu */}
                                    <div className="mb-6">
                                        <Title level={5} className="!mb-3 flex items-center gap-2">
                                            <FileTextOutlined className="text-emerald-500" />
                                            {t('content.content')}
                                        </Title>
                                        <div className={`bg-gray-50 rounded-xl p-6 ${selectedContent.metadata?.font_size === 'large' ? 'text-lg' : ''}`}>
                                            {selectedContent.content ? (selectedContent.content_type === 'image' ? (
                                                <div className="bg-gray-100 rounded-xl overflow-hidden">
                                                    <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 p-4">
                                                        {isImageUrl(getDirectImageUrl(selectedContent.content)) ? (
                                                            // Image avec gestion des erreurs et zoom
                                                            <div className="relative group/image-modal">
                                                                <img
                                                                    src={getDirectImageUrl(selectedContent.content)}
                                                                    alt={selectedContent.metadata?.alt_text || selectedContent.title}
                                                                    className="w-full rounded-lg shadow-xl transition-transform duration-300 group-hover/image-modal:scale-105"
                                                                    loading="lazy"
                                                                    style={{
                                                                        maxHeight: '70vh',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    onError={(e) => {
                                                                        console.error('Erreur de chargement image:', selectedContent.content);
                                                                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                                                                    }}
                                                                />

                                                                {/* Barre d'outils pour l'image */}
                                                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/image-modal:opacity-100 transition-opacity">
                                                                    <Tooltip title="Ouvrir dans un nouvel onglet">
                                                                        <Button
                                                                            icon={<EyeOutlined />}
                                                                            size="small"
                                                                            className="bg-white/90 hover:bg-white"
                                                                            onClick={() => window.open(getDirectImageUrl(selectedContent.content), '_blank')}
                                                                        />
                                                                    </Tooltip>

                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Message pour les liens non directs
                                                            <div className="text-center py-12">
                                                                <FormatPainterOutlined className="text-6xl text-gray-400 mb-4" />
                                                                {/* <Title level={4} className="!text-gray-600 !mb-2">
                                                                    Image externe

                                                                </Title>
                                                                <Text type="secondary" className="block mb-4">
                                                                    Cette image est hébergée sur un service externe
                                                                </Text> */}
                                                                <Button
                                                                    type="primary"
                                                                    icon={<EyeOutlined />}
                                                                    href={selectedContent.content}
                                                                    target="_blank"
                                                                    className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !border-none"
                                                                >
                                                                    عرض الصورة الأصلية
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Métadonnées de l'image */}
                                                    <div className="p-4 bg-white">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


                                                            {selectedContent.metadata?.alt_text && (
                                                                <div className="text-center col-span-2">
                                                                    <Text type="secondary" className="text-xs block">Texte alternatif</Text>
                                                                    <Text strong className="text-sm">{selectedContent.metadata.alt_text}</Text>
                                                                </div>
                                                            )}

                                                            <div className="text-center">
                                                                <Text type="secondary" className="text-xs block">Type</Text>

                                                            </div>


                                                        </div>


                                                    </div>
                                                </div>
                                            ) : selectedContent.content_type === 'video' ? (
                                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={selectedContent.content.replace('watch?v=', 'embed/')}
                                                        className="w-full h-full"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : selectedContent.content_type === 'audio' ? (
                                                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg">
                                                    <audio controls className="w-full">
                                                        <source src={selectedContent.content} type="audio/mpeg" />
                                                    </audio>
                                                </div>
                                            ) : (
                                                <Text className="whitespace-pre-wrap">
                                                    {selectedContent.content}
                                                </Text>
                                            )) : (
                                                <Empty description="Aucun contenu détaillé disponible pour cette leçon." />
                                            )}
                                        </div>
                                    </div>

                                    {/* Métadonnées supplémentaires */}
                                    {selectedContent.metadata && Object.keys(selectedContent.metadata).length > 0 && (
                                        <div className="mb-6">
                                            <Title level={5} className="!mb-3 flex items-center gap-2">
                                                <InfoCircleOutlined className="text-emerald-500" />
                                                {t('content.metadata')}
                                            </Title>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(selectedContent.metadata).map(([key, value]) => {
                                                    if (value && !['id', 'created_at', 'updated_at'].includes(key)) {
                                                        return (
                                                            <Card key={key} className="border-0 bg-gray-50" size="small">
                                                                <Text type="secondary" className="text-xs block capitalize">
                                                                    {key.replace('_', ' ')}
                                                                </Text>
                                                                <Text strong className="text-sm">
                                                                    {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                                                                </Text>
                                                            </Card>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )}


                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Footer informatif amélioré */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 text-center"
            >
                <Divider>
                    <Space>
                        <InfoCircleOutlined className="text-gray-400" />
                        <Text type="secondary" className="text-sm">
                            {t('content.tip')}
                        </Text>
                    </Space>
                </Divider>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="max-w-2xl mx-auto"
                >
                    <Text type="secondary" className="text-gray-500">
                        {t('content.instruction')}
                    </Text>
                </motion.div>
            </motion.div>

            {/* Modals d'ajout et de modification */}
            <Modal
                open={isModalVisible}
                footer={null}
                title={t("matieres.modal.addTitle")}
                onCancel={() => setIsModalVisible(false)}
                width={750}
                maskClosable={false}
                closeIcon={false}
                className="rounded-2xl"
            >
                <AddNewContenu onCancel={() => setIsModalVisible(false)} />
            </Modal>

            <Modal
                open={isModalshow && isModalshow.type === "update"}
                footer={null}
                title={t("matieres.modal.editTitle")}
                onCancel={CancelShow}
                width={750}
                maskClosable={false}
                closeIcon={false}
                className="rounded-2xl"
            >
                <UpdateContenu content={isModalshow?.content!} contentId={isModalshow?.content?.id!} onCancel={CancelShow} />
            </Modal>
        </motion.div>
    );
};

export default ContenuView;

