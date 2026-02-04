import { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Input,
    Modal,
    Form,
    Tag,
    Avatar,
    Row,
    Col,
    Dropdown,
    Menu,
    message,
    Popconfirm,
    Tooltip,
    Badge,
    Statistic,
    Select,
    Divider
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MoreOutlined,
    UserOutlined,
    TeamOutlined,
    FilterOutlined,
    ReloadOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Option } from 'antd/es/mentions';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

// Données fictives pour la démo
const initialAdmins = [
    {
        key: '1',
        id: '1',
        username: 'school_admin',
        email: 'admin@school.edu',
        firstName: 'أحمد',
        lastName: 'المدير',
        phoneNumber: '+212612345678',
        role: 'admin',
        status: 'active',
        joinedDate: '2024-01-15',
        lastLogin: '2024-03-20',
        avatarColor: '#1890ff'
    },
    {
        key: '2',
        id: '2',
        username: 'admin_tech',
        email: 'tech@school.edu',
        firstName: 'محمد',
        lastName: 'التقني',
        phoneNumber: '+212698765432',
        role: 'super_admin',
        status: 'active',
        joinedDate: '2024-02-10',
        lastLogin: '2024-03-19',
        avatarColor: '#52c41a'
    },
    {
        key: '3',
        id: '3',
        username: 'mod_support',
        email: 'support@school.edu',
        firstName: 'فاطمة',
        lastName: 'المساعدة',
        phoneNumber: '+212655443322',
        role: 'moderator',
        status: 'inactive',
        joinedDate: '2024-03-01',
        lastLogin: '2024-03-15',
        avatarColor: '#fa8c16'
    }
];

export default function AdminView() {
    // const navigate = useNavigate();
    const [form] = Form.useForm();
    const [admins, setAdmins] = useState(initialAdmins);
    const [filteredAdmins, setFilteredAdmins] = useState(initialAdmins);
    const [loading, setLoading] = useState(false);
    //   const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    useEffect(() => {
        updateStats();
    }, [admins]);

    const updateStats = () => {
        const total = admins.length;
        const active = admins.filter(admin => admin.status === 'active').length;
        setStats({ total, active, inactive: total - active });
    };

    const handleSearch = (value: string) => {
        // setSearchText(value);
        if (!value.trim()) {
            setFilteredAdmins(admins);
            return;
        }
        const filtered = admins.filter(admin =>
            admin.username.toLowerCase().includes(value.toLowerCase()) ||
            admin.email.toLowerCase().includes(value.toLowerCase()) ||
            admin.firstName.toLowerCase().includes(value.toLowerCase()) ||
            admin.lastName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAdmins(filtered);
    };

    // const handleAddNew = () => {
    //     navigate('/admins/add');
    // };

    const handleEdit = (admin: any) => {
        setEditingAdmin(admin);
        form.setFieldsValue(admin);
        setIsModalVisible(true);
    };

    const handleView = (admin: any) => {
        setSelectedAdmin(admin);
        setViewModalVisible(true);
    };

    const handleDelete = (id: string) => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cet admin ?',
            content: 'Cette action est irréversible.',
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                setAdmins(admins.filter(admin => admin.id !== id));
                message.success('Admin supprimé avec succès');
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Veuillez sélectionner au moins un admin');
            return;
        }

        confirm({
            title: `Supprimer ${selectedRowKeys.length} admin(s) ?`,
            content: 'Cette action est irréversible.',
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                // setAdmins(admins.filter(admin => !selectedRowKeys.includes(admin?.key!)));
                setSelectedRowKeys([]);
                message.success(`${selectedRowKeys.length} admin(s) supprimé(s) avec succès`);
            }
        });
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            setLoading(true);
            setTimeout(() => {
                if (editingAdmin) {
                    // Mise à jour
                    //   setAdmins(admins.map(admin => 
                    //     admin.id === editingAdmin.id ? { ...admin, ...values } : admin
                    //   ));
                    message.success('Admin mis à jour avec succès');
                } else {
                    // Ajout
                    const newAdmin = {
                        ...values,
                        key: String(admins.length + 1),
                        id: String(admins.length + 1),
                        status: 'active',
                        joinedDate: new Date().toISOString().split('T')[0],
                        avatarColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    };
                    setAdmins([...admins, newAdmin]);
                    message.success('Admin ajouté avec succès');
                }
                setLoading(false);
                setIsModalVisible(false);
                form.resetFields();
                setEditingAdmin(null);
            }, 1000);
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingAdmin(null);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'red';
            case 'admin': return 'blue';
            case 'moderator': return 'orange';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'success' : 'default';
    };

    const columns = [
        {
            title: 'Admin',
            dataIndex: 'username',
            key: 'username',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar
                        style={{ backgroundColor: record.avatarColor }}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <Text strong>{text}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.firstName} {record.lastName}
                        </Text>
                    </div>
                </Space>
            ),
            sorter: (a: any, b: any) => a.username.localeCompare(b.username)
        },
        {
            title: 'Contact',
            dataIndex: 'email',
            key: 'email',
            render: (email: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <MailOutlined style={{ color: '#1890ff' }} />
                        <Text>{email}</Text>
                    </Space>
                    <Space>
                        <PhoneOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary">{record.phoneNumber}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Rôle',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={getRoleColor(role)} style={{ textTransform: 'capitalize' }}>
                    {role}
                </Tag>
            ),
            filters: [
                { text: 'Super Admin', value: 'super_admin' },
                { text: 'Admin', value: 'admin' },
                { text: 'Modérateur', value: 'moderator' }
            ],
            onFilter: (value: any, record: any) => record.role === value
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'active' ? 'success' : 'default'}
                    text={
                        <Tag color={getStatusColor(status)}>
                            {status === 'active' ? 'Actif' : 'Inactif'}
                        </Tag>
                    }
                />
            ),
            filters: [
                { text: 'Actif', value: 'active' },
                { text: 'Inactif', value: 'inactive' }
            ],
            onFilter: (value: any, record: any) => record.status === value
        },
        {
            title: 'Date d\'adhésion',
            dataIndex: 'joinedDate',
            key: 'joinedDate',
            sorter: (a: any, b: any) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Voir détails">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => handleView(record)}
                                type="text"
                            />
                        </motion.div>
                    </Tooltip>

                    <Tooltip title="Modifier">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                type="text"
                            />
                        </motion.div>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Popconfirm
                                title="Supprimer cet admin ?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Oui"
                                cancelText="Non"
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    type="text"
                                />
                            </Popconfirm>
                        </motion.div>
                    </Tooltip>

                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="1" icon={<EyeOutlined />}>
                                    Voir les permissions
                                </Menu.Item>
                                <Menu.Item key="2" icon={<UserOutlined />}>
                                    Réinitialiser mot de passe
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    key="3"
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={() => handleDelete(record.id)}
                                >
                                    Supprimer
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <Button icon={<MoreOutlined />} type="text" />
                    </Dropdown>
                </Space>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: any) => setSelectedRowKeys(keys)
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card bordered={false} className="shadow-sm">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Space>
                            <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                            <div>
                                <Title level={2} style={{ margin: 0 }}>Gestion des Admins</Title>
                                <Text type="secondary">Gérez les administrateurs du système</Text>
                            </div>
                        </Space>
                    </Col>

                    <Col>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {/* <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={handleAddNew}
                            >
                                Nouvel Admin
                            </Button> */}
                        </motion.div>
                    </Col>
                </Row>

                {/* Statistiques */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Row gutter={[16, 16]} className="mb-8">
                        <Col xs={24} md={8}>
                            <Card className="text-center">
                                <Statistic
                                    title="Total Admins"
                                    value={stats.total}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="text-center">
                                <Statistic
                                    title="Actifs"
                                    value={stats.active}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="text-center">
                                <Statistic
                                    title="Inactifs"
                                    value={stats.inactive}
                                    valueStyle={{ color: '#fa8c16' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </motion.div>

                {/* Barre d'outils */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Row gutter={[16, 16]} justify="space-between" className="mb-6">
                        <Col xs={24} md={12}>
                            <Search
                                placeholder="Rechercher par nom, email, prénom..."
                                prefix={<SearchOutlined />}
                                allowClear
                                enterButton
                                size="large"
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </Col>

                        <Col>
                            <Space>
                                {selectedRowKeys.length > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Popconfirm
                                            title={`Supprimer ${selectedRowKeys.length} élément(s) ?`}
                                            onConfirm={handleBulkDelete}
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                            >
                                                Supprimer ({selectedRowKeys.length})
                                            </Button>
                                        </Popconfirm>
                                    </motion.div>
                                )}

                                <Button icon={<FilterOutlined />}>
                                    Filtres
                                </Button>

                                <Button icon={<ReloadOutlined />}>
                                    Actualiser
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Table
                        columns={columns}
                        dataSource={filteredAdmins}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} sur ${total} admins`
                        }}
                        expandable={{
                            expandedRowRender: (record) => (
                                <Space direction="vertical">
                                    <Text strong>Dernière connexion: {record.lastLogin}</Text>
                                    <Text type="secondary">ID: {record.id}</Text>
                                </Space>
                            )
                        }}
                    />
                </motion.div>
            </Card>

            {/* Modal d'édition/ajout */}
            <Modal
                title={
                    <Space>
                        {editingAdmin ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingAdmin ? 'Modifier l\'Admin' : 'Ajouter un Admin'}</span>
                    </Space>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={loading}
                width={600}
                footer={[
                    <Button key="cancel" onClick={handleModalCancel}>
                        Annuler
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleModalOk}
                    >
                        {editingAdmin ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="adminForm"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="Prénom"
                                rules={[{ required: true, message: 'Prénom requis' }]}
                            >
                                <Input placeholder="أحمد" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Nom"
                                rules={[{ required: true, message: 'Nom requis' }]}
                            >
                                <Input placeholder="المدير" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Email requis' },
                            { type: 'email', message: 'Email invalide' }
                        ]}
                    >
                        <Input placeholder="admin@school.edu" />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Téléphone"
                        rules={[{ required: true, message: 'Téléphone requis' }]}
                    >
                        <Input placeholder="+212612345678" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Rôle"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Sélectionner un rôle">
                            <Option value="admin">Admin</Option>
                            <Option value="super_admin">Super Admin</Option>
                            <Option value="moderator">Modérateur</Option>
                        </Select>
                    </Form.Item>

                    {!editingAdmin && (
                        <>
                            <Form.Item
                                name="password"
                                label="Mot de passe"
                                rules={[
                                    { required: true, message: 'Mot de passe requis' },
                                    { min: 6, message: 'Minimum 6 caractères' }
                                ]}
                            >
                                <Input.Password placeholder="Mot de passe" />
                            </Form.Item>

                            <Form.Item
                                name="password2"
                                label="Confirmer mot de passe"
                                dependencies={['password']}
                                rules={[
                                    { required: true },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirmer le mot de passe" />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>

            {/* Modal de visualisation */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Détails de l'Admin</span>
                    </Space>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={500}
            >
                {selectedAdmin && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Avatar
                                    size={80}
                                    //   style={{ backgroundColor: selectedAdmin.avatarColor }}
                                    icon={<UserOutlined />}
                                />
                            </Col>
                            <Col span={16}>
                                {/* <Title level={4}>{selectedAdmin.firstName} {selectedAdmin.lastName}</Title>
                <Text type="secondary">@{selectedAdmin.username}</Text> */}
                            </Col>
                        </Row>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Row>
                                <Col span={8}>
                                    <Text strong>Email:</Text>
                                </Col>
                                <Col span={16}>
                                    {/* <Text>{selectedAdmin.email}</Text> */}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={8}>
                                    <Text strong>Téléphone:</Text>
                                </Col>
                                <Col span={16}>
                                    {/* <Text>{selectedAdmin.phoneNumber}</Text> */}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={8}>
                                    <Text strong>Rôle:</Text>
                                </Col>
                                <Col span={16}>
                                    {/* <Tag color={getRoleColor(selectedAdmin.role)}>
                    {selectedAdmin.role}
                  </Tag> */}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={8}>
                                    <Text strong>Statut:</Text>
                                </Col>
                                <Col span={16}>
                                    <Badge
                                    // status={selectedAdmin.status === 'active' ? 'success' : 'default'}
                                    // text={selectedAdmin.status === 'active' ? 'Actif' : 'Inactif'}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col span={8}>
                                    <Text strong>Date d'adhésion:</Text>
                                </Col>
                                <Col span={16}>
                                    {/* <Text>{selectedAdmin.joinedDate}</Text> */}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={8}>
                                    <Text strong>Dernière connexion:</Text>
                                </Col>
                                <Col span={16}>
                                    {/* <Text>{selectedAdmin.lastLogin}</Text> */}
                                </Col>
                            </Row>
                        </Space>
                    </Space>
                )}
            </Modal>
        </motion.div>
    );
}