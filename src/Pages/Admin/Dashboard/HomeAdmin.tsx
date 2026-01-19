import { Card, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  RiseOutlined,
  ScheduleOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Line, Pie } from "@ant-design/plots";

/* =======================
   Animations
======================= */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 12 }
  }
};

const cardHover = {
  hover: {
    y: -8,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

/* =======================
   Stats Data (now using translation keys)
======================= */
const getStatsData = (t: any) => [
  {
    key: "totalUsers",
    title: t("dashboard.stats.totalUsers"),
    value: 2845,
    change: "+12.5%",
    icon: <UserOutlined className="text-2xl" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    trend: "up"
  },
  {
    key: "teachers",
    title: t("dashboard.stats.teachers"),
    value: 148,
    change: "+8.2%",
    icon: <TeamOutlined className="text-2xl" />,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    trend: "up"
  },
  {
    key: "students",
    title: t("dashboard.stats.students"),
    value: 2543,
    change: "+15.3%",
    icon: <TeamOutlined className="text-2xl" />,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    trend: "up"
  },
  {
    key: "courses",
    title: t("dashboard.stats.courses"),
    value: 127,
    change: "+5.7%",
    icon: <BookOutlined className="text-2xl" />,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    trend: "up"
  },
  {
    key: "activeClasses",
    title: t("dashboard.stats.activeClasses"),
    value: 42,
    change: "+3.4%",
    icon: <ScheduleOutlined className="text-2xl" />,
    color: "bg-gradient-to-br from-red-500 to-red-600",
    trend: "up"
  },

];

/* =======================
   Charts Data
======================= */
const growthData = [
  { month: "Jan", users: 1200, revenue: 32000 },
  { month: "Feb", users: 1350, revenue: 38000 },
  { month: "Mar", users: 1480, revenue: 42000 },
  { month: "Apr", users: 1650, revenue: 38500 },
  { month: "May", users: 1840, revenue: 45000 },
  { month: "Jun", users: 2100, revenue: 52000 },
  { month: "Jul", users: 2350, revenue: 48000 },
  { month: "Aug", users: 2543, revenue: 51200 },
  { month: "Sep", users: 2845, revenue: 58250 }
];



/* =======================
   Charts Config
======================= */
const lineConfig = {
  data: growthData,
  xField: 'month',
  yField: 'users',
  seriesField: 'type',
  smooth: true,
  autoFit: true,
  color: ['#3b82f6', '#10b981'],
  lineStyle: {
    lineWidth: 3,
  },
  point: {
    size: 5,
    shape: 'circle',
    style: {
      fill: 'white',
      stroke: '#3b82f6',
      lineWidth: 2,
    },
  },
  annotations: [
    // {
    //   type: 'regionFilter',
    //   start: ['min', 'median'],
    //   end: ['max', '0'],
    //   color: '#3b82f622',
    // },
  ],
};




const DashboardAdmin = () => {
  const { t, i18n } = useTranslation();

  const statsData = getStatsData(t);

  const userTypeData = [
    { type: t("sidebar.students"), value: 2543, color: "#10b981" },
    { type: t("sidebar.teachers"), value: 148, color: "#8b5cf6" },
    { type: t("sidebar.admins"), value: 24, color: "#ef4444" },
  ];


  const pieConfig = {
    data: userTypeData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '24px',
          fontWeight: 'bold',
        },
        content: 'Users',
      },
    },
  };


  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header with Breadcrumb */}
      <motion.div variants={{ item }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("dashboard.welcome")} 👋 {t("dashboard.subtitle")}
            </p>
          </div>

        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-8 grid max-xs:grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-4 ">
        {statsData.map((stat) => (
          <motion.div variants={{ item }} whileHover="hover" className="ma">
            <motion.div variants={cardHover}>
              <Card className="rounded-2xl shadow-md border-0 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      {stat.title}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {stat.value}
                    </div>
                    <div className="flex items-center mt-2">
                      {/* <ArrowUpOutlined className={`mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} /> */}
                      {/* <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} font-medium`}>
                          {stat.change}
                        </span> */}
                      {/* <span className="text-gray-500 text-sm ml-2">vs last month</span> */}
                    </div>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
     <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
  {/* LINE CHART */}
  <motion.div variants={{ item }}>
    <Card
      title={
        <div className="flex items-center">
          <RiseOutlined className="mr-2 text-blue-500" />
          <span className="font-semibold">
            {t("dashboard.charts.userGrowth")}
          </span>
        </div>
      }
      className="rounded-2xl shadow-md border-0"
      extra={
        <div className="flex items-center space-x-2">
          <Tag color="blue">Users</Tag>
          <Tag color="green">Revenue</Tag>
        </div>
      }
    >
      <div className="h-[250px] sm:h-[300px]">
        <Line {...lineConfig} height={300} />
      </div>
    </Card>
  </motion.div>

  {/* PIE CHART */}
  <motion.div variants={{ item }}>
    <Card
      title={
        <div className="flex items-center">
          <PieChartOutlined
            className={`${
              i18n.language === "ar" ? "ml-2" : "mr-2"
            } text-purple-500`}
          />
          <span className="font-semibold">
            {t("dashboard.charts.userDistribution")}
          </span>
        </div>
      }
      className="rounded-2xl shadow-md border-0"
    >
      <div className="h-[250px] sm:h-[300px]">
        <Pie {...pieConfig} height={300} />
      </div>
    </Card>
  </motion.div>
</div>




    </motion.div>
  );
};

export default DashboardAdmin;