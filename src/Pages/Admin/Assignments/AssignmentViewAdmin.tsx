import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
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

  // On observe le type de chunk sélectionné pour afficher les bons champs
  const chunkType = Form.useWatch("chunk_type", form);
  const practiceMode = Form.useWatch("practice_mode", form);
  const isPractice = chunkType === "practice";
  const isMcq = practiceMode === "mcq";

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

    const base = {
      code: values.code,
      title: values.title,
      skill: normalizeRelationId(values.skill),
      chunk_type: values.chunk_type,
      difficulty: values.difficulty,
      content: values.content,
      order_index: values.order_index,
      points: values.points ?? 0,
    };

    let chunkValues: Record<string, unknown>;

    if (values.chunk_type === "practice") {
      chunkValues = {
        ...base,
        correct_answer: values.correct_answer,
        options: values.practice_mode === "mcq" ? values.options ?? [] : [],
        time_limit: values.time_limit,
      };
    } else {
      // rule, example, error, hint, real_life => pas de champs practice
      chunkValues = base;
    }

    if (editingId) updateChunk({ ...chunkValues, id: editingId } as Chunk, { onSuccess: onDone });
    else addChunk(chunkValues as Chunk, { onSuccess: onDone });
  };

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ points: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Chunk) => {
    setEditingId(record.id ?? null);
    const values: Record<string, unknown> = { ...record };
    values.skill = normalizeRelationId(values.skill);

    // Déduire le mode practice (QCM / libre) à partir des options existantes
    if (record.chunk_type === "practice") {
      const opts = (record as { options?: string[] }).options;
      values.practice_mode = opts && opts.length > 0 ? "mcq" : "free";
    }

    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const chunkColumns: ColumnsType<Chunk> = [
    { title: "Code", dataIndex: "code", key: "code" },
    { title: t("skills.chunk_title"), dataIndex: "title", key: "title" },
    { title: t("skills.type"), dataIndex: "chunk_type", key: "chunk_type", render: (v) => <Tag color="purple">{v}</Tag> },
    { title: t("skills.difficulty"), dataIndex: "difficulty", key: "difficulty" },
    { title: t("skills.points"), dataIndex: "points", key: "points" },
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

      <Modal
        title={editingId ? t("common.edit") : t("common.add")}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingId(null); }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="title" label={t("skills.chunk_title")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="skill" label={t("skills.skill")} rules={[{ required: true }]}>
            <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.skill")} />
          </Form.Item>

          <Form.Item name="chunk_type" label={t("skills.type")} rules={[{ required: true }]}>
            <Select
              onChange={() => {
                // Reset des champs practice quand on change de type
                form.setFieldsValue({
                  practice_mode: undefined,
                  correct_answer: undefined,
                  options: [],
                  time_limit: undefined,
                });
              }}
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

          <Form.Item name="difficulty" label={t("skills.difficulty")} rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} max={5} />
          </Form.Item>

          <Form.Item name="content" label={t("curriculum.content")} rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* --- Champs spécifiques au type "practice" --- */}
          {isPractice && (
            <>
              <Form.Item
                name="practice_mode"
                label={t("skills.practiceMode")}
                rules={[{ required: true }]}
                initialValue="free"
              >
                <Radio.Group
                  onChange={(e) => {
                    if (e.target.value === "free") {
                      form.setFieldsValue({ options: [] });
                    }
                  }}
                >
                  <Radio value="free">{t("skills.practiceModes.free")}</Radio>
                  <Radio value="mcq">{t("skills.practiceModes.mcq")}</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="correct_answer"
                label={t("skills.correctAnswer")}
                rules={[{ required: true }]}
              >
                <Input placeholder={t("skills.placeholders.correctAnswer")} />
              </Form.Item>

              {isMcq && (
                <Form.Item
                  name="options"
                  label={t("skills.options")}
                  tooltip={t("skills.optionsHint")}
                  rules={[
                    {
                      validator: (_, value) =>
                        Array.isArray(value) && value.length >= 2
                          ? Promise.resolve()
                          : Promise.reject(new Error(t("skills.optionsMinError"))),
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder={t("skills.placeholders.options")}
                    tokenSeparators={[","]}
                    open={false}
                  />
                </Form.Item>
              )}

              <Form.Item
                name="time_limit"
                label={t("skills.timeLimit")}
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full" min={5} step={5} addonAfter="sec" />
              </Form.Item>
            </>
          )}

          <Form.Item name="points" label={t("skills.points")} initialValue={0}>
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item name="order_index" label={t("curriculum.order")}>
            <InputNumber className="w-full" min={1} />
          </Form.Item>

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
