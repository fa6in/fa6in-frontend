import { motion } from 'framer-motion';
import { Card, Statistic, Progress, Table, Tag, Spin, Tooltip, Row, Col, Alert } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  ExperimentOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useGetDashboardTeacher } from '../../Services/Teacher/useGetDashboardTeacher';
import { useGetOverviewDashboardTeacher } from '../../Services/Teacher/useGetOverviewTeacher';
import { useGetStudentProgressTeacher } from '../../Services/Teacher/useGetStudentProgressTeacher';
import { useGetUnitsPerformanceTeacher } from '../../Services/Teacher/useGetUnitPerformenceTeacher';
import { useTranslation } from 'react-i18next';

// Types
interface MasteryLevel {
  [key: string]: { color: string; label: string };
}

interface PriorityLevel {
  [key: string]: { color: string; label: string };
}

interface StudentProgress {
  student_info: {
    id: number;
    name: string;
    username: string;
    grade: number;
  };
  units_progress: Array<{
    unit_id: number;
    unit_title: string;
    progress_percentage: number;
    mastery_level: string;
    score: number;
    last_accessed: string;
  }>;
  average_progress: number;
  total_score: number;
  units_count: number;
}

interface UnitPerformance {
  unit_id: number;
  unit_title: string;
  subject: string;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  students_count: number;
  completed_count: number;
  completion_rate: number;
  average_progress: number;
  average_score: number;
  total_activities: number;
  total_attempts: number;
}

const TeacherDashboard: React.FC = () => {
  // const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();

  // Fetch data
  const { data: dataDashboardTeacher, isLoading: loadingDashboard } = useGetDashboardTeacher();
  const { data: dataOverview, isLoading: loadingOverview } = useGetOverviewDashboardTeacher();
  const { data: dataProgress, isLoading: loadingProgress } = useGetStudentProgressTeacher();
  const { data: dataUnitPerformance, isLoading: loadingUnitPerformance } = useGetUnitsPerformanceTeacher();

  // Update time every minute
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 60000);
  //   return () => clearInterval(timer);
  // }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const statCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  // Mastery level mapping avec le préfixe dashboard_teacher
  const masteryLevels: MasteryLevel = {
    beginner: { color: '#faad14', label: t('dashboard_teacher.dashboard.mastery.beginner') },
    intermediate: { color: '#52c41a', label: t('dashboard_teacher.dashboard.mastery.intermediate') },
    advanced: { color: '#1890ff', label: t('dashboard_teacher.dashboard.mastery.advanced') },
  };

  // Priority mapping avec le préfixe dashboard_teacher
  const priorityLevels: PriorityLevel = {
    high: { color: '#ff4d4f', label: t('dashboard_teacher.dashboard.priority.high') },
    medium: { color: '#faad14', label: t('dashboard_teacher.dashboard.priority.medium') },
    low: { color: '#52c41a', label: t('dashboard_teacher.dashboard.priority.low') },
  };

  // Loading state
  if (loadingDashboard || loadingOverview || loadingProgress || loadingUnitPerformance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin size="large" tip={t('dashboard_teacher.common.loading')}>
          <div className="p-8 rounded-lg bg-white shadow-xl">
            <div className="text-center">
              <BookOutlined className="text-4xl text-blue-500 animate-bounce" />
              <p className="mt-4 text-gray-600">{t('dashboard_teacher.common.loading')}</p>
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6" dir="rtl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {t('dashboard_teacher.dashboard.welcome_back')}, {dataDashboardTeacher?.teacher_name}
              </h1>
              <p className="text-gray-600 flex items-center text-sm md:text-base">
                <ClockCircleOutlined className="ml-2" />
                {t('dashboard_teacher.dashboard.last_updated')}: {new Date(dataDashboardTeacher?.last_updated || '').toLocaleString('fr')}
              </p>
            </div>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-3 rounded-full shadow-lg cursor-pointer"
            >
              <UserOutlined className="text-2xl md:text-3xl text-blue-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={{ statCardVariants }}
                whileHover="hover"
                className="h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-blue-500">
                  <Statistic
                    title={<span className="text-gray-600 text-sm">{t('dashboard_teacher.dashboard.stats.total_students')}</span>}
                    value={dataOverview?.quick_stats?.total_students ?? 0}
                    prefix={<TeamOutlined className="text-blue-500" />}
                    valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                  />
                  <div className="mt-2 text-xs md:text-sm text-gray-500">
                    {t('dashboard_teacher.dashboard.stats.active_students')}: {dataDashboardTeacher?.active_students}
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={{ statCardVariants }}
                whileHover="hover"
                className="h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-green-500">
                  <Statistic
                    title={<span className="text-gray-600 text-sm">{t('dashboard_teacher.dashboard.stats.total_units')}</span>}
                    value={dataOverview?.quick_stats?.total_units ?? 0}
                    prefix={<BookOutlined className="text-green-500" />}
                    valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                  />
                  <div className="mt-2 text-xs md:text-sm text-gray-500">
                    {t('dashboard_teacher.dashboard.stats.published_units')}: {dataOverview?.quick_stats?.published_units ?? 0}
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={{ statCardVariants }}
                whileHover="hover"
                className="h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-orange-500">
                  <Statistic
                    title={<span className="text-gray-600 text-sm">{t('dashboard_teacher.dashboard.stats.total_activities')}</span>}
                    value={dataOverview?.quick_stats?.total_activities ?? 0}
                    prefix={<ExperimentOutlined className="text-orange-500" />}
                    valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
                  />
                  <Progress
                    percent={Number(dataDashboardTeacher?.student_engagement_rate?.toFixed(1)) || 0}
                    size="small"
                    status="active"
                    className="mt-2"
                    format={(percent) => (
                      <span className="text-xs">{percent}% {t('dashboard_teacher.dashboard.stats.engagement')}</span>
                    )}
                  />
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                variants={{ statCardVariants }}
                whileHover="hover"
                className="h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-r-4 border-purple-500">
                  <Statistic
                    title={<span className="text-gray-600 text-sm">{t('dashboard_teacher.dashboard.stats.avg_progress')}</span>}
                    value={dataOverview?.quick_stats?.avg_student_progress ?? 0}
                    prefix={<RiseOutlined className="text-purple-500" />}
                    valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
                    suffix="%"
                  />
                  <Progress
                    percent={dataOverview?.quick_stats?.avg_student_progress ?? 0}
                    size="small"
                    status="active"
                    strokeColor="#722ed1"
                    className="mt-2"
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Recent Activity and Deadlines */}
        <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card
                  title={
                    <span className="flex items-center">
                      <BarChartOutlined className="ml-2 text-blue-500" />
                      <span className="text-base md:text-lg">{t('dashboard_teacher.dashboard.recent_activity.title')}</span>
                    </span>
                  }
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="space-y-3">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-l from-blue-50 to-white rounded-lg"
                    >
                      <span className="text-gray-600 text-sm md:text-base">{t('dashboard_teacher.dashboard.recent_activity.period')}</span>
                      <span className="text-base md:text-lg font-bold text-blue-500">
                        {dataOverview?.recent_activity?.period ?? '—'}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-l from-green-50 to-white rounded-lg"
                    >
                      <span className="text-gray-600 text-sm md:text-base">{t('dashboard_teacher.dashboard.recent_activity.attempts')}</span>
                      <span className="text-base md:text-lg font-bold text-green-500">
                        {dataOverview?.recent_activity?.total_attempts ?? 0}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-l from-orange-50 to-white rounded-lg"
                    >
                      <span className="text-gray-600 text-sm md:text-base">{t('dashboard_teacher.dashboard.recent_activity.unique_students')}</span>
                      <span className="text-base md:text-lg font-bold text-orange-500">
                        {dataOverview?.recent_activity?.unique_students ?? 0}
                      </span>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={12}>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card
                  title={
                    <span className="flex items-center">
                      <WarningOutlined className="ml-2 text-orange-500" />
                      <span className="text-base md:text-lg">{t('dashboard_teacher.dashboard.deadlines.title')}</span>
                    </span>
                  }
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="space-y-3">
                    {(dataOverview?.upcoming_deadlines ?? []).map((deadline, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 bg-gray-50 rounded-lg gap-2"
                      >
                        <div>
                          <span className="font-semibold text-gray-800 text-sm md:text-base">{deadline.title}</span>
                          <div className="text-xs md:text-sm text-gray-500 mt-1">
                            <ClockCircleOutlined className="ml-1" />
                            {new Date(deadline.deadline).toLocaleDateString('fr')}
                          </div>
                        </div>
                        <Tag color={priorityLevels[deadline.priority]?.color} className="text-xs md:text-sm">
                          {priorityLevels[deadline.priority]?.label}
                        </Tag>
                      </motion.div>
                    ))}
                    {(!dataOverview?.upcoming_deadlines || dataOverview.upcoming_deadlines.length === 0) && (
                      <Alert message={t('dashboard_teacher.common.no_data')} type="info" showIcon />
                    )}
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Students Progress Table */}
        <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              title={
                <span className="flex items-center">
                  <TeamOutlined className="ml-2 text-green-500" />
                  <span className="text-base md:text-lg">{t('dashboard_teacher.dashboard.students_progress.title')}</span>
                </span>
              }
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <Table
                dataSource={dataProgress?.students_progress}
                rowKey={(record: StudentProgress) => record.student_info.id}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                className="overflow-x-auto"
                scroll={{ x: true }}
                size="middle"
              >
                <Table.Column
                  title={t('dashboard_teacher.dashboard.students_progress.name')}
                  dataIndex={['student_info', 'name']}
                  key="name"
                  render={(text: string) => (
                    <span className="font-semibold text-gray-800 text-sm md:text-base">{text}</span>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.students_progress.grade')}
                  dataIndex={['student_info', 'grade']}
                  key="grade"
                  render={(grade: number) => (
                    <Tag color="blue" className="text-xs md:text-sm">
                      {t('dashboard_teacher.dashboard.students_progress.grade')} {grade}
                    </Tag>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.students_progress.progress')}
                  key="progress"
                  render={(_: any, record: StudentProgress) => (
                    <Progress
                      percent={Number(record.average_progress.toFixed(1))}
                      size="small"
                      status="active"
                      strokeColor={record.average_progress > 70 ? '#52c41a' : '#faad14'}
                      format={(percent) => <span className="text-xs">{percent}%</span>}
                    />
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.students_progress.mastery_level')}
                  key="mastery"
                  render={(_: any, record: StudentProgress) => {
                    const level = record.units_progress[0]?.mastery_level || 'beginner';
                    return (
                      <Tag color={masteryLevels[level]?.color} className="text-xs md:text-sm">
                        {masteryLevels[level]?.label}
                      </Tag>
                    );
                  }}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.students_progress.last_accessed')}
                  key="last_accessed"
                  render={(_: any, record: StudentProgress) => (
                    <span className="text-gray-600 text-xs md:text-sm">
                      {new Date(record?.units_progress[0]?.last_accessed).toLocaleDateString('fr')}
                    </span>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.common.actions.view')}
                  key="action"
                  render={() => (
                    <Tooltip title={t('dashboard_teacher.common.actions.view_details')}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <FileTextOutlined />
                      </motion.button>
                    </Tooltip>
                  )}
                />
              </Table>
            </Card>
          </motion.div>
        </motion.div>

        {/* Units Performance */}
        <motion.div variants={{ itemVariants }} className="mb-6 md:mb-8">
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              title={
                <span className="flex items-center">
                  <BookOutlined className="ml-2 text-purple-500" />
                  <span className="text-base md:text-lg">{t('dashboard_teacher.dashboard.units_performance.title')}</span>
                </span>
              }
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <Table
                dataSource={dataUnitPerformance?.units_performance}
                rowKey="unit_id"
                pagination={{ pageSize: 5, showSizeChanger: true }}
                className="overflow-x-auto"
                scroll={{ x: true }}
                size="middle"
              >
                <Table.Column
                  title={t('dashboard_teacher.dashboard.units_performance.unit_title')}
                  dataIndex="unit_title"
                  key="unit_title"
                  render={(text: string) => (
                    <span className="font-semibold text-gray-800 text-sm md:text-base">{text}</span>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.units_performance.subject')}
                  dataIndex="subject"
                  key="subject"
                  render={(subject: string) => (
                    <Tag color="geekblue" className="text-xs md:text-sm">{subject}</Tag>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.units_performance.difficulty')}
                  dataIndex="difficulty"
                  key="difficulty"
                  render={(difficulty: string) => {
                    const colors: Record<string, string> = {
                      easy: 'green',
                      medium: 'orange',
                      hard: 'red'
                    };
                    return (
                      <Tag color={colors[difficulty] || 'blue'} className="text-xs md:text-sm">
                        {t(`dashboard_teacher.dashboard.difficulty.${difficulty}`)}
                      </Tag>
                    );
                  }}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.units_performance.completion_rate')}
                  key="completion_rate"
                  render={(_: any, record: UnitPerformance) => (
                    <Progress
                      percent={record.completion_rate}
                      size="small"
                      status="active"
                      strokeColor={record.completion_rate > 70 ? '#52c41a' : '#faad14'}
                      format={(percent) => <span className="text-xs">{percent}%</span>}
                    />
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.dashboard.units_performance.average_score')}
                  key="average_score"
                  render={(_: any, record: UnitPerformance) => (
                    <span className="font-bold text-blue-500 text-sm">
                      {record.average_score} / {record.total_activities * 5}
                    </span>
                  )}
                />
                <Table.Column
                  title={t('dashboard_teacher.common.actions.view')}
                  key="action"
                  render={() => (
                    <Tooltip title={t('dashboard_teacher.common.actions.view_details')}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <FileTextOutlined />
                      </motion.button>
                    </Tooltip>
                  )}
                />
              </Table>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;