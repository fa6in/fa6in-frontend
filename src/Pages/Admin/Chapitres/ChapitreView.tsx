import React, { useState } from 'react';
import {
    Table,
    Button,
    Card,
    Tag,
    Space,
    Input,
    Select,
    Switch,
    Modal,
    message,
    Badge,
    Tooltip,
    Progress
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    SortAscendingOutlined,
    BookOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AddNewChapitre from './AddNewChapitre';
import UpdateChapitre from './UpdateChapitre';
import { useGetChapitre } from '../../../Services/Admin/Chapitres/useGetChapitres';
import type { typeChapitre } from '../../../Services/Admin/Chapitres/typeChapitre';
import AuthService from '../../../Auth-service/AuthService';

const { Search } = Input;
const { Option } = Select;



const ChapitresView: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedChapitre, setSelectedChapitre] = useState<typeChapitre | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const post = AuthService.getRole()

    const { data: DataChapitre, isPending } = useGetChapitre()

    const filteredChapitres = DataChapitre ? DataChapitre?.filter(chapitre => {
        const matchesSearch = searchText === '' ||
            chapitre.title.toLowerCase().includes(searchText.toLowerCase()) ||
            chapitre.description.toLowerCase().includes(searchText.toLowerCase());

        const matchesDifficulty = selectedDifficulty === 'all' ||
            chapitre.difficulty === selectedDifficulty;

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'published' && chapitre.is_published) ||
            (selectedStatus === 'draft' && !chapitre.is_published);

        return matchesSearch && matchesDifficulty && matchesStatus;
    }) : []

    const handleEdit = (chapitre: typeChapitre) => {
        setSelectedChapitre(chapitre);
        setShowEditModal(true);
    };

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
                message.success(t('chapitres.messages.deleteSuccess'));
            },
        });
    };

    const handleTogglePublish = async (id: number, currentStatus: boolean) => {

        console.log("id : ", id)
        try {
            message.success(
                currentStatus
                    ? t('chapitres.messages.unpublishedSuccess')
                    : t('chapitres.messages.publishedSuccess')
            );
        } catch (error) {
            message.error(t('chapitres.messages.updateError'));
        }
    };

    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'blue';
        }
    };

    const columns = [
        {
            title: t('chapitres.table.order'),
            dataIndex: 'order',
            sorter: (a: typeChapitre, b: typeChapitre) => a.order - b.order,
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
                            src={record.thumbnail}
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
            render: (isPublished: boolean, record: typeChapitre) => (
                <Switch
                    checked={isPublished}
                    onChange={() => handleTogglePublish(record?.id!, isPublished)}
                    checkedChildren={t('chapitres.common.published')}
                    unCheckedChildren={t('chapitres.common.draft')}
                    size="small"
                />
            ),
        },
        {
            title: t('chapitres.table.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            ellipsis: true,
            render: (date: string) => (
                <div
                    className="text-sm text-gray-500 truncate"
                    title={new Date(date).toLocaleString()}
                >
                    {new Date(date).toLocaleDateString()}
                </div>
            ),
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
    ];

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('chapitres.title')}
                        </h1>

                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {post === "teacher" && (
                            <Button
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => setShowAddModal(true)}
                                className="!text-white !font-bold !bg-main-color border-none shadow-lg"
                            >
                                {t('chapitres.addNew')}
                            </Button>
                        )}
                    </motion.div>
                </div>

                <Card className="shadow-lg border-0 rounded-xl mb-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 min-w-[300px]"
                        >
                            <Search
                                placeholder={t('chapitres.search.placeholder')}
                                prefix={<SearchOutlined />}
                                size="large"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                className="w-full"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                size="large"
                                icon={<SortAscendingOutlined />}
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {t('chapitres.sort.order')} {sortOrder === 'asc' ? '↑' : '↓'}
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Table
                            columns={columns}
                            dataSource={filteredChapitres}
                            rowKey="id"
                            loading={isPending}
                            pagination={{
                                pageSize: 10,
                                responsive: true,
                                showSizeChanger: true,
                                showTotal: (total) => `${t('chapitres.common.total')} ${total} ${t('chapitres.table.items')}`,
                            }}
                            scroll={{ x: true }} // ← Supprimez ou modifiez cette ligne
                            rowClassName="hover:bg-gray-50 transition-colors"
                            className="!w-full"
                            size="middle"
                        />
                    </motion.div>
                </Card>
            </motion.div>

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
        </div>
    );
};

export default ChapitresView;