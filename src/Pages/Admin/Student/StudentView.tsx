import { useState } from "react";
import {
    Table,
    Card,
    Button,
    Tag,
    Input,
    Select,
    Space,
    Modal,
    Form,
    Avatar,
    Badge,
    Dropdown,
    Menu,
    Progress
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UserOutlined,
    MailOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    MoreOutlined,
    StarOutlined,
    BarChartOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AddNewStudent from "./AddNewStudent";

const { Option } = Select;

/* =======================
   Animations
======================= */
const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", damping: 12 }
    }
};

const cardHover = {
    hover: {
        y: -4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 }
    }
};

/* =======================
   Component
======================= */
const StudentView = () => {
    const { t, i18n } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    // const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const isRTL = i18n.language === "ar";

    // Données des étudiants
    const studentsData = [
        {
            key: "1",
            id: "ST001",
            name: "Med ahmedou",
            email: "med@gmail.com",
            phone: "483354773",
            avatar: "AA",
            status: "active",
            year: "3rd Year",
            grade: "A",
            courses: 6,
            attendance: 95,
            gpa: 3.8,
            joinDate: "2022-09-15",
            class: "Computer Science",
            fees: "Paid",
            lastActive: "2 hours ago"
        },
        {
            key: "2",
            id: "ST002",
            name: "Mbare salem",
            email: "mbare@gmail.com",
            phone: "24243434",
            avatar: "FZ",
            status: "active",
            year: "2nd Year",
            grade: "A+",
            courses: 5,
            attendance: 98,
            gpa: 3.9,
            joinDate: "2023-09-10",
            class: "Software Engineering",
            fees: "Paid",
            lastActive: "1 day ago"
        },
        {
            key: "3",
            id: "ST003",
            name: "Mohamed tichiti",
            email: "medtichiti@gmail.com",
            phone: "+216 22 456 789",
            avatar: "MS",
            status: "pending",
            year: "4th Year",
            grade: "B+",
            courses: 7,
            attendance: 85,
            gpa: 3.4,
            joinDate: "2021-09-20",
            class: "Information Technology",
            fees: "Pending",
            lastActive: "3 days ago"
        },

    ];

    // Options de filtres
    const statusOptions = [
        { value: "all", label: t("students.filters.status.all") },
        { value: "active", label: t("students.filters.status.active") },
        { value: "inactive", label: t("students.filters.status.inactive") },
        { value: "pending", label: t("students.filters.status.pending") }
    ];

    const yearOptions = [
        { value: "all", label: t("students.filters.year.all") },
        { value: "1st", label: t("students.filters.year.first") },
        { value: "2nd", label: t("students.filters.year.second") },
        { value: "3rd", label: t("students.filters.year.third") },
        { value: "4th", label: t("students.filters.year.fourth") }
    ];

    // Menu d'actions pour chaque étudiant
    const getActionsMenu = () => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />}>
                {t("students.actions.view")}
            </Menu.Item>
            <Menu.Item key="edit" icon={<EditOutlined />}>
                {t("students.actions.edit")}
            </Menu.Item>
            <Menu.Item key="grades" icon={<BarChartOutlined />}>
                {t("students.actions.grades")}
            </Menu.Item>
            <Menu.Item key="message" icon={<MailOutlined />}>
                {t("students.actions.message")}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                {t("students.actions.delete")}
            </Menu.Item>
        </Menu>
    );

    // Colonnes du tableau
    const columns = [
        {
            title: t("students.table.id"),
            dataIndex: "id",
            key: "id",
            sorter: (a: any, b: any) => a.id.localeCompare(b.id),
        },
        {
            title: t("students.table.student"),
            dataIndex: "name",
            key: "name",
            render: (text: string, record: any) => (
                <div className="flex items-center space-x-3">
                    <Avatar size="large" className="bg-blue-500">
                        {record.avatar}
                    </Avatar>
                    <div>
                        <div className="font-semibold text-gray-900">{text}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: t("students.table.year"),
            dataIndex: "year",
            key: "year",
            render: (year: string) => (
                <Tag color="blue" className="rounded-full px-3">
                    {year}
                </Tag>
            ),
        },
        {
            title: t("students.table.class"),
            dataIndex: "class",
            key: "class",
        },
        {
            title: t("students.table.status"),
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusConfig: any = {
                    active: { color: "green", text: t("students.status.active") },
                    inactive: { color: "red", text: t("students.status.inactive") },
                    pending: { color: "orange", text: t("students.status.pending") }
                };
                const config = statusConfig[status] || { color: "gray", text: status };
                return (
                    <Badge
                        status={config.color as any}
                        text={config.text}
                        className="font-medium"
                    />
                );
            },
            filters: [
                { text: t("students.status.active"), value: "active" },
                { text: t("students.status.inactive"), value: "inactive" },
                { text: t("students.status.pending"), value: "pending" }
            ],
            onFilter: (value: any, record: any) => record.status === value,
        },
        {
            title: t("students.table.gpa"),
            dataIndex: "gpa",
            key: "gpa",
            render: (gpa: number) => (
                <div className="flex items-center">
                    <Progress
                        percent={(gpa / 4) * 100}
                        size="small"
                        showInfo={false}
                        strokeColor={
                            gpa >= 3.5 ? "#10b981" :
                                gpa >= 3.0 ? "#f59e0b" :
                                    "#ef4444"
                        }
                    />
                    <span className="ml-2 font-semibold">{gpa.toFixed(1)}</span>
                </div>
            ),
            sorter: (a: any, b: any) => a.gpa - b.gpa,
        },
        {
            title: t("students.table.attendance"),
            dataIndex: "attendance",
            key: "attendance",
            render: (attendance: number) => (
                <div className="flex items-center">
                    <Progress
                        percent={attendance}
                        size="small"
                        showInfo={false}
                        strokeColor={
                            attendance >= 90 ? "#10b981" :
                                attendance >= 75 ? "#f59e0b" :
                                    "#ef4444"
                        }
                    />
                    <span className="ml-2">{attendance}%</span>
                </div>
            ),
            sorter: (a: any, b: any) => a.attendance - b.attendance,
        },

        {
            title: t("students.table.actions"),
            key: "actions",
            render: (_: any) => (
                <Dropdown overlay={getActionsMenu()} trigger={["click"]}>
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="text-gray-500 hover:text-gray-700"
                    />
                </Dropdown>
            ),
        },
    ];

    // Statistiques
    const stats = [
        {
            key: "total",
            title: t("students.stats.total"),
            value: 2543,
            icon: <TeamOutlined />,
            color: "from-blue-500 to-blue-600",
            change: "+12.5%",
        },
        {
            key: "active",
            title: t("students.stats.active"),
            value: 2310,
            icon: <CheckCircleOutlined />,
            color: "from-green-500 to-green-600",
            change: "+8.2%",
        },
        {
            key: "new",
            title: t("students.stats.new"),
            value: 148,
            icon: <UserOutlined />,
            color: "from-purple-500 to-purple-600",
            change: "+15.3%",
        },
        {
            key: "averageGPA",
            title: t("students.stats.averageGPA"),
            value: 3.4,
            icon: <StarOutlined />,
            color: "from-orange-500 to-orange-600",
            change: "+0.2",
        },
    ];

    // Gestion des événements
    const handleAddStudent = () => {
        setSelectedStudent(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // Filtrage des données
    const filteredData = studentsData.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.email.toLowerCase().includes(searchText.toLowerCase()) ||
            student.id.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === "all" || student.status === statusFilter;
        const matchesYear = yearFilter === "all" || student.year.includes(yearFilter);

        return matchesSearch && matchesStatus && matchesYear;
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gray-50 p-4 md:p-6"
            dir={isRTL ? "rtl" : "ltr"}
        >
            {/* Header */}
            <motion.div variants={{ item }} className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            {t("students.title")}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t("students.subtitle")}
                        </p>
                    </div>
                    <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>

                        <Button
                            icon={<PlusOutlined />}
                            className="flex items-center !bg-main-color !text-white"
                            onClick={handleAddStudent}
                        >
                            {t("students.addStudent")}
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Statistiques */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.key}>
                        <motion.div variants={{ item }} whileHover="hover">
                            <motion.div variants={cardHover}>
                                <Card className="rounded-2xl shadow-sm border-0 h-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">
                                                {stat.title}
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">
                                                {stat.value}
                                            </div>

                                        </div>
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                                        >
                                            {stat.icon}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Barre de recherche et filtres */}
            <motion.div variants={{ item }} className="mb-6">
                <Card className="rounded-2xl shadow-sm border-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <Input
                            placeholder={t("students.searchPlaceholder")}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-full lg:w-96 rounded-xl"
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Space wrap className={isRTL ? "space-x-reverse" : ""}>
                            <Select
                                placeholder={t("students.filters.status.label")}
                                className="w-40"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                suffixIcon={<FilterOutlined />}
                            >
                                {statusOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                placeholder={t("students.filters.year.label")}
                                className="w-40"
                                value={yearFilter}
                                onChange={setYearFilter}
                            >
                                {yearOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setStatusFilter("all");
                                    setYearFilter("all");
                                }}
                            >
                                {t("students.clearFilters")}
                            </Button>
                        </Space>
                    </div>
                </Card>
            </motion.div>

            {/* Onglets et tableau */}
            <motion.div variants={{ item }}>
                <Card className="rounded-2xl shadow-sm border-0">
                    <Table
                        columns={columns.map(col => ({
                            ...col,
                            responsive: ['md'], // Cette colonne apparaît seulement sur md et plus
                        }))}
                        dataSource={filteredData}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,

                        }}
                        scroll={{ x: true }}
                        // loading={loading}
                        rowClassName="hover:bg-gray-50"
                    />

                </Card>
            </motion.div>

            {/* Modal d'ajout/édition d'étudiant */}
            <Modal
                footer={null}
                title={
                    selectedStudent
                        ? t("students.modal.editTitle")
                        : t("students.modal.addTitle")
                }
                open={isModalVisible}
                // onOk={handleModalOk}
                onCancel={handleModalCancel}
                // confirmLoading={loading}
                width={600}
                cancelText={t("common.cancel")}
                className="rounded-2xl"
                maskClosable={false}
            >
                <AddNewStudent handleModalCancel={handleModalCancel} />

            </Modal>
        </motion.div>
    );
};

export default StudentView;

