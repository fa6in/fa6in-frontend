import { useState, useMemo } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Card,
  Empty,
} from "antd";
import {
  AuditOutlined,
  PlusOutlined,
  LineChartOutlined,
  WarningOutlined,
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
import { useGetErrors } from "../../../Services/Assessment/useGetErrors";
import { useAddError } from "../../../Services/Assessment/useAddError";
import type { AssessmentError } from "../../../Services/Assessment/typeAssessment";
import { useGetProgress } from "../../../Services/Assessment/useGetProgress";
import { useGetSkills } from "../../../Services/Skills/useGetSkills";

export default function AssessmentView() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState<number | undefined>();
  const [form] = Form.useForm();

  const { data: errors = [], isPending: loadingErrors } = useGetErrors();
  const { data: skills = [], isPending: loadingSkills } = useGetSkills();
  const { data: progress, isPending: loadingProgress } = useGetProgress(
    skillFilter ? { skill: skillFilter } : undefined
  );
  const { mutate: addError, isPending: saving } = useAddError();

  const skillOptions = useMemo(
    () => toRelationItems(skills, (s) => s.name, (s) => s.code),
    [skills]
  );

  const errorColumns: ColumnsType<AssessmentError> = [
    { title: t("assessment.code"), dataIndex: "code", key: "code" },
    { title: t("assessment.error_type"), dataIndex: "error_type", key: "error_type" },
    { title: t("assessment.category"), dataIndex: "category", key: "category", render: (v) => <Tag>{v}</Tag> },
    {
      title: t("assessment.severity"),
      dataIndex: "severity_level",
      key: "severity_level",
      render: (v) => (
        <Tag color={v === "high" ? "red" : v === "medium" ? "orange" : "green"}>{v}</Tag>
      ),
    },
    {
      title: t("skills.skill"),
      dataIndex: "skill",
      key: "skill",
      render: (v) => getRelationLabel(skillOptions, normalizeRelationId(v)),
    },
  ];

  const progressList = Array.isArray(progress) ? progress : progress?.results ?? [];

  const progressColumns: ColumnsType<Record<string, unknown>> = [
    { title: t("assessment.student"), dataIndex: "student", key: "student" },
    {
      title: t("skills.skill"),
      dataIndex: "skill",
      key: "skill",
      render: (v) => getRelationLabel(skillOptions, normalizeRelationId(v)),
    },
    { title: t("assessment.mastery"), dataIndex: "mastery_level", key: "mastery_level" },
    { title: t("assessment.attempts"), dataIndex: "attempts_count", key: "attempts_count" },
  ];

  if (loadingErrors || loadingProgress || loadingSkills) return <SpinnerLoader />;

  return (
    <PageShell
      title={t("assessment.title_page")}
      subtitle={t("assessment.subtitle")}
      icon={<AuditOutlined className="text-2xl" />}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { form.resetFields(); setModalOpen(true); }}
          className="border-0 bg-white text-main-color hover:!bg-white/90"
        >
          {t("assessment.add_error")}
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <StatCard title={t("assessment.errors")} value={errors.length} icon={<WarningOutlined />} color="#ff4d4f" />
        </Col>
        <Col xs={24} md={12}>
          <StatCard title={t("assessment.progress_records")} value={progressList.length} icon={<LineChartOutlined />} color="#17ab5b" />
        </Col>
      </Row>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Tabs
          type="card"
          items={[
            {
              key: "errors",
              label: t("assessment.errors"),
              children: (
                <Table rowKey="id" columns={errorColumns} dataSource={errors} pagination={{ pageSize: 8 }} />
              ),
            },
            {
              key: "progress",
              label: t("assessment.progress"),
              children: (
                <Card bordered={false} className="shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span>{t("assessment.filter_skill")}</span>
                    <RelationSelect
                      allowClear
                      placeholder={t("skills.placeholders.skill")}
                      value={skillFilter}
                      onChange={(v) => setSkillFilter(v ?? undefined)}
                      items={skillOptions}
                      loading={loadingSkills}
                      style={{ minWidth: 220 }}
                    />
                    <Button onClick={() => setSkillFilter(undefined)}>{t("common.reset")}</Button>
                  </div>
                  {progressList.length > 0 ? (
                    <Table rowKey={(r) => String(r.id ?? Math.random())} columns={progressColumns} dataSource={progressList} pagination={{ pageSize: 8 }} />
                  ) : (
                    <Empty description={t("common.no_data")} />
                  )}
                </Card>
              ),
            },
          ]}
        />
      </motion.div>

      <Modal title={t("assessment.add_error")} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => addError(values as AssessmentError, { onSuccess: () => { setModalOpen(false); form.resetFields(); } })}
        >
          <Form.Item name="skill" label={t("skills.skill")} rules={[{ required: true }]}>
            <RelationSelect items={skillOptions} loading={loadingSkills} placeholder={t("skills.placeholders.skill")} />
          </Form.Item>
          <Form.Item name="category" label={t("assessment.category")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="error_type" label={t("assessment.error_type")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label={t("assessment.code")} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="root_cause" label={t("assessment.root_cause")} rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="severity_level" label={t("assessment.severity")} rules={[{ required: true }]}>
            <Select options={[
              { value: "low", label: t("assessment.severity_levels.low") },
              { value: "medium", label: t("assessment.severity_levels.medium") },
              { value: "high", label: t("assessment.severity_levels.high") },
            ]} />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={saving}>{t("common.save")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
