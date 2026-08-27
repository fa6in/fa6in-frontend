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
} from "antd";
import {
  BulbOutlined,
  PlusOutlined,
  LinkOutlined,
  BlockOutlined,
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
import { useGetGoals } from "../../../Services/Curriculum/Goals/useGetGoals";

export default function SkillsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("skills");
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleSubmit = (values: Record<string, unknown>) => {
    const onDone = () => {
      setModalOpen(false);
      form.resetFields();
    };
    if (activeTab === "skills") addSkill(values as Skill, { onSuccess: onDone });
    else if (activeTab === "prerequisites") addPrerequisite(values as Prerequisite, { onSuccess: onDone });
    else addChunk(values as Chunk, { onSuccess: onDone });
  };

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
    { title: t("skills.strength"), dataIndex: "strength", key: "strength", render: (v) => `${Math.round(v * 100)}%` },
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
  ];

  const renderForm = () => {
    if (activeTab === "skills") {
      return (
        <>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label={t("skills.name")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="goal" label={t("curriculum.goals")} rules={[{ required: true }]}>
            <RelationSelect items={goalOptions} loading={loadingGoals} placeholder={t("skills.placeholders.goal")} />
          </Form.Item>
          <Form.Item name="skill_type" label={t("skills.type")} rules={[{ required: true }]}>
            <Select options={[{ value: "conceptual", label: "Conceptual" }, { value: "operational", label: "Operational" }]} />
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
            <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.skill")} />
          </Form.Item>
          <Form.Item name="prerequisite" label={t("skills.prerequisite")} rules={[{ required: true }]}>
            <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.prerequisite")} />
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }} className="border-0 bg-white text-main-color hover:!bg-white/90">
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

      <Modal title={t("common.add")} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {renderForm()}
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={savingSkill || savingPrereq || savingChunk}>{t("common.save")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
