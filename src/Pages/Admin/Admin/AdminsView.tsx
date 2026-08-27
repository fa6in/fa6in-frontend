import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import { useGetUsers } from "../../../Services/Auth/useGetUsers";
import type { UserListItem } from "../../../Services/Auth/useGetUsers";

export default function AdminsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: admins = [], isPending } = useGetUsers({ role: "admin" });

  const filtered = admins.filter(
    (a) =>
      a.username?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnsType<UserListItem> = [
    {
      title: t("admins.table.user"),
      key: "user",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-main-color" />
          <div>
            <div className="font-medium">{r.first_name} {r.last_name}</div>
            <div className="text-xs text-gray-400">@{r.username}</div>
          </div>
        </div>
      ),
    },
    { title: t("admins.table.email"), dataIndex: "email", key: "email" },
    {
      title: t("admins.table.role"),
      dataIndex: "role",
      key: "role",
      render: (v) => <Tag icon={<SafetyCertificateOutlined />} color="green">{v}</Tag>,
    },
    {
      title: t("admins.table.status"),
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => (
        <Tag color={v !== false ? "success" : "default"}>
          {v !== false ? t("common.active") : t("common.inactive")}
        </Tag>
      ),
    },
  ];

  if (isPending) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("admins.title")}
      subtitle={t("admins.subtitle")}
      icon={<TeamOutlined className="text-2xl" />}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admins/add")}
          className="border-0 bg-white text-main-color hover:!bg-white/90"
        >
          {t("admins.add")}
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <StatCard title={t("admins.total")} value={admins.length} icon={<TeamOutlined />} />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            title={t("common.active")}
            value={admins.filter((a) => a.is_active !== false).length}
            icon={<SafetyCertificateOutlined />}
            color="#3f51b5"
          />
        </Col>
      </Row>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="max-w-md"
            size="large"
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          className="rounded-xl shadow-sm"
        />
      </motion.div>
    </PageShell>
  );
}
