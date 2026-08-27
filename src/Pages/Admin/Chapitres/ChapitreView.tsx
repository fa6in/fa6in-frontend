import React, { useState } from 'react';
import {
    Table,
    Button,
    Tag,
    Space,
    Input,
    Select,
    Modal,
    message,
    Badge,
    Tooltip,
    Progress,
    type MenuProps,
    Dropdown
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    SortAscendingOutlined,
    BookOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    UserOutlined,
    EyeOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AddNewChapitre from './AddNewChapitre';
import UpdateChapitre from './UpdateChapitre';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import AuthService from '../../../Auth-service/AuthService';
import { useDeleteChapitre } from '../../../Services/Admin/Chapitres/useDeleteChapitre';
import { usePublishChapitre } from '../../../Services/Admin/Chapitres/usePublishChapitre';
import PageShell from '../../../ui/PageShell';
import PageToolbar from '../../../ui/PageToolbar';
import DataPanel from '../../../ui/DataPanel';

const { Search } = Input;
const { Option } = Select;

const ChapitresView: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedChapitre, setSelectedChapitre] = useState<typeChapitre | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [popupState, setPopupState] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });

    const handleShowPop = (id: number) => {
        setPopupState({ id: id, open: true, });
    }
    const closeShowPop = () => {
        setPopupState({ id: null, open: false });
    }

    const post = AuthService.getRole()

    const { data: DataChapitre, isPending } = useGetChapitre()
    const { mutate: deleteChapitre } = useDeleteChapitre()
    const { mutate: publishchapitre, isPending: isPendingPublish } = usePublishChapitre()



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

    const handleEdit = (chapitre: typeChapitre) => {
        setSelectedChapitre(chapitre);
        setShowEditModal(true);
    };

    const handlePublish = () => {
        if (popupState?.id) {
            publishchapitre({ id: popupState?.id }, {
                onSuccess: () => {
                    message.success("Chapitre published with succès");
                    closeShowPop();
                }
            });

        }
    }


    const handleDelete = (id: number) => {
        console.log("id : ", id)
        Modal.confirm({
            title: t('chapitres.deleteConfirm.title'),
            content: t('chapitres.deleteConfirm.content'),
            okText: t('chapitres.common.delete'),
            okType: 'danger',
            cancelText: t('chapitres.common.cancel'),
            onOk: async () => {
                // Supprimer via API
                deleteChapitre({ id: id }, {
                    onSuccess: () => {
                        message.success(t('chapitres.messages.deleteSuccess'));

                    }
                })
            },
        });
    };


    const generateItems = (id: number): MenuProps["items"] => [
        {
            key: '1',
            label: "Publish",
            icon: <EditOutlined />,
            onClick: () => handleShowPop(id),
        },

    ];



    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'blue';
        }
    };

    const columns = post === "teacher" ?
        [
            {
                title: t('chapitres.table.order'),
                dataIndex: 'order',
                sorter: (a: typeChapitre, b: typeChapitre) => (a.order ?? a.order_index ?? 0) - (b.order ?? b.order_index ?? 0),
                render: (order: number) => (
                    <Badge count={order} style={{ backgroundColor: '#1890ff' }} />
                ),
            },
            {
                title: t('chapitres.table.title'),
                dataIndex: 'title',
                ellipsis: true,
                render: (text: string, record: typeChapitre) => (
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <img
                                src={String(record?.thumbnail)}
                                alt={text}
                                className="w-10 h-10 rounded-lg object-cover border"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div
                                className="font-semibold text-gray-900 truncate"
                                title={text}
                            >
                                {text}
                            </div>
                            <div
                                className="text-xs text-gray-500 truncate"
                                title={record.description}
                            >
                                {record.description}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: t('chapitres.table.subject'),
                dataIndex: 'subject_name',
                key: 'subject_name',
                render: (text: string) => (
                    <Tag color="blue" icon={<BookOutlined />} className="truncate max-w-full">
                        <span className="truncate inline-block max-w-full">{text}</span>
                    </Tag>
                ),
            },
            {
                title: t('chapitres.table.difficulty'),
                dataIndex: 'difficulty',
                key: 'difficulty',
                render: (difficulty: string) => (
                    <Tag color={difficultyColor(difficulty)} className="w-full text-center">
                        {t(`chapitres.difficulty.${difficulty}`)}
                    </Tag>
                ),
            },
            {
                title: t('chapitres.table.duration'),
                dataIndex: 'duration_minutes',
                key: 'duration_minutes',
                render: (minutes: number) => (
                    <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                        <ClockCircleOutlined />
                        <span>{minutes} {t('chapitres.table.minutes')}</span>
                    </div>
                ),
            },
            {
                title: t('chapitres.table.activities'),
                dataIndex: 'activity_count',
                key: 'activity_count',
                render: (count: number) => (
                    <div className="w-full">
                        <Progress
                            percent={Math.min(count * 20, 100)}
                            size="small"
                            strokeColor="#52c41a"
                            format={() => `${count}`}
                            style={{ lineHeight: 'normal' }}
                        />
                    </div>
                ),
            },

            {
                title: t('chapitres.table.status'),
                dataIndex: 'is_published',
                key: 'is_published',
                render: (isPublished: boolean) => (
                    <div className="flex items-center gap-2">
                        {isPublished ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-green-600 font-medium">
                                    {t("chapitres.common.published")}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-gray-600 font-medium">
                                    {t('chapitres.common.draft')}
                                </span>
                            </>
                        )}
                    </div>
                )
            },

        ] : [
            {
                title: t('chapitres.table.order'),
                dataIndex: 'order',
                sorter: (a: typeChapitre, b: typeChapitre) => (a.order ?? a.order_index ?? 0) - (b.order ?? b.order_index ?? 0),
                render: (order: number) => (
                    <Badge count={order} style={{ backgroundColor: '#1890ff' }} />
                ),
            },
            {
                title: t('chapitres.table.title'),
                dataIndex: 'title',
                ellipsis: true,
                render: (text: string, record: typeChapitre) => (
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <img
                                src={String(record?.thumbnail)}
                                alt={text}
                                className="w-10 h-10 rounded-lg object-cover border"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div
                                className="font-semibold text-gray-900 truncate"
                                title={text}
                            >
                                {text}
                            </div>
                            <div
                                className="text-xs text-gray-500 truncate"
                                title={record.description}
                            >
                                {record.description}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: t('chapitres.table.subject'),
                dataIndex: 'subject_name',
                key: 'subject_name',
                render: (text: string) => (
                    <Tag color="blue" icon={<BookOutlined />} className="truncate max-w-full">
                        <span className="truncate inline-block max-w-full">{text}</span>
                    </Tag>
                ),
            },
            {
                title: t('chapitres.table.difficulty'),
                dataIndex: 'difficulty',
                key: 'difficulty',
                render: (difficulty: string) => (
                    <Tag color={difficultyColor(difficulty)} className="w-full text-center">
                        {t(`chapitres.difficulty.${difficulty}`)}
                    </Tag>
                ),
            },
            {
                title: t('chapitres.table.duration'),
                dataIndex: 'duration_minutes',
                key: 'duration_minutes',
                render: (minutes: number) => (
                    <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                        <ClockCircleOutlined />
                        <span>{minutes} {t('chapitres.table.minutes')}</span>
                    </div>
                ),
            },
            {
                title: t('chapitres.table.activities'),
                dataIndex: 'activity_count',
                key: 'activity_count',
                render: (count: number) => (
                    <div className="w-full">
                        <Progress
                            percent={Math.min(count * 20, 100)}
                            size="small"
                            strokeColor="#52c41a"
                            format={() => `${count}`}
                            style={{ lineHeight: 'normal' }}
                        />
                    </div>
                ),
            },
            {
                title: t('chapitres.table.status'),
                dataIndex: 'is_published',
                key: 'is_published',
                render: (isPublished: boolean) => (
                    <div className="flex items-center gap-2">
                        {isPublished ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-green-600 font-medium">
                                    {t("chapitres.common.published")}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-gray-600 font-medium">
                                    {t('chapitres.common.draft')}
                                </span>
                            </>
                        )}
                    </div>
                )
            },
            {
                title: t("matieres.table.actions"),
                key: "actions",
                render: (__: any, record: any) => (
                    <Dropdown className="bg-main-color! text-white! shadow-2xl rounded-3xl" menu={{ items: generateItems(Number(record.id)) }} trigger={['click']} placement="bottomRight">
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            className="bg-white/90 backdrop-blur-sm hover:bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm border-0"
                        />
                    </Dropdown>
                )
            },
            {
                title: t('chapitres.common.actions'),
                key: 'actions',
                fixed: 'right' as const, // Garde les actions à droite
                render: (_: any, record: typeChapitre) => (
                    <Space size="small" wrap>
                        <Tooltip title={t('chapitres.common.edit')}>
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                className="text-blue-500 hover:text-blue-700"
                            />
                        </Tooltip>

                        <Tooltip title={t('chapitres.common.delete')}>
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record?.id!)}
                                className="text-red-500 hover:text-red-700"
                            />
                        </Tooltip>
                    </Space>
                ),
            },
            // {
            //     title: t('chapitres.table.createdAt'),
            //     dataIndex: 'created_at',
            //     key: 'created_at',
            //     ellipsis: true,
            //     render: (date: string) => (
            //         <div
            //             className="text-sm text-gray-500 truncate"
            //             title={new Date(date).toLocaleString()}
            //         >
            //             {new Date(date).toLocaleDateString()}
            //         </div>
            //     ),
            // },

        ];

    return (
        <PageShell
            title={t('chapitres.title')}
            subtitle={t('chapitres.subtitle')}
            icon={<BookOutlined />}
            extra={
                (post === "teacher" || post === "admin") ? (
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setShowAddModal(true)}
                    >
                        {t('chapitres.addNew')}
                    </Button>
                ) : undefined
            }
        >
            <PageToolbar
                search={
                    <Search
                        placeholder={t('chapitres.search.placeholder')}
                        prefix={<SearchOutlined />}
                        size="large"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                }
                filters={
                    <>
                        <Select
                            placeholder={t('chapitres.filter.difficulty')}
                            size="large"
                            value={selectedDifficulty}
                            onChange={setSelectedDifficulty}
                            className="w-40"
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">{t('chapitres.filter.allDifficulties')}</Option>
                            <Option value="easy">{t('chapitres.difficulty.easy')}</Option>
                            <Option value="medium">{t('chapitres.difficulty.medium')}</Option>
                            <Option value="hard">{t('chapitres.difficulty.hard')}</Option>
                        </Select>
                        <Select
                            placeholder={t('chapitres.filter.status')}
                            size="large"
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            className="w-40"
                        >
                            <Option value="all">{t('chapitres.filter.allStatus')}</Option>
                            <Option value="published">{t('chapitres.common.published')}</Option>
                            <Option value="draft">{t('chapitres.common.draft')}</Option>
                        </Select>
                        <Button
                            size="large"
                            icon={<SortAscendingOutlined />}
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {t('chapitres.sort.order')} {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                    </>
                }
            />

            <DataPanel loading={isPending}>
                <Table
                    columns={columns}
                    dataSource={filteredChapitres}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        responsive: true,
                        showSizeChanger: true,
                        showTotal: (total) => `${t('chapitres.common.total')} ${total} ${t('chapitres.table.items')}`,
                    }}
                    scroll={{ x: true }}
                    rowClassName="hover:bg-[#f6faf7] transition-colors"
                    className="!w-full"
                    size="middle"
                />
            </DataPanel>

            {/* Modals */}
            {showAddModal && (
                <AddNewChapitre
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        message.success(t('chapitres.messages.addSuccess'));
                    }}
                />
            )}

            {showEditModal && selectedChapitre && (
                <UpdateChapitre
                    visible={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedChapitre(null);
                    }}
                    chapitre={selectedChapitre}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedChapitre(null);
                        message.success(t('chapitres.messages.updateSuccess'));
                    }}
                />
            )}

            <Modal
                className="rounded-2xl overflow-hidden"
                onCancel={closeShowPop}
                open={popupState.open}
                footer={null}
                width={420}
                closeIcon={
                    <div className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <CloseOutlined className="text-gray-500 text-sm" />
                    </div>
                }
                maskClosable={false}
                destroyOnClose={true}
                centered
            >
                <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="p-6">
                    {/* Icone avec animation */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-lg">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <RocketOutlined className="text-white text-2xl" />
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-2 -right-2"
                            >
                                <Badge dot color="blue" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Titre avec animation */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-4"
                    >
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                            {t("chapitres.publish.title")}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t("chapitres.publish.subtitle")}
                        </p>
                    </motion.div>

                    {/* Informations du chapitre */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                                    <BookOutlined className="text-white text-lg" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                    {/* {popupState.chapitre?.title || t("chapitres.publish.unknownTitle")} */}
                                </h4>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <Tag
                                        color="blue"
                                        icon={<ClockCircleOutlined />}
                                        className="rounded-full text-xs px-2 py-1"
                                    >
                                        {/* {popupState.chapitre?.duration_minutes} {t("chapitres.table.minutes")} */}
                                    </Tag>
                                    {/* <Tag
                                        color={difficultyColor(popupState.chapitre?.difficulty || "medium")}
                                        className="rounded-full text-xs px-2 py-1"
                                    >
                                        {t(`chapitres.difficulty.${popupState.chapitre?.difficulty || "medium"}`)}
                                    </Tag> */}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Avertissement important */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <ExclamationCircleOutlined className="text-amber-500 text-lg mt-1" />
                            </div>
                            <div>
                                <h5 className="font-semibold text-amber-800 mb-1">
                                    {t("chapitres.publish.warningTitle")}
                                </h5>
                                <p className="text-amber-700 text-sm leading-relaxed">
                                    {t("chapitres.publish.warningMessage")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statut après publication */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Badge
                                status="processing"
                                color="blue"
                                text={
                                    <span className="text-sm font-medium text-gray-700">
                                        {t("chapitres.publish.statusAfter")}
                                    </span>
                                }
                            />
                        </div>
                        <div className="flex justify-center gap-3">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                    <EyeOutlined className="text-blue-600 text-lg" />
                                </div>
                                <span className="text-xs text-gray-600">{t("chapitres.common.published")}</span>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                    <UserOutlined className="text-green-600 text-lg" />
                                </div>
                                <span className="text-xs text-gray-600">{t("chapitres.publish.visibleToStudents")}</span>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                                    <CheckCircleOutlined className="text-purple-600 text-lg" />
                                </div>
                                <span className="text-xs text-gray-600">{t("chapitres.publish.readyForUse")}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Boutons d'action avec animations */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <Button
                            size="large"
                            onClick={closeShowPop}
                            className="min-w-[120px] h-11 rounded-full border-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            loading={isPendingPublish}
                            onClick={handlePublish}
                            className="min-w-[140px] h-11 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                            icon={<RocketOutlined />}
                        >
                            {t("chapitres.publish.confirm")}
                        </Button>
                    </motion.div>

                    {/* Footer info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-6 pt-4 border-t border-gray-100"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <InfoCircleOutlined />
                            <span>{t("chapitres.publish.footerInfo")}</span>
                        </div>
                    </motion.div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default ChapitresView;