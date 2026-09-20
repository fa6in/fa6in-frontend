import { useState, useMemo } from "react";
import {
    Table,
    Button,
    Tag,
    Input,
    Select,
    Modal,
    Badge,
    Dropdown,
    type MenuProps,
    message,
    Divider,
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    BookOutlined,
    CheckCircleOutlined,
    MoreOutlined,
    BarChartOutlined,
    WarningFilled,
    DeleteOutlined,
    EditOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import AddNewMatiere from "./AddNewMatiere";
import { getMatiereLevelId, getMatiereLevelName } from "../../../Services/Admin/Matieres/typeMatiere";
import type { typeMatiere } from "../../../Services/Admin/Matieres/typeMatiere";
import { useGetLevels } from "../../../Services/Curriculum/Levels/useGetLevels";
import { usedeleteMatiere } from "../../../Services/Admin/Matieres/useDeleteMatiere";
import UpdateMatiere from "./UpdateMatiere";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import AuthService from "../../../Auth-service/AuthService";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import PageToolbar from "../../../ui/PageToolbar";
import DataPanel from "../../../ui/DataPanel";

const { Option } = Select;

const MatiereView = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const [searchText, setSearchText] = useState("");
    const [levelFilter, setLevelFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [popupState, setPopupState] = useState<{ open: boolean; matiere: typeMatiere | null; type: string | null }>({
        open: false,
        matiere: null,
        type: null,
    });
    const post = AuthService.getRole()

    const showPopup = (matiere: typeMatiere, type: string) => {
        setPopupState({ open: true, matiere, type });
    };

    const closePopup = () => {
        setPopupState({ open: false, matiere: null, type: null });

    };
    const { data: levels = [] } = useGetLevels();
    const apiFilters = useMemo(() => ({
        ...(levelFilter !== "all" ? { level: Number(levelFilter) } : {}),
        ...(statusFilter !== "all" ? { is_active: statusFilter === "active" } : {}),
    }), [levelFilter, statusFilter]);
    const { data: matieresData, isPending } = useGetMatiere(apiFilters)
    const matieres = Array.isArray(matieresData)
        ? matieresData
        : Array.isArray(matieresData)
            ? matieresData
            : [];
    const { mutate: deleteMatiere, isPending: isPendingDelete } = usedeleteMatiere()

    const stats = [
        {
            key: "total",
            title: t("matieres.stats.total"),
            value: matieres.length,
            icon: <BookOutlined />,
            color: "from-blue-500 to-blue-600"
        },
        {
            key: "active",
            title: t("matieres.stats.active"),
            value: matieres.filter(m => m?.is_active === true).length,
            icon: <CheckCircleOutlined />,
            color: "from-green-500 to-green-600"
        },
        {
            key: "inactive",
            title: t("matieres.stats.inactive"),
            value: matieres.filter(m => m?.is_active === false).length,
            icon: <WarningFilled />,
            color: "from-red-500 to-red-600"
        },
        {
            key: "credits",
            title: t("matieres.stats.credits"),
            value: matieres.reduce((acc, curr) => acc + (curr?.unit_count || 0), 0),
            icon: <BarChartOutlined />,
            color: "from-orange-500 to-orange-600"
        }
    ];



    const handleDeleteMatiere = () => {
        if (popupState.matiere?.id) {
            deleteMatiere({ id: popupState.matiere.id }, {
                onSuccess: () => {
                    message.success("Matiere supprimée avec succès");
                    closePopup();
                }
            });

        }
    }

    const generateItems = (matiere: typeMatiere): MenuProps["items"] => [
        {
            key: '1',
            label: t("matieres.modal.editTitle"),
            icon: <EditOutlined />,
            onClick: () => showPopup(matiere, "update"),

        },
        {
            key: '2',
            label: t("matieres.modal.supprimer"),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => showPopup(matiere, "delete"),

        },
    ];

    const columns = post === "admin" ? [
        {
            title: t("matieres.table.code"),
            dataIndex: "id",
            key: "id",

            render: (_: any, record: any) => (
                <div className="font-medium text-gray-700">
                    {record?.id}
                </div>
            ),
            sorter: (a: any, b: any) => a.id - b.id
        },
        {
            title: t("matieres.table.matiere"),
            key: "matiere",
            dataIndex: "name"
        },
        {
            title: t("matieres.table.semester"),
            dataIndex: "level",
            key: "semester",
            sorter: (a: typeMatiere, b: typeMatiere) => (getMatiereLevelId(a.level) ?? 0) - (getMatiereLevelId(b.level) ?? 0),
            render: (level: typeMatiere["level"], record: typeMatiere) => (
                <Tag
                    color={getMatiereLevelId(level) === 1 ? "blue" : getMatiereLevelId(level) === 2 ? "green" : "orange"}
                    className="rounded-full px-3 py-1"
                >
                    {getMatiereLevelName(level, record.level_name)}

                </Tag>
            )
        },
        {
            title: t("matieres.table.description"),
            dataIndex: "description",
            key: "description"
        },
        {
            title: t("matieres.table.status"),
            dataIndex: "is_active",
            key: "status",
            render: (isActive: boolean) => (
                <Badge
                    status={isActive ? "success" : "error"}
                    text={
                        <span className={isActive ? "text-green-600" : "text-red-600"}>
                            {isActive ? t("matieres.status.active") : t("matieres.status.inactive")}
                        </span>
                    }
                />
            ),
            filters: [
                { text: t("matieres.status.active"), value: true },
                { text: t("matieres.status.inactive"), value: false }
            ],
            onFilter: (value: any, record: any) => record.is_active === value
        },
        {
            title: t("matieres.table.actions"),
            key: "actions",
            render: (__: any, record: typeMatiere) => (
                <Dropdown className="bg-main-color! text-white! shadow-2xl rounded-3xl" menu={{ items: generateItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm border-0"
                    />
                </Dropdown>
            )
        }
    ] : [
        {
            title: t("matieres.table.code"),
            dataIndex: "id",
            key: "id",

            render: (_: any, record: any) => (
                <div className="font-medium text-gray-700">
                    {record?.id}
                </div>
            ),
            sorter: (a: any, b: any) => a.id - b.id
        },
        {
            title: t("matieres.table.matiere"),
            key: "matiere",
            dataIndex: "name"
        },
        {
            title: t("matieres.table.semester"),
            dataIndex: "level",
            key: "semester",
            sorter: (a: typeMatiere, b: typeMatiere) => (getMatiereLevelId(a.level) ?? 0) - (getMatiereLevelId(b.level) ?? 0),
            render: (level: typeMatiere["level"], record: typeMatiere) => (
                <Tag
                    color={getMatiereLevelId(level) === 1 ? "blue" : getMatiereLevelId(level) === 2 ? "green" : "orange"}
                    className="rounded-full px-3 py-1"
                >
                    {getMatiereLevelName(level, record.level_name)}

                </Tag>
            )
        },
        {
            title: t("matieres.table.description"),
            dataIndex: "description",
            key: "description"
        },
        {
            title: t("matieres.table.status"),
            dataIndex: "is_active",
            key: "status",
            render: (isActive: boolean) => (
                <Badge
                    status={isActive ? "success" : "error"}
                    text={
                        <span className={isActive ? "text-green-600" : "text-red-600"}>
                            {isActive ? t("matieres.status.active") : t("matieres.status.inactive")}
                        </span>
                    }
                />
            ),
            filters: [
                { text: t("matieres.status.active"), value: true },
                { text: t("matieres.status.inactive"), value: false }
            ],
            onFilter: (value: any, record: any) => record.is_active === value
        }
    ];

    const filteredMatieres = matieres.filter(matiere => {
        const matchesSearch =
            matiere?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
            matiere?.description?.toLowerCase()?.includes(searchText.toLowerCase());

        const matchesSemester =
            levelFilter === "all" ||
            getMatiereLevelId(matiere?.level)?.toString() === levelFilter;

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && matiere?.is_active) ||
            (statusFilter === "inactive" && !matiere?.is_active);

        return matchesSearch && matchesSemester && matchesStatus;
    });


    if (isPending) {
        return <SpinnerLoader />
    }
    return (
        <PageShell
            title={t("matieres.title")}
            subtitle={t("matieres.subtitle")}
            icon={<BookOutlined />}
            extra={
                post === "admin" ? (
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        {t("matieres.add")}
                    </Button>
                ) : undefined
            }
        >
            <div dir={isRTL ? "rtl" : "ltr"}>
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats?.map((stat) => (
                        <StatCard
                            key={stat.key}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={
                                stat.key === "total"
                                    ? "#2563eb"
                                    : stat.key === "active"
                                      ? "#17ab5b"
                                      : stat.key === "inactive"
                                        ? "#ef4444"
                                        : "#f89b22"
                            }
                        />
                    ))}
                </div>

                <PageToolbar
                    search={
                        <Input
                            placeholder={t("matieres.search")}
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                        />
                    }
                    filters={
                        <>
                            <Select
                                value={levelFilter}
                                onChange={setLevelFilter}
                                className="w-48"
                                size="large"
                                showSearch
                                optionFilterProp="label"
                                placeholder={t("matieresAdd.form.gradePlaceholder")}
                            >
                                <Option value="all">{t("matieres.filters.all")}</Option>
                                {levels.map((level) => (
                                    <Option key={level.id} value={String(level.id)} label={`${level.code} ${level.name}`}>
                                        {level.code} - {level.name}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="w-36"
                                size="large"
                            >
                                <Option value="all">{t("matieres.filters.all")}</Option>
                                <Option value="active">{t("matieres.filters.active")}</Option>
                                <Option value="inactive">{t("matieres.filters.inactive")}</Option>
                            </Select>
                            <Button
                                size="large"
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setLevelFilter("all");
                                    setStatusFilter("all");
                                }}
                            >
                                {t("matieres.filters.reset")}
                            </Button>
                        </>
                    }
                />

                <DataPanel loading={isPending}>
                    <Table
                        columns={columns}
                        dataSource={filteredMatieres}
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        scroll={{ x: true }}
                        rowClassName="hover:bg-[#f6faf7]"
                    />
                </DataPanel>
            </div>

            {/* Modal */}
            <Modal
                open={isModalVisible}
                footer={null}
                title={t("matieres.modal.addTitle")}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                maskClosable={false}
                closeIcon={false}
            >
                <AddNewMatiere onCancel={() => setIsModalVisible(false)} />
            </Modal>

            <Modal
                open={popupState.open && popupState.type === "update"}
                footer={null}
                title={t("matieres.modal.editTitle")}
                // onCancel={closePopup}
                width={600}
                maskClosable={false}
                closeIcon={false}

            >
                <UpdateMatiere onCancel={closePopup} matiere={popupState?.matiere!} />
            </Modal>

            <Modal
                className="rounded-2xl overflow-hidden"
                onCancel={closePopup}
                open={popupState.open && popupState.type === "delete"}
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
                <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="p-2">
                    {/* Icone d'avertissement */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <ExclamationCircleOutlined className="text-red-500 text-3xl" />
                        </div>
                    </div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                        {t("matieres.delete.title")}
                    </h3>

                    {/* Message de confirmation */}
                    <p className="text-gray-600 text-center mb-6 text-[15px] leading-relaxed">
                        {t("matieres.delete.message")}
                        <span className="font-semibold text-gray-900 block mt-1">
                            {popupState?.matiere?.name || t("matieres.delete.thisItem")}
                        </span>
                    </p>

                    {/* Détails supplémentaires (optionnel) */}
                    {popupState.type === "delete" && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                            <div className="flex items-center space-x-3 gap-5">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: popupState?.matiere?.color! || "#2196F3" }}
                                >
                                    <span className="text-white font-medium">
                                        {popupState?.matiere!.name?.charAt(0)}
                                    </span>
                                </div>
                                <div className="">
                                    <p className="font-medium text-gray-900">{popupState?.matiere!.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("matieres.grades.grade")} {getMatiereLevelId(popupState?.matiere!.level) ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ligne de séparation */}
                    <Divider className="my-4" />

                    {/* Boutons d'action */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            size="large"
                            onClick={closePopup}
                            className="min-w-[120px] h-11  !text-main-color !border-main-color hover:border-gray-400 hover:text-gray-800 transition-all"
                        >
                            {t("common1.cancel")}
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            danger
                            loading={isPendingDelete}
                            onClick={handleDeleteMatiere}
                            className="min-w-[140px] h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-none shadow-md hover:shadow-lg transition-all"
                            icon={<DeleteOutlined />}
                        >
                            {t("matieres.common1.confirm")}
                        </Button>
                    </div>

                    {/* Message d'avertissement */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        <InfoCircleOutlined className="mr-1" />
                        {t("matieres.delete.warning")}
                    </p>
                </div>
            </Modal>
        </PageShell>
    );
};

export default MatiereView;



