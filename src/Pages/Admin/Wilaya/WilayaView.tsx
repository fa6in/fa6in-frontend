import { useState } from "react";
import { Table, Button, Input, Modal, Form, InputNumber, Space, Popconfirm } from "antd";
import {
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../../../ui/PageShell";
import PageToolbar from "../../../ui/PageToolbar";
import DataPanel from "../../../ui/DataPanel";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import { useGetWilaya, type WilayaTYpe } from "../../../Services/Admin/Student/useGetWilaya";
import { useCreateWilaya } from "../../../Services/Admin/Student/useCreateWilaya";
import { useUpdateWilaya } from "../../../Services/Admin/Student/useUpdateWilaya";
import { useDeleteWilaya } from "../../../Services/Admin/Student/useDeleteWilaya";

export default function WilayaView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WilayaTYpe | null>(null);
  const [form] = Form.useForm();

  const { data: wilayas = [], isPending, refetch } = useGetWilaya();
  const { mutateAsync: createWilaya, isPending: creating } = useCreateWilaya();
  const { mutateAsync: updateWilaya, isPending: updating } = useUpdateWilaya();
  const { mutateAsync: deleteWilaya, isPending: deleting } = useDeleteWilaya();

  const filtered = wilayas.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.name?.toLowerCase().includes(q) ||
      String(w.code ?? "").toLowerCase().includes(q)
    );
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: WilayaTYpe) => {
    setEditing(record);
    form.setFieldsValue({ code: record.code, name: record.name });
    setOpen(true);
  };

  const isDuplicateCode = (code: number) =>
    wilayas.some(
      (w) => Number(w.code) === Number(code) && w.id !== editing?.id
    );

  const isDuplicateName = (name: string) => {
    const normalized = name.trim().toLowerCase();
    return wilayas.some(
      (w) => w.name?.trim().toLowerCase() === normalized && w.id !== editing?.id
    );
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      const payload = { code: Number(values.code), name: String(values.name).trim() };
      try {
        if (editing?.id != null) {
          await updateWilaya({ id: editing.id, ...payload });
        } else {
          await createWilaya(payload);
        }
        await refetch();
        closeModal();
      } catch {
        // error toast is handled by the mutation
      }
    });
  };

  const columns: ColumnsType<WilayaTYpe> = [
    { title: t("wilaya.table.code"), dataIndex: "code", key: "code", width: 120 },
    { title: t("wilaya.table.name"), dataIndex: "name", key: "name" },
    {
      title: t("common.actions"),
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title={t("common.confirm_delete")}
            onConfirm={async () => {
              if (record.id == null) return;
              try {
                await deleteWilaya(record.id);
                await refetch();
              } catch {
                // error toast is handled by the mutation
              }
            }}
            okText={t("common.yes")}
            cancelText={t("common.no")}
          >
            <Button type="text" danger icon={<DeleteOutlined />} loading={deleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isPending) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("wilaya.title")}
      subtitle={t("wilaya.subtitle")}
      icon={<EnvironmentOutlined className="text-2xl" />}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="border-0 bg-white text-main-color hover:!bg-white/90"
        >
          {t("wilaya.add")}
        </Button>
      }
    >
      <PageToolbar
        search={
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            size="large"
          />
        }
      />

      <DataPanel title={t("wilaya.list")}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 12 }}
        />
      </DataPanel>

      <Modal
        title={editing ? t("wilaya.edit") : t("wilaya.add")}
        open={open}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label={t("wilaya.table.code")}
            validateTrigger="onChange"
            rules={[
              { required: true, message: t("common.required") },
              {
                validator: (_, value) => {
                  if (value == null || value === "") return Promise.resolve();
                  if (isDuplicateCode(Number(value))) {
                    return Promise.reject(new Error(t("wilaya.duplicate_code")));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className="w-full" min={0} size="large" />
          </Form.Item>
          <Form.Item
            name="name"
            label={t("wilaya.table.name")}
            validateTrigger="onChange"
            rules={[
              { required: true, message: t("common.required") },
              {
                validator: (_, value) => {
                  if (!value || !String(value).trim()) return Promise.resolve();
                  if (isDuplicateName(String(value))) {
                    return Promise.reject(new Error(t("wilaya.duplicate_name")));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
