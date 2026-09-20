import { useState, useMemo } from "react";
import {
  Tabs,
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
  BulbOutlined,
  PlusOutlined,
  LinkOutlined,
  BlockOutlined,
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
import { useAddSkill } from "../../../Services/Skills/useAddSkill";
import type { Skill, Prerequisite, Chunk } from "../../../Services/Skills/typeSkill";
import { useGetPrerequisites } from "../../../Services/Skills/useGetPrerequisites";
import { useAddPrerequisite } from "../../../Services/Skills/useAddPrerequisite";
import { useGetChunks } from "../../../Services/Skills/useGetChunks";
import { useAddChunk } from "../../../Services/Skills/useAddChunk";
import { useUpdateSkill } from "../../../Services/Skills/useUpdateSkill";
import { useDeleteSkill } from "../../../Services/Skills/useDeleteSkill";
import { useUpdatePrerequisite } from "../../../Services/Skills/useUpdatePrerequisite";
import { useDeletePrerequisite } from "../../../Services/Skills/useDeletePrerequisite";
import { useUpdateChunk } from "../../../Services/Skills/useUpdateChunk";
import { useDeleteChunk } from "../../../Services/Skills/useDeleteChunk";
import { useGetGoals } from "../../../Services/Curriculum/Goals/useGetGoals";
import type { GoalType } from "../../../Services/Curriculum/Goals/typeGoal";

export default function SkillsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("skills");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedPrerequisiteSkill, setSelectedPrerequisiteSkill] = useState<number | undefined>();
  const [form] = Form.useForm();

  const { data: skills = [], isPending: loadingSkills } = useGetSkills();
  const { data: prerequisites = [], isPending: loadingPrereq } = useGetPrerequisites();
  const { data: chunks = [], isPending: loadingChunks } = useGetChunks();
  const { data: goals = [], isPending: loadingGoals } = useGetGoals();

  const goalOptions = useMemo(
    () => toRelationItems(goals, (g) => g.title, (g) => g.code),
    [goals]
  );
  const skillOptions = useMemo(
    () => toRelationItems(skills, (s) => s.name, (s) => s.code),
    [skills]
  );

  const { mutate: addSkill, isPending: savingSkill } = useAddSkill();
  const { mutate: addPrerequisite, isPending: savingPrereq } = useAddPrerequisite();
  const { mutate: addChunk, isPending: savingChunk } = useAddChunk();
  const { mutate: updateSkill, isPending: updatingSkill } = useUpdateSkill();
  const { mutate: deleteSkill, isPending: deletingSkill } = useDeleteSkill();
  const { mutate: updatePrerequisite, isPending: updatingPrereq } = useUpdatePrerequisite();
  const { mutate: deletePrerequisite, isPending: deletingPrereq } = useDeletePrerequisite();
  const { mutate: updateChunk, isPending: updatingChunk } = useUpdateChunk();
  const { mutate: deleteChunk, isPending: deletingChunk } = useDeleteChunk();

  const getGoalType = (goalValue: unknown): GoalType | undefined => {
    const goalId = normalizeRelationId(goalValue);
    return goals.find((goal) => goal.id === goalId)?.goal_type;
  };

  const hasExistingPrerequisite = (skillId: number | undefined, prerequisiteId: number | undefined) => {
    if (skillId == null || prerequisiteId == null) return false;
    return prerequisites.some((item) => {
      if (item.id === editingId) return false;
      const existingSkillId = normalizeRelationId(item.skill);
      const existingPrerequisiteId = normalizeRelationId(item.prerequisite);
      return (
        (existingSkillId === skillId && existingPrerequisiteId === prerequisiteId) ||
        (existingSkillId === prerequisiteId && existingPrerequisiteId === skillId)
      );
    });
  };

  const availablePrerequisiteOptions = useMemo(() => {
    const skillId = selectedPrerequisiteSkill;
    if (skillId == null) return skillOptions;
    return skillOptions.filter(
      (option) => option.id !== skillId && !hasExistingPrerequisite(skillId, option.id)
    );
  }, [editingId, prerequisites, selectedPrerequisiteSkill, skillOptions]);

  const handleSubmit = (values: Record<string, unknown>) => {
    const onDone = () => {
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
    };
    if (activeTab === "skills") {
      const goalType = getGoalType(values.goal);
      const skillValues = {
        ...values,
        goal: normalizeRelationId(values.goal),
        skill_type: goalType ?? values.skill_type,
      };
      if (editingId) updateSkill({ ...skillValues, id: editingId } as Skill, { onSuccess: onDone });
      else addSkill(skillValues as Skill, { onSuccess: onDone });
    } else if (activeTab === "prerequisites") {
      const prerequisiteValues = {
        ...values,
        skill: normalizeRelationId(values.skill),
        prerequisite: normalizeRelationId(values.prerequisite),
      };
      if (prerequisiteValues.skill === prerequisiteValues.prerequisite) {
        form.setFields([{ name: "prerequisite", errors: ["Une compétence ne peut pas être son propre prérequis."] }]);
        return;
      }
      if (hasExistingPrerequisite(prerequisiteValues.skill, prerequisiteValues.prerequisite)) {
        form.setFields([{ name: "prerequisite", errors: ["Cette relation de prérequis existe déjà."] }]);
        return;
      }
      if (editingId) updatePrerequisite({ ...prerequisiteValues, id: editingId } as Prerequisite, { onSuccess: onDone });
      else addPrerequisite(prerequisiteValues as Prerequisite, { onSuccess: onDone });
    } else if (editingId) {
      updateChunk({ ...values, id: editingId } as Chunk, { onSuccess: onDone });
    } else addChunk(values as Chunk, { onSuccess: onDone });
  };

  const openAdd = () => {
    setEditingId(null);
    setSelectedPrerequisiteSkill(undefined);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Skill | Prerequisite | Chunk) => {
    setEditingId(record.id ?? null);
    const values: Record<string, unknown> = { ...record };
    if ("goal" in values) values.goal = normalizeRelationId(values.goal);
    if ("goal" in values) values.skill_type = getGoalType(values.goal) ?? values.skill_type;
    if ("skill" in values) values.skill = normalizeRelationId(values.skill);
    if ("prerequisite" in values) values.prerequisite = normalizeRelationId(values.prerequisite);
    if ("strength" in values && values.strength == null) values.strength = 0.8;
    if ("skill" in values) setSelectedPrerequisiteSkill(values.skill as number | undefined);
    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const actionColumn = (onEdit: (record: any) => void, onDelete: (id: number) => void, deleting: boolean) => ({
    title: t("common.actions"),
    key: "actions",
    render: (_: unknown, record: { id?: number }) => (
      <Space>
        <Button aria-label={t("common.edit")} icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
        <Popconfirm title={t("common.confirm_delete")} onConfirm={() => record.id && onDelete(record.id)}>
          <Button aria-label={t("common.delete")} icon={<DeleteOutlined />} size="small" danger loading={deleting} />
        </Popconfirm>
      </Space>
    ),
  });

  const skillColumns: ColumnsType<Skill> = [
    { title: "Code", dataIndex: "code", key: "code" },
    { title: t("skills.name"), dataIndex: "name", key: "name" },
    { title: t("skills.type"), dataIndex: "skill_type", key: "skill_type", render: (v) => <Tag>{v}</Tag> },
    { title: t("skills.difficulty"), dataIndex: "difficulty", key: "difficulty" },
    {
      title: t("curriculum.goals"),
      dataIndex: "goal",
      key: "goal",
      render: (v) => getRelationLabel(goalOptions, normalizeRelationId(v)),
    },
    actionColumn(openEdit, deleteSkill, deletingSkill),
  ];

  const prereqColumns: ColumnsType<Prerequisite> = [
    {
      title: t("skills.skill"),
      dataIndex: "skill",
      key: "skill",
      render: (v) => getRelationLabel(skillOptions, normalizeRelationId(v)),
    },
    {
      title: t("skills.prerequisite"),
      dataIndex: "prerequisite",
      key: "prerequisite",
      render: (v) => getRelationLabel(skillOptions, normalizeRelationId(v)),
    },
    { title: t("skills.strength"), dataIndex: "strength", key: "strength", render: (v) => v == null ? "—" : `${Math.round(v * 100)}%` },
    actionColumn(openEdit, deletePrerequisite, deletingPrereq),
  ];

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
    actionColumn(openEdit, deleteChunk, deletingChunk),
  ];

  const renderForm = () => {
    if (activeTab === "skills") {
      return (
        <>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label={t("skills.name")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="goal" label={t("curriculum.goals")} rules={[{ required: true }]}>
            <RelationSelect
              items={goalOptions}
              loading={loadingGoals}
              placeholder={t("skills.placeholders.goal")}
              onChange={(goalId) => form.setFieldValue("skill_type", getGoalType(goalId))}
            />
          </Form.Item>
          <Form.Item name="skill_type" label={t("skills.type")} rules={[{ required: true }]}>
            <Select disabled options={[{ value: "conceptual", label: "Conceptual" }, { value: "operational", label: "Operational" }]} />
          </Form.Item>
          <Form.Item name="difficulty" label={t("skills.difficulty")} rules={[{ required: true }]}><InputNumber className="w-full" min={1} max={5} /></Form.Item>
          <Form.Item name="description" label={t("curriculum.description")} rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="order_index" label={t("curriculum.order")} rules={[{ required: true }]}><InputNumber className="w-full" min={1} /></Form.Item>
        </>
      );
    }
    if (activeTab === "prerequisites") {
      return (
        <>
          <Form.Item name="skill" label={t("skills.skill")} rules={[{ required: true }]}>
            <RelationSelect
              items={skillOptions}
              loading={loadingSkills}
              placeholder={t("skills.placeholders.skill")}
              onChange={(skillId) => {
                setSelectedPrerequisiteSkill(normalizeRelationId(skillId));
                form.setFieldValue("prerequisite", undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            name="prerequisite"
            label={t("skills.prerequisite")}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value == null || normalizeRelationId(value) !== normalizeRelationId(getFieldValue("skill"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Une compétence ne peut pas être son propre prérequis."));
                },
              }),
            ]}
          >
            <RelationSelect
              items={availablePrerequisiteOptions}
              loading={loadingSkills}
              placeholder={t("skills.placeholders.prerequisite")}
            />
          </Form.Item>
          <Form.Item name="strength" label={t("skills.strength")} rules={[{ required: true }]} initialValue={0.8}><InputNumber className="w-full" min={0} max={1} step={0.1} /></Form.Item>
        </>
      );
    }
    return (
      <>
        <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="title" label={t("skills.chunk_title")} rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="skill" label={t("skills.skill")} rules={[{ required: true }]}>
          <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.skill")} />
        </Form.Item>
        <Form.Item name="chunk_type" label={t("skills.type")} rules={[{ required: true }]}>
          <Select options={[{ value: "rule", label: "Rule" }, { value: "example", label: "Example" }]} />
        </Form.Item>
        <Form.Item name="difficulty" label={t("skills.difficulty")} rules={[{ required: true }]}><InputNumber className="w-full" min={1} max={5} /></Form.Item>
        <Form.Item name="content" label={t("curriculum.content")} rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="order_index" label={t("curriculum.order")}><InputNumber className="w-full" min={1} /></Form.Item>
      </>
    );
  };

  if (loadingSkills || loadingPrereq || loadingChunks || loadingGoals) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("skills.title_page")}
      subtitle={t("skills.subtitle")}
      icon={<BulbOutlined className="text-2xl" />}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="border-0 bg-white text-main-color hover:!bg-white/90">
          {t("common.add")}
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}><StatCard title={t("skills.title")} value={skills.length} icon={<BulbOutlined />} /></Col>
        <Col xs={24} md={8}><StatCard title={t("skills.prerequisites")} value={prerequisites.length} icon={<LinkOutlined />} color="#3f51b5" /></Col>
        <Col xs={24} md={8}><StatCard title={t("skills.chunks")} value={chunks.length} icon={<BlockOutlined />} color="#f89b22" /></Col>
      </Row>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            { key: "skills", label: t("skills.title"), children: <Table rowKey="id" columns={skillColumns} dataSource={skills} pagination={{ pageSize: 8 }} /> },
            { key: "prerequisites", label: t("skills.prerequisites"), children: <Table rowKey="id" columns={prereqColumns} dataSource={prerequisites} pagination={{ pageSize: 8 }} /> },
            { key: "chunks", label: t("skills.chunks"), children: <Table rowKey="id" columns={chunkColumns} dataSource={chunks} pagination={{ pageSize: 8 }} /> },
          ]}
        />
      </motion.div>

      <Modal title={editingId ? t("common.edit") : t("common.add")} open={modalOpen} onCancel={() => { setModalOpen(false); setEditingId(null); }} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {renderForm()}
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={savingSkill || savingPrereq || savingChunk || updatingSkill || updatingPrereq || updatingChunk}>{t("common.save")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
