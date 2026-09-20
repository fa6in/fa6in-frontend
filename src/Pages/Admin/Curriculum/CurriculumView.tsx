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
  Switch,
  Tag,
  Space,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RocketOutlined,
  ApartmentOutlined,
  FlagOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import { useGetStages } from "../../../Services/Curriculum/Stages/useGetStages";
import { useAddStage } from "../../../Services/Curriculum/Stages/useAddStage";
import { useUpdateStage } from "../../../Services/Curriculum/Stages/useUpdateStage";
import { useDeleteStage } from "../../../Services/Curriculum/Stages/useDeleteStage";
import type { Stage } from "../../../Services/Curriculum/Stages/typeStage";
import { useGetLevels } from "../../../Services/Curriculum/Levels/useGetLevels";
import { useAddLevel } from "../../../Services/Curriculum/Levels/useAddLevel";
import { useUpdateLevel } from "../../../Services/Curriculum/Levels/useUpdateLevel";
import { useDeleteLevel } from "../../../Services/Curriculum/Levels/useDeleteLevel";
import type { Level } from "../../../Services/Curriculum/Levels/typeLevel";
import { useGetGoals } from "../../../Services/Curriculum/Goals/useGetGoals";
import { useAddGoal } from "../../../Services/Curriculum/Goals/useAddGoal";
import type { Goal } from "../../../Services/Curriculum/Goals/typeGoal";
import { useGetLessons } from "../../../Services/Curriculum/Lessons/useGetLessons";
import { useAddLesson } from "../../../Services/Curriculum/Lessons/useAddLesson";
import { useUpdateLesson } from "../../../Services/Curriculum/Lessons/useUpdateLesson";
import { useDeleteLesson } from "../../../Services/Curriculum/Lessons/useDeleteLesson";
import { usePublishLesson } from "../../../Services/Curriculum/Lessons/usePublishLesson";
import type { Lesson } from "../../../Services/Curriculum/Lessons/typeLesson";
import { useGetUnits } from "../../../Services/Curriculum/Units/useGetUnits";
import RelationSelect, {
  getRelationLabel,
  normalizeRelationId,
  toRelationItems,
} from "../../../ui/RelationSelect";

type CurriculumViewProps = {
  initialTab?: string;
};

