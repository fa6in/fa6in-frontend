import { useState } from "react";
import {
    Table,
    Button,
    Tag,
    Input,
    Select,
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

import { useTranslation } from "react-i18next";
import AddNewStudent from "./AddNewStudent";
import { useGetStudents } from "../../../Services/Admin/Student/useGetStudents";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import PageToolbar from "../../../ui/PageToolbar";
import DataPanel from "../../../ui/DataPanel";
import { FcViewDetails } from "react-icons/fc";
import DetailsStudent from "./DetailsStudent";
import AuthService from "../../../Auth-service/AuthService";

const { Option } = Select;

const StudentView = () => {
    const { t, i18n } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

    const post = AuthService.getRole()

    const handleViewStudent = (record: any) => {
        setSelectedStudent(record);
        setIsDetailsModalVisible(true);
    };
    const [form] = Form.useForm();

    const { data: getStudent, isPending } = useGetStudents()

    console.log("getStudent", getStudent);

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

    // Backend has no `grade` field. Falling back to student_profile.level,
    // which is the closest equivalent — confirm with backend if `grade`
    // is meant to exist as its own field.
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
                            {record.first_name} {record.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },

        {
            title: t("students2.table.phone"),
            key: "phone",
            render: (_, record) => record.phone_number || "-",
        },

        {
            title: t("students2.table.grade"),
            key: "grade",
            render: (_, record) => (
                <Tag color="blue" className="rounded-full px-3">
                    {record.student_profile?.level ?? "-"}
                </Tag>
            ),
            sorter: (a, b) =>
                (a.student_profile?.level ?? 0) - (b.student_profile?.level ?? 0),
        },

        {
            title: t("students2.table.school"),
            key: "school",
            render: (_, record) => record.school || "-",
        },

        {
            title: t("students.table.status"),
            key: "status",
            render: (_, record) => (
                <Badge
                    status={record.is_active ? "success" : "error"}
                    text={
                        record.is_active
                            ? t("students.status.active")
                            : t("students.status.inactive")
                    }
                />
            ),
            filters: [
                { text: t("students.status.active"), value: true },
                { text: t("students.status.inactive"), value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
        },

        {
            title: t("students2.table.enrollmentDate"),
            key: "enrollment_date",
            render: (_, record) => record.student_profile?.enrollment_date ?? "-",
            sorter: (a, b) =>
                new Date(a.student_profile?.enrollment_date ?? 0).getTime() -
                new Date(b.student_profile?.enrollment_date ?? 0).getTime(),
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
            value: getStudent?.results
                ?.filter(student => student?.is_active)
                .length ?? 0,
            icon: <CheckCircleOutlined />,
            color: "from-green-500 to-green-600",
            change: "+8.2%",
        },
        {
            key: "new",
            title: t("students.stats.no_active"),
            value: getStudent?.results
                ?.filter(student => student.is_active === false)
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
        const matchesSearch =
            student?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            student?.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            student?.phone_number?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === "all" || String(student?.is_active) === statusFilter;
        // const matchesYear = yearFilter === "all" || student.year.includes(yearFilter);

        return matchesSearch && matchesStatus;
    });

    if (isPending) {
        return <SpinnerLoader />
    }

    return (
        <PageShell
            title={t("students.title")}
            subtitle={t("students.subtitle")}
            icon={<TeamOutlined />}
            extra={
                post === "admin" ? (
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleAddStudent}
                    >
                        {t("students.addStudent")}
                    </Button>
                ) : undefined
            }
        >
            <div dir={isRTL ? "rtl" : "ltr"}>
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.key}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            trend={stat.change}
                            color={
                                stat.key === "total"
                                    ? "#2563eb"
                                    : stat.key === "active"
                                      ? "#17ab5b"
                                      : "#ef4444"
                            }
                        />
                    ))}
                </div>

                <PageToolbar
                    search={
                        <Input
                            placeholder={t("students.searchPlaceholder")}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    }
                    filters={
                        <>
                            <Select
                                placeholder={t("students.filters.status.label")}
                                className="w-40"
                                size="large"
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
                                size="large"
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
                                size="large"
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setStatusFilter("all");
                                    setYearFilter("all");
                                }}
                            >
                                {t("students.clearFilters")}
                            </Button>
                        </>
                    }
                />

                <DataPanel loading={isPending}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        scroll={{ x: true }}
                        pagination={{
                            pageSize: 10,
                            responsive: true,
                            showSizeChanger: true,
                        }}
                    />
                </DataPanel>

                {/* Modal d'ajout/édition d'étudiant */}
                <Modal
                    footer={null}
                    title={
                        selectedStudent
                            ? t("students.modal.editTitle")
                            : t("students.modal.addTitle")
                    }
                    open={isModalVisible}
                    onCancel={handleModalCancel}
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
            </div>
        </PageShell>
    );
};

export default StudentView;
