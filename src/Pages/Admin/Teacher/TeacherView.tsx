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
    Badge,
    Dropdown,
    Menu,
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    EyeOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AddNewTeacher from "./AddNewTeacher";
import { useGetTeacher } from "../../../Services/Admin/Teacher/useGetTeacher";
import type { Teacher } from "../../../Services/Admin/Teacher/typeTeacher";
import type { ColumnsType } from "antd/es/table";
import { VscError } from "react-icons/vsc";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import DetailsTeacher from "./DetailsTeacher";

const { Option } = Select;

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

const TeacherView = () => {
    const { t, i18n } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // Fonction pour ouvrir la modal des détails
    const handleViewDetails = (record: Teacher) => {
        setSelectedTeacher(record);
        setDetailsVisible(true);
    };

    // Fonction pour fermer la modal
    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedTeacher(null);
    };

    const { data: getTeacher, isPending } = useGetTeacher()

    console.log("getTeacher : ", getTeacher)

    const [form] = Form.useForm();

    const isRTL = i18n.language === "ar";



    // Options de filtres
    const statusOptions = [
        { value: "all", label: t("teachers.filters.status.all") },
        { value: "true", label: t("teachers.filters.status.active") },
        { value: "false", label: t("teachers.filters.status.inactive") },
    ];



    // Menu d'actions pour chaque étudiant
    const getActionsMenu = (record: Teacher) => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
            >
                {t("teachers.actions.view")}

            </Menu.Item>
        </Menu>
    );

    // Colonnes du tableau

    const columns: ColumnsType<Teacher> = [
        {
            title: t("teachers.table.table.id"),
            dataIndex: "id",
            key: "id",
            sorter: (a: Teacher, b: Teacher) => a?.id - b?.id,
        },
        {
            title: t("teachers.table.table.teacher"),
            dataIndex: "name",
            key: "name",
            render: (_, record: Teacher) => (
                <div className="flex items-center space-x-3">
                    <div>
                        <div className="font-semibold text-gray-900">
                            {record?.user?.first_name} {record?.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {record?.user?.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t("teachers.table.table.phone"),
            dataIndex: "phone",
            key: "phone",
            render: (_, record: Teacher) => (
                <div className="text-gray-700">{record.user.phone_number}</div>
            ),
        },
        {
            title: t("teachers.table.table.subjects"),
            dataIndex: "subjects",
            key: "subjects",
            render: (subjects: string) => (
                <div className="flex flex-wrap gap-1">
                    {subjects ? subjects.split(',').map((subject, index) => (
                        <Tag key={index} color="blue" className="rounded-full px-3">
                            {subject.trim()}
                        </Tag>
                    )) : <span className="text-gray-400">-</span>}
                </div>
            ),
        },
        {
            title: t("teachers.table.table.experience"),
            dataIndex: "years_of_experience",
            key: "experience",
            render: (experience: number) => (
                <Tag color={experience >= 5 ? "green" : experience >= 2 ? "orange" : "red"} className="rounded-full px-3">
                    {experience} {t("teachers.table.table.experience")}
                </Tag>
            ),
            sorter: (a: Teacher, b: Teacher) => a.years_of_experience - b.years_of_experience,
        },
        {
            title: t("teachers.table.table.qualification"),
            dataIndex: "qualification",
            key: "qualification",
            render: (qualification: string) => (
                <div className="text-gray-700">{qualification || "-"}</div>
            ),
        },
        {
            title: t("teachers.table.table.status"),
            dataIndex: "is_active",
            key: "status",
            render: (isActive: boolean) => {
                const statusConfig = {
                    true: { color: "green", text: t("teachers.status.active") },
                    false: { color: "red", text: t("teachers.status.inactive") }
                };
                const config = isActive ? statusConfig.true : statusConfig.false;
                return (
                    <Badge
                        status={config.color as any}
                        text={config.text}
                        className="font-medium"
                    />
                );
            },
            filters: [
                { text: t("teachers.status.active"), value: true },
                { text: t("teachers.status.inactive"), value: false }
            ],
            onFilter: (value: any, record: Teacher) => record.is_active === value,
        },
        {
            title: t("teachers.table.table.actions"),
            key: "actions",
            render: (_: any, record: Teacher) => (
                <Dropdown overlay={getActionsMenu(record)} trigger={["click"]}>
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="text-gray-500 hover:text-gray-700"
                    />
                </Dropdown>
            ),
        },
    ];

    const stats = [
        {
            key: "total",
            title: t("teachers.stats.total"),
            value: getTeacher?.count!,
            icon: <TeamOutlined />,
            color: "from-blue-500 to-blue-600",
            change: "+12.5%",
        },
        {
            key: "active",
            title: t("teachers.stats.active"),
            value: getTeacher?.results
                ?.filter(teacher => teacher?.user?.is_active)
                .length ?? 0,
            icon: <CheckCircleOutlined />,
            color: "from-green-500 to-green-600",
            change: "+8.2%",
        },
        {
            key: "new",
            title: t("teachers.stats.new"),
            value: getTeacher?.results
                ?.filter(teacher => teacher?.user?.is_active === false)
                .length ?? 0,
            icon: <VscError />,
            color: "bg-red-500",
            change: "+15.3%",
        }
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
    const filteredData = getTeacher?.results?.filter((teacher) => {
        const matchesSearch = teacher?.user?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            teacher?.user?.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            teacher?.user?.phone_number?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === "all" || String(teacher?.user?.is_active) === statusFilter;
        // const matchesYear = yearFilter === "all" || student.year.includes(yearFilter);

        return matchesSearch && matchesStatus;
    });


    if (isPending) {
        return <SpinnerLoader />
    }
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
                            {t("teachers.title")}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t("teachers.subtitle")}
                        </p>
                    </div>
                    <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>

                        <Button
                            icon={<PlusOutlined />}
                            className="flex items-center !bg-main-color !text-white"
                            onClick={handleAddStudent}
                        >
                            {t("teachers.addStudent")}
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Statistiques */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            placeholder={t("teachers.searchPlaceholder")}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-full lg:w-96 rounded-xl"
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Space wrap className={isRTL ? "space-x-reverse" : ""}>
                            <Select
                                placeholder={t("teachers.filters.status.label")}
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
                            {/* <Select
                                placeholder={t("teachers.filters.year.label")}
                                className="w-40"
                                value={yearFilter}
                                onChange={setYearFilter}
                            >
                                {yearOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select> */}
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setStatusFilter("all");
                                }}
                            >
                                {t("teachers.clearFilters")}
                            </Button>
                        </Space>
                    </div>
                </Card>
            </motion.div>

            {/* Onglets et tableau */}
            <motion.div variants={{ item }}>
                <Card className="rounded-2xl shadow-sm border-0">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,

                        }}
                        scroll={{ x: true }}
                        rowClassName="hover:bg-gray-50"
                    />

                </Card>
            </motion.div>

            <Modal
                footer={null}
                title={
                    selectedStudent
                        ? t("teachers.modal.editTitle")
                        : t("teachers.modal.addTitle")
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
                <AddNewTeacher handleModalCancel={handleModalCancel} />

            </Modal>

            <DetailsTeacher
                teacher={selectedTeacher}
                visible={detailsVisible}
                onClose={handleCloseDetails}
            />
        </motion.div>
    );
};

export default TeacherView;