export default function CurriculumView({ initialTab = "stages" }: CurriculumViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stage | Level | Goal | Lesson | null>(
    null
  );
  const [form] = Form.useForm();

  const { data: stages = [], isPending: loadingStages } = useGetStages();
  const { data: levels = [], isPending: loadingLevels } = useGetLevels();
  const { data: goals = [], isPending: loadingGoals } = useGetGoals();
  const { data: lessons = [], isPending: loadingLessons } = useGetLessons();
  const { data: units = [], isPending: loadingUnits } = useGetUnits();

  const stageOptions = useMemo(
    () => toRelationItems(stages, (s) => s.name, (s) => s.code),
    [stages]
  );
  const lessonOptions = useMemo(
    () => toRelationItems(lessons, (l) => l.title, (l) => l.code),
    [lessons]
  );
  const unitOptions = useMemo(
    () => toRelationItems(units, (u) => u.title, (u) => u.code),
    [units]
  );

  const { mutate: addStage, isPending: addingStage } = useAddStage();
  const { mutate: updateStage, isPending: updatingStage } = useUpdateStage();
  const { mutate: deleteStage } = useDeleteStage();
  const { mutate: addLevel, isPending: addingLevel } = useAddLevel();
  const { mutate: updateLevel, isPending: updatingLevel } = useUpdateLevel();
  const { mutate: deleteLevel } = useDeleteLevel();
  const { mutate: addGoal, isPending: addingGoal } = useAddGoal();
  const { mutate: addLesson, isPending: addingLesson } = useAddLesson();
  const { mutate: updateLesson, isPending: updatingLesson } = useUpdateLesson();
  const { mutate: deleteLesson } = useDeleteLesson();
  const { mutate: publishLesson } = usePublishLesson();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Stage | Level | Goal | Lesson) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      stage: normalizeRelationId((record as Level).stage),
      lesson: normalizeRelationId((record as Goal).lesson),
      unit: normalizeRelationId((record as Lesson).unit),
    });
    setModalOpen(true);
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const onDone = () => {
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
    };

    if (activeTab === "stages") {
      if (editing?.id) {
        updateStage({ ...(values as Stage), id: editing.id }, { onSuccess: onDone });
      } else {
        addStage(values as Stage, { onSuccess: onDone });
      }
    } else if (activeTab === "levels") {
      if (editing?.id) {
        updateLevel({ ...(values as Level), id: editing.id }, { onSuccess: onDone });
      } else {
        addLevel(values as Level, { onSuccess: onDone });
      }
    } else if (activeTab === "goals") {
      addGoal(values as Goal, { onSuccess: onDone });
    } else if (activeTab === "lessons") {
      if (editing?.id) {
        updateLesson({ ...(values as Lesson), id: editing.id }, { onSuccess: onDone });
      } else {
        addLesson(values as Lesson, { onSuccess: onDone });
      }
    }
  };

  const requiredRule = [{ required: true, message: t("curriculum.required") }];

  const stageColumns: ColumnsType<Stage> = [
    { title: t("curriculum.code"), dataIndex: "code", key: "code" },
    { title: t("curriculum.name"), dataIndex: "name", key: "name" },
    { title: t("curriculum.order"), dataIndex: "order_index", key: "order_index" },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title={t("common.confirm_delete")} onConfirm={() => record.id && deleteStage(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const levelColumns: ColumnsType<Level> = [
    { title: t("curriculum.code"), dataIndex: "code", key: "code" },
    { title: t("curriculum.name"), dataIndex: "name", key: "name" },
    { title: t("curriculum.stage"), dataIndex: "stage", key: "stage", render: (v) => getRelationLabel(stageOptions, normalizeRelationId(v)) },
    { title: t("curriculum.order"), dataIndex: "order_index", key: "order_index" },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title={t("common.confirm_delete")} onConfirm={() => record.id && deleteLevel(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const goalColumns: ColumnsType<Goal> = [
    { title: t("curriculum.code"), dataIndex: "code", key: "code" },
    { title: t("curriculum.title"), dataIndex: "title", key: "title" },
    {
      title: t("curriculum.type"),
      dataIndex: "goal_type",
      key: "goal_type",
      render: (v) => (
        <Tag color={v === "conceptual" ? "blue" : "green"}>
          {t(`curriculum.goal_types.${v}`, { defaultValue: v })}
        </Tag>
      ),
    },
    { title: t("curriculum.lesson"), dataIndex: "lesson", key: "lesson", render: (v) => getRelationLabel(lessonOptions, normalizeRelationId(v)) },
  ];

  const lessonColumns: ColumnsType<Lesson> = [
    { title: t("curriculum.code"), dataIndex: "code", key: "code" },
    { title: t("curriculum.title"), dataIndex: "title", key: "title" },
    { title: t("curriculum.unit"), dataIndex: "unit", key: "unit", render: (v) => getRelationLabel(unitOptions, normalizeRelationId(v)) },
    {
      title: t("curriculum.published"),
      dataIndex: "is_published",
      key: "is_published",
      render: (v) => <Tag color={v ? "success" : "default"}>{v ? t("common.yes") : t("common.no")}</Tag>,
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          {!record.is_published && record.id && (
            <Button size="small" type="primary" onClick={() => publishLesson(record.id!)}>
              {t("curriculum.publish")}
            </Button>
          )}
          <Popconfirm title={t("common.confirm_delete")} onConfirm={() => record.id && deleteLesson(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderModalForm = () => {
    if (activeTab === "stages") {
      return (
        <>
          <Form.Item name="code" label={t("curriculum.code")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.code")} /></Form.Item>
          <Form.Item name="name" label={t("curriculum.name")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.name")} /></Form.Item>
          <Form.Item name="order_index" label={t("curriculum.order")} rules={requiredRule}><InputNumber className="w-full" min={1} /></Form.Item>
          <Form.Item name="description" label={t("curriculum.description")}><Input.TextArea rows={3} placeholder={t("curriculum.placeholders.description")} /></Form.Item>
        </>
      );
    }
    if (activeTab === "levels") {
      return (
        <>
          <Form.Item name="code" label={t("curriculum.code")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.code")} /></Form.Item>
          <Form.Item name="name" label={t("curriculum.name")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.name")} /></Form.Item>
          <Form.Item name="stage" label={t("curriculum.stage")} rules={requiredRule}>
            <RelationSelect
              items={stageOptions}
              loading={loadingStages}
              placeholder={t("curriculum.placeholders.stage")}
            />
          </Form.Item>
          <Form.Item name="order_index" label={t("curriculum.order")} rules={requiredRule}><InputNumber className="w-full" min={1} /></Form.Item>
          <Form.Item name="description" label={t("curriculum.description")}><Input.TextArea rows={3} placeholder={t("curriculum.placeholders.description")} /></Form.Item>
        </>
      );
    }
    if (activeTab === "goals") {
      return (
        <>
          <Form.Item name="lesson" label={t("curriculum.lesson")} rules={requiredRule}>
            <RelationSelect
              items={lessonOptions}
              loading={loadingLessons}
              placeholder={t("curriculum.placeholders.lesson")}
            />
          </Form.Item>
          <Form.Item name="goal_type" label={t("curriculum.type")} rules={requiredRule}>
            <Select
              placeholder={t("curriculum.placeholders.type")}
              options={[
                { value: "conceptual", label: t("curriculum.goal_types.conceptual") },
                { value: "operational", label: t("curriculum.goal_types.operational") },
              ]}
            />
          </Form.Item>
          <Form.Item name="code" label={t("curriculum.code")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.code")} /></Form.Item>
          <Form.Item name="title" label={t("curriculum.title")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.title")} /></Form.Item>
          <Form.Item name="description" label={t("curriculum.description")} rules={requiredRule}><Input.TextArea rows={3} placeholder={t("curriculum.placeholders.description")} /></Form.Item>
          <Form.Item name="order_index" label={t("curriculum.order")} rules={requiredRule}><InputNumber className="w-full" min={1} /></Form.Item>
        </>
      );
    }
    return (
      <>
        <Form.Item name="code" label={t("curriculum.code")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.code")} /></Form.Item>
        <Form.Item name="title" label={t("curriculum.title")} rules={requiredRule}><Input placeholder={t("curriculum.placeholders.title")} /></Form.Item>
        <Form.Item name="unit" label={t("curriculum.unit")} rules={requiredRule}>
          <RelationSelect
            items={unitOptions}
            loading={loadingUnits}
            placeholder={t("curriculum.placeholders.unit")}
          />
        </Form.Item>
        <Form.Item name="content" label={t("curriculum.content")} rules={requiredRule}><Input.TextArea rows={4} placeholder={t("curriculum.placeholders.content")} /></Form.Item>
        <Form.Item name="is_published" label={t("curriculum.published")} valuePropName="checked"><Switch /></Form.Item>
      </>
    );
  };

  const isLoading = loadingStages || loadingLevels || loadingGoals || loadingLessons || loadingUnits;
  const isSaving = addingStage || updatingStage || addingLevel || updatingLevel || addingGoal || addingLesson || updatingLesson;

  if (isLoading) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("curriculum.title_page")}
      subtitle={t("curriculum.subtitle")}
      icon={<BookOutlined className="text-2xl" />}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="border-0 bg-white text-main-color hover:!bg-white/90">
          {t("common.add")}
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}><StatCard title={t("curriculum.stages")} value={stages.length} icon={<ApartmentOutlined />} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title={t("curriculum.levels")} value={levels.length} icon={<RocketOutlined />} color="#f89b22" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title={t("curriculum.goals")} value={goals.length} icon={<FlagOutlined />} color="#3f51b5" /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title={t("curriculum.lessons")} value={lessons.length} icon={<ReadOutlined />} color="#722ed1" /></Col>
      </Row>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="curriculum-tabs"
          items={[
            {
              key: "stages",
              label: t("curriculum.stages"),
              children: <Table rowKey="id" columns={stageColumns} dataSource={stages} pagination={{ pageSize: 8 }} />,
            },
            {
              key: "levels",
              label: t("curriculum.levels"),
              children: <Table rowKey="id" columns={levelColumns} dataSource={levels} pagination={{ pageSize: 8 }} />,
            },
            {
              key: "goals",
              label: t("curriculum.goals"),
              children: <Table rowKey="id" columns={goalColumns} dataSource={goals} pagination={{ pageSize: 8 }} />,
            },
            {
              key: "lessons",
              label: t("curriculum.lessons"),
              children: <Table rowKey="id" columns={lessonColumns} dataSource={lessons} pagination={{ pageSize: 8 }} />,
            },
          ]}
        />
      </motion.div>

      <Modal
        title={editing ? t("curriculum.modal.edit") : t(`curriculum.modal.add_${activeTab}`)}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {renderModalForm()}
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={isSaving}>{t("common.save")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
