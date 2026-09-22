import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Empty,
  Button,
  Descriptions,
  Progress,
} from "antd";
import {
  BarChartOutlined,
  TeamOutlined,
  RiseOutlined,
  AlertOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageShell from "../../../ui/PageShell";
import StatCard from "../../../ui/StatCard";
import SpinnerLoader from "../../../ui/SpinnerLoader";
import DataPanel from "../../../ui/DataPanel";
import { useGetClassDashboard } from "../../../Services/Analytics/useGetClassDashboard";
import { useGetStudentErrorAnalysis } from "../../../Services/Analytics/useGetStudentErrorAnalysis";
import { useGetLevels } from "../../../Services/Curriculum/Levels/useGetLevels";
import { useGetStudents } from "../../../Services/Admin/Student/useGetStudents";
import RelationSelect, { toRelationItems } from "../../../ui/RelationSelect";

export default function AnalyticsView() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<number | undefined>();
  const [studentId, setStudentId] = useState<number | undefined>();

  const { data: levels = [] } = useGetLevels();
  const { data: studentsData, isPending: loadingStudents } = useGetStudents();

  const levelOptions = useMemo(
    () => toRelationItems(levels, (l) => l.name, (l) => l.code),
    [levels]
  );
    const studentOptions = useMemo(
    () =>
      toRelationItems(
        studentsData?.results ?? [],
        (s) =>
          `${s?.first_name ?? ""} ${s?.last_name ?? ""}`.trim() ||
          s?.username ||
          `#${s.id}`,
        (s) => s?.email
      ),
    [studentsData]
  );

  const { data: dashboard, isPending: loadingDashboard } =
    useGetClassDashboard(level ? { level } : undefined);
  const { data: errorAnalysis, isPending: loadingAnalysis } =
    useGetStudentErrorAnalysis(studentId ?? 0, { days: 30 }, !!studentId);

  if (loadingDashboard) return <SpinnerLoader />;

  const raw = dashboard ?? {};
  const summary = raw.summary ?? raw;

  const totalStudents = summary.total_students ?? summary.students_count ?? 0;
  const avgProgress = summary.avg_progress ?? summary.average_progress ?? 0;
  const activeToday = summary.active_today ?? summary.daily_active ?? 0;
  const errorRate = summary.error_rate ?? 0;

  const topErrors = errorAnalysis?.top_errors ?? errorAnalysis?.errors ?? [];
  const errorList = Array.isArray(topErrors) ? topErrors : [];

  const overviewEntries = Object.entries(raw)
    .filter(
      ([k, v]) =>
        !["summary", "top_errors", "id"].includes(k) &&
        v !== null &&
        v !== undefined &&
        typeof v !== "object"
    )
    .slice(0, 8);

  return (
    <PageShell
      title={t("analytics.title_page")}
      subtitle={t("analytics.subtitle")}
      icon={<BarChartOutlined className="text-2xl" />}
      extra={
        <RelationSelect
          allowClear
          placeholder={t("analytics.filter_level")}
          value={level}
          onChange={setLevel}
          items={levelOptions}
          className="[&_.ant-select-selector]:!border-white/30 [&_.ant-select-selector]:!bg-white/15 [&_.ant-select-selection-item]:!text-white min-w-[180px]"
        />
      }
    >
      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t("analytics.total_students")}
            value={totalStudents}
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t("analytics.avg_progress")}
            value={avgProgress}
            suffix="%"
            icon={<RiseOutlined />}
            color="#3f51b5"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t("analytics.active_today")}
            value={activeToday}
            icon={<BarChartOutlined />}
            color="#f89b22"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t("analytics.error_rate")}
            value={errorRate}
            suffix="%"
            icon={<AlertOutlined />}
            color="#ff4d4f"
          />
        </Col>
      </Row>

      {/* Visual progress bars */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              bordered={false}
              className="rounded-2xl border border-[#e5eee8] shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <RiseOutlined className="text-main-color text-lg" />
                <span className="font-bold text-ink">
                  {t("analytics.avg_progress")}
                </span>
              </div>
              <Progress
                percent={typeof avgProgress === "number" ? avgProgress : 0}
                strokeColor={{ from: "#17ab5b", to: "#0d8a48" }}
                strokeWidth={14}
                className="mb-2"
              />
              <p className="text-xs text-muted">
                {t("analytics.progress_description")}
              </p>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card
              bordered={false}
              className="rounded-2xl border border-[#e5eee8] shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertOutlined className="text-red-500 text-lg" />
                <span className="font-bold text-ink">
                  {t("analytics.error_rate")}
                </span>
              </div>
              <Progress
                percent={typeof errorRate === "number" ? errorRate : 0}
                strokeColor={{ from: "#ff4d4f", to: "#cf1322" }}
                strokeWidth={14}
                status="exception"
                className="mb-2"
              />
              <p className="text-xs text-muted">
                {t("analytics.error_description")}
              </p>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Class overview */}
        <Col xs={24} lg={14}>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <DataPanel title={t("analytics.class_overview")}>
              {overviewEntries.length > 0 ? (
                <Descriptions
                  bordered
                  size="small"
                  column={{ xs: 1, sm: 2 }}
                  className="p-4"
                >
                  {overviewEntries.map(([key, val]) => (
                    <Descriptions.Item
                      key={key}
                      label={
                        <span className="capitalize font-medium text-muted">
                          {t(`analytics.fields.${key}`, {
                            defaultValue: key.replace(/_/g, " "),
                          })}
                        </span>
                      }
                    >
                      <span className="font-bold text-ink">
                        {typeof val === "number"
                          ? val.toLocaleString()
                          : String(val ?? "—")}
                      </span>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <div className="p-8">
                  <Empty
                    image={<BookOutlined className="text-4xl text-muted" />}
                    description={t("analytics.no_dashboard_data")}
                  />
                </div>
              )}
            </DataPanel>
          </motion.div>
        </Col>

        {/* Student errors */}
        <Col xs={24} lg={10}>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <DataPanel
              title={t("analytics.student_errors")}
              extra={
                <div className="flex items-center gap-2">
                  <RelationSelect
                    allowClear
                    placeholder={t("analytics.select_student")}
                    value={studentId}
                    onChange={(v) => setStudentId(v ?? undefined)}
                    items={studentOptions}
                    loading={loadingStudents}
                    style={{ minWidth: 200 }}
                    size="middle"
                  />
                  <Button
                    type="primary"
                    size="middle"
                    disabled={!studentId}
                  >
                    {t("common.search")}
                  </Button>
                </div>
              }
            >
              <div className="p-4">
                {loadingAnalysis ? (
                  <SpinnerLoader />
                ) : errorList.length > 0 ? (
                  <Table
                    size="small"
                    pagination={false}
                    rowKey={(r, i) => String(r.id ?? i)}
                    dataSource={errorList}
                    columns={[
                      {
                        title: t("assessment.error_type"),
                        dataIndex: "error_type",
                        key: "error_type",
                      },
                      {
                        title: t("assessment.category"),
                        dataIndex: "category",
                        key: "category",
                        render: (v) => <Tag color="blue">{v}</Tag>,
                      },
                      {
                        title: t("analytics.count"),
                        dataIndex: "count",
                        key: "count",
                        render: (v) => (
                          <Tag
                            color={
                              v > 10 ? "red" : v > 5 ? "orange" : "green"
                            }
                          >
                            {v}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Empty
                    image={<UserOutlined className="text-4xl text-muted" />}
                    description={
                      studentId
                        ? t("analytics.no_errors_found")
                        : t("analytics.select_student_hint")
                    }
                  />
                )}
              </div>
            </DataPanel>
          </motion.div>
        </Col>
      </Row>
    </PageShell>
  );
}
