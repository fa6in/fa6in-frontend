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
} from "antd";
import { VscError } from "react-icons/vsc";
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    TeamOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";
import type { Student } from "../../../Services/Admin/Student/typeStudent";


import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AddNewStudent from "./AddNewStudent";
import { useGetStudents } from "../../../Services/Admin/Student/useGetStudents";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import { FcViewDetails } from "react-icons/fc";
import DetailsStudent from "./DetailsStudent";
import AuthService from "../../../Auth-service/AuthService";

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
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

        const post = AuthService.getRole()

    // Ajoutez cette fonction pour gérer l'ouverture du modal
    const handleViewStudent = (record: any) => {
        setSelectedStudent(record);
        setIsDetailsModalVisible(true);
    };
    // const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const { data: getStudent, isPending } = useGetStudents()

    const isRTL = i18n.language === "ar";

    const statusOptions = [
        { value: "all", label: t("students.filters.status.all") },
        { value: "true", label: t("students.filters.status.active") },
        { value: "false", label: t("students.filters.status.inactive") },
        { value: "pending", label: t("students.filters.status.pending") }
    ];

    const yearOptions = [
        { value: "all", label: t("students.filters.year.all") },
        { value: "1st", label: t("students.filters.year.first") },
        { value: "2nd", label: t("students.filters.year.second") },
        { value: "3rd", label: t("students.filters.year.third") },
        { value: "4th", label: t("students.filters.year.fourth") }
    ];

    const columns: ColumnsType<Student> = [
        {
            title: t("students2.table.id"),
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
        },

        {
            title: t("students.table.student"),
            key: "student",
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <div>
                        <div className="font-semibold text-gray-900">
                            {record.user.first_name} {record.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {record.user.email}
                        </div>
                    </div>
                </div>
            ),
        },

        {
            title: t("students2.table.phone"),
            key: "phone",
            render: (_, record) => record.user.phone_number,
        },

        {
            title: t("students2.table.grade"),
            key: "grade",
            render: (_, record) => (
                <Tag color="blue" className="rounded-full px-3">
                    {record.user.grade}
                </Tag>
            ),
            sorter: (a, b) => a.user.grade - b.user.grade,
        },

        {
            title: t("students2.table.school"),
            key: "school",
            render: (_, record) => record.user.school,
        },

        {
            title: t("students.table.status"),
            key: "status",
            render: (_, record) => (
                <Badge
                    status={record.user.is_active ? "success" : "error"}
                    text={
                        record.user.is_active
                            ? t("students.status.active")
                            : t("students.status.inactive")
                    }
                />
            ),
            filters: [
                { text: t("students.status.active"), value: true },
                { text: t("students.status.inactive"), value: false },
            ],
            onFilter: (value, record) => record.user.is_active === value,
        },

        {
            title: t("students2.table.enrollmentDate"),
            dataIndex: "enrollment_date",
            key: "enrollment_date",
            sorter: (a, b) =>
                new Date(a.enrollment_date).getTime() -
                new Date(b.enrollment_date).getTime(),
        },

        {
            title: t("students.table.actions"),
            key: "actions",
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<FcViewDetails />}
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleViewStudent(record)}
                >
                    {t("students.actions.view")}
                </Button>
            ),
        },
    ];


    // Statistiques
    const stats = [
        {
            key: "total",
            title: t("students.stats.total"),
            value: getStudent?.count!,
            icon: <TeamOutlined />,
            color: "from-blue-500 to-blue-600",
            change: "+12.5%",
        },
        {
            key: "active",
            title: t("students.stats.active"),
            // value: getStudent ? getStudent?.results.filter((student) => student.user.is_active === true).length! : 0,
            value: getStudent?.results
                ?.filter(student => student?.user?.is_active)
                .length ?? 0,
            icon: <CheckCircleOutlined />,
            color: "from-green-500 to-green-600",
            change: "+8.2%",
        },
        {
            key: "new",
            title: t("students.stats.no_active"),
            value: getStudent?.results
                ?.filter(student => student.user?.is_active === false)
                .length ?? 0,
            icon: <VscError />,
            color: "text-white bg-red-500 font-bold",
            change: "+15.3%",
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
    const filteredData = getStudent?.results?.filter((student) => {
        const matchesSearch = student?.user?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            student?.user?.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            student?.user?.phone_number?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === "all" || String(student?.user?.is_active) === statusFilter;
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
                            {t("students.title")}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t("students.subtitle")}
                        </p>
                    </div>
                    {post === "admin" && (
                        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>

                        <Button
                            icon={<PlusOutlined />}
                            className="flex items-center !bg-main-color !text-white"
                            onClick={handleAddStudent}
                        >
                            {t("students.addStudent")}
                        </Button>
                    </div>
                    )}
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
                        rowKey="id"
                        loading={isPending}
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        scroll={{ x: true }}
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
                closeIcon={false}
            >
                <AddNewStudent handleModalCancel={handleModalCancel} />

            </Modal>



            <DetailsStudent
                student={selectedStudent}
                visible={isDetailsModalVisible}
                onClose={() => setIsDetailsModalVisible(false)}
            />

        </motion.div>
    );
};

export default StudentView;

