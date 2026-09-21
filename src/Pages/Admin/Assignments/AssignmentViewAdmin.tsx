import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  BlockOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import RelationSelect, {
  getRelationLabel,
  normalizeRelationId,
  toRelationItems,
} from "../../../ui/RelationSelect";
import { useGetSkills } from "../../../Services/Skills/useGetSkills";
import type { Chunk } from "../../../Services/Skills/typeSkill";
import { useGetChunks } from "../../../Services/Skills/useGetChunks";
import { useAddChunk } from "../../../Services/Skills/useAddChunk";
import { useUpdateChunk } from "../../../Services/Skills/useUpdateChunk";
import { useDeleteChunk } from "../../../Services/Skills/useDeleteChunk";

export default function SkillsView() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: skills = [], isPending: loadingSkills } = useGetSkills();
  const { data: chunks = [], isPending: loadingChunks } = useGetChunks();

  const skillOptions = useMemo(
    () => toRelationItems(skills, (s) => s.name, (s) => s.code),
    [skills]
  );

  const { mutate: addChunk, isPending: savingChunk } = useAddChunk();
  const { mutate: updateChunk, isPending: updatingChunk } = useUpdateChunk();
  const { mutate: deleteChunk, isPending: deletingChunk } = useDeleteChunk();

  const handleSubmit = (values: Record<string, unknown>) => {
    const onDone = () => {
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
    };
    const chunkValues = {
      ...values,
      skill: normalizeRelationId(values.skill),
    };
    if (editingId) updateChunk({ ...chunkValues, id: editingId } as Chunk, { onSuccess: onDone });
    else addChunk(chunkValues as Chunk, { onSuccess: onDone });
  };

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Chunk) => {
    setEditingId(record.id ?? null);
    const values: Record<string, unknown> = { ...record };
    values.skill = normalizeRelationId(values.skill);
    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const chunkColumns: ColumnsType<Chunk> = [
    { title: "Code", dataIndex: "code", key: "code" },
    { title: t("skills.chunk_title"), dataIndex: "title", key: "title" },
    { title: t("skills.type"), dataIndex: "chunk_type", key: "chunk_type", render: (v) => <Tag color="purple">{v}</Tag> },
    { title: t("skills.difficulty"), dataIndex: "difficulty", key: "difficulty" },
    {
      title: t("skills.skill"),
      dataIndex: "skill",
      key: "skill",
      render: (v) => getRelationLabel(skillOptions, normalizeRelationId(v)),
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: unknown, record: Chunk) => (
        <Space>
          <Button aria-label={t("common.edit")} icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title={t("common.confirm_delete")} onConfirm={() => record.id && deleteChunk(record.id)}>
            <Button aria-label={t("common.delete")} icon={<DeleteOutlined />} size="small" danger loading={deletingChunk} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loadingSkills || loadingChunks) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("skills.title_page")}
      subtitle={t("skills.subtitle")}
      icon={<BlockOutlined className="text-2xl" />}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="border-0 bg-white text-main-color hover:!bg-white/90">
          {t("common.add")}
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <StatCard title={t("skills.chunks")} value={chunks.length} icon={<BlockOutlined />} color="#f89b22" />
        </Col>
      </Row>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Table rowKey="id" columns={chunkColumns} dataSource={chunks} pagination={{ pageSize: 8 }} />
      </motion.div>

      <Modal title={editingId ? t("common.edit") : t("common.add")} open={modalOpen} onCancel={() => { setModalOpen(false); setEditingId(null); }} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="title" label={t("skills.chunk_title")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="skill" label={t("skills.skill")} rules={[{ required: true }]}>
            <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.skill")} />
          </Form.Item>
          <Form.Item name="chunk_type" label={t("skills.type")} rules={[{ required: true }]}>
            <Select
              options={[
                { value: "rule", label: t("skills.chunkTypes.rule") },
                { value: "example", label: t("skills.chunkTypes.example") },
                { value: "practice", label: t("skills.chunkTypes.practice") },
                { value: "error", label: t("skills.chunkTypes.error") },
                { value: "hint", label: t("skills.chunkTypes.hint") },
                { value: "real_life", label: t("skills.chunkTypes.realLife") },
              ]}
            />
          </Form.Item>
          <Form.Item name="difficulty" label={t("skills.difficulty")} rules={[{ required: true }]}><InputNumber className="w-full" min={1} max={5} /></Form.Item>
          <Form.Item name="content" label={t("curriculum.content")} rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="order_index" label={t("curriculum.order")}><InputNumber className="w-full" min={1} /></Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={savingChunk || updatingChunk}>{t("common.save")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
