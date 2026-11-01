// MainRouter.tsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import SpinnerLoader from "../ui/SpinnerLoader";
import AuthRouter from "./AuthRouter";
import ErrorPage from "../Pages/ErrorPage";
import type { RouteType } from "./type";
import { PiStudent } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { GrChapterAdd } from "react-icons/gr";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  BulbOutlined,
  AuditOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import AuthService from "../Auth-service/AuthService";
// Admin Components
// const HomeAdmin = lazy(() => import("../Pages/Admin/Dashboard/HomeAdmin"));
const TeacherAdmin = lazy(() => import("../Pages/Admin/Teacher/TeacherView"));
// const Prapared = lazy(() => import("../Pages/Admin/PraperedLater"));
const MartieresView = lazy(() => import("../Pages/Admin/Matieres/MatiereView"));
const ChapitreView = lazy(() => import("../Pages/Admin/Chapitres/ChapitreView"));
const ChapitreViewStudent = lazy(() => import("../Pages/Student-Pages/Chapitres/ChapitreViewStudent"));
const Content = lazy(() => import("../Pages/Student-Pages/Contenu/ContenuView"));
const AssignemnetViewStudent = lazy(() => import("../Pages/Student-Pages/Assignements/AssignementViewStudent"));
const AssignemnetViewAdmin = lazy(() => import("../Pages/Admin/Assignments/AssignmentViewAdmin"));
const SkillsView = lazy(() => import("../Pages/Admin/Skills/SkillsView"));
const AssessmentView = lazy(() => import("../Pages/Admin/Assessment/AssessmentView"));
const AnalyticsView = lazy(() => import("../Pages/Admin/Analytics/AnalyticsView"));
const AdminsView = lazy(() => import("../Pages/Admin/Admin/AdminsView"));
const AddNewAdmin = lazy(() => import("../Pages/Admin/Admin/AddNewAdmin"));
const WilayaView = lazy(() => import("../Pages/Admin/Wilaya/WilayaView"));

const NewDashboardAdmin = lazy(() => import("../Pages/Admin/Dashboard/FatinAdminHome"));
const FatinTeacherHome = lazy(() => import("../Pages/Teacher/FatinTeacherHome"));
const AccountPage = lazy(() => import("../Pages/Account/AccountPage"));
const FatinStudentProgress = lazy(() => import("../Pages/Student/FatinStudentProgress"));
const FatinUsersPage = lazy(() => import("../Pages/Admin/Users/FatinUsersPage"));
const FatinCurriculumPage = lazy(() => import("../Pages/Admin/Curriculum/FatinCurriculumPage"));
const FatinContentPage = lazy(() => import("../Pages/Teacher/FatinContentPage"));
const FatinTeacherStudents = lazy(() => import("../Pages/Teacher/FatinTeacherStudents"));
const FatinReportsPage = lazy(() => import("../Pages/Admin/Analytics/FatinReportsPage"));
const FatinStudentPath = lazy(() => import("../Pages/Student/FatinStudentPath"));
const FatinSkillMap = lazy(() => import("../Pages/Student/FatinSkillMap"));
const FatinLearnSession = lazy(() => import("../Pages/Student/FatinLearnSession"));
// Le rôle est lu au rendu (et non au chargement du module) pour qu'un
// changement de compte sans rechargement affiche les bons écrans.
type RoleViews = Partial<Record<"admin" | "regional_admin" | "teacher" | "student", React.ReactNode>> & { fallback: React.ReactNode };
function ByRole(views: RoleViews) {
  const role = AuthService.getRole() as keyof Omit<RoleViews, "fallback"> | null;
  return <>{(role && views[role]) ?? views.fallback}</>;
}

const MainRouter: RouteType[] = [
  // ==================== Auth ROUTES ====================
  ...AuthRouter,

  // ====================  ROUTES MAIN ====================
  {
    path: "/",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ByRole teacher={<FatinTeacherHome />} fallback={<NewDashboardAdmin />} />

      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher", "regional_admin"],
    sidebar: {
      key: "dashboard",
      label: "sidebar.dashboard",
      icon: <DashboardOutlined />,
    }
  },
  {
    path: "/students",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ByRole teacher={<FatinTeacherStudents />} fallback={<FatinUsersPage />} />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher", "regional_admin"],
    sidebar: {
      key: "students",
      label: "sidebar.students",
      icon: <PiStudent />,
    }
  },
  {
    path: "/teachers",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <TeacherAdmin />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "teachers",
      label: "sidebar.teachers",
      icon: <GiTeacher />,
    }
  },
  {
    path: "/matieres",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        {/* <MartieresView /> */}
        <ByRole student={<FatinStudentPath />} teacher={<Navigate to="/content" replace />} fallback={<MartieresView />} />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin", "teacher", "student"],
    sidebar: {
      key: "matieres",
      label: "sidebar.subjects",
      icon: <BookOutlined />,
    }
  },
  {
    path: "/chapitres",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        {/* <ChapitreView /> */}
        <ByRole student={<ChapitreViewStudent />} fallback={<ChapitreView />} />

      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin", "teacher", "student"],
    sidebar: {
      key: "exams",
      label: ("sidebar.exams"),
      icon: <GrChapterAdd />,
    }
  },

  {
    path: "/contenu",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Content />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher", "student"],
    sidebar: {
      key: "contenu",
      label: "sidebar.content",
      icon: <AppstoreOutlined />,
    }
  },

  {
    path: "/assignments",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ByRole student={<AssignemnetViewStudent />} fallback={<AssignemnetViewAdmin />} />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin", "student", "teacher"],
    sidebar: {
      key: "roles",
      label: ("sidebar.assignments"),
      icon: <FileTextOutlined />,
    }
  },

  {
    path: "/content",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <FatinContentPage />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher"],
  },
  {
    path: "/curriculum",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <FatinCurriculumPage />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "curriculum",
      label: "sidebar.curriculum",
      icon: <ApartmentOutlined />,
    }
  },
  {
    path: "/skills",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <SkillsView />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "skills",
      label: "sidebar.skills",
      icon: <BulbOutlined />,
    }
  },
  {
    path: "/assessment",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <AssessmentView />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher"],
    sidebar: {
      key: "assessment",
      label: "sidebar.assessment",
      icon: <AuditOutlined />,
    }
  },
  {
    path: "/analytics",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ByRole teacher={<AnalyticsView />} fallback={<FatinReportsPage />} />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher", "regional_admin"],
    sidebar: {
      key: "analytics",
      label: "sidebar.analytics",
      icon: <BarChartOutlined />,
    }
  },
  {
    path: "/admins",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <AdminsView />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "admins",
      label: "sidebar.admins",
      icon: <SafetyCertificateOutlined />,
    }
  },
  {
    path: "/admins/add",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <AddNewAdmin />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"],
  },
  {
    path: "/wilayas",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <WilayaView />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "wilaya",
      label: "sidebar.wilaya",
      icon: <EnvironmentOutlined />,
    },
  },
  //   element: (
  //     <Suspense fallback={<SpinnerLoader />}>
  //       <Prapared />
  //     </Suspense>
  //   ),

  //   layout: "private",
  //   allowedRoles: ["admin"],
  //   sidebar: {
  //     key: "roles",
  //     label: ("sidebar.roles"),
  //     icon: <SafetyCertificateOutlined />,
  //   }
  // },

  // {
  //   path: "/settings",
  //   element: (
  //     <Suspense fallback={<SpinnerLoader />}>
  //       <Prapared />
  //     </Suspense>
  //   ),

  //   layout: "private",
  //   allowedRoles: ["admin"],
  //   sidebar: {
  //     key: "settings",
  //     label: ("sidebar.settings"),
  //     icon: <SettingOutlined />,
  //   }
  // },


  {
    path: "/account",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <AccountPage />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher", "student", "regional_admin"],
  },
  {
    path: "/units/:unitId",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <FatinSkillMap />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["student"],
  },
  {
    path: "/learn/:skillId",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <FatinLearnSession />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["student"],
  },
  {
    path: "/progress",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <FatinStudentProgress />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["student"],
  },

  // ==================== FALLBACK ROUTE ====================
  {
    path: "*",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ErrorPage />
      </Suspense>
    ),
    layout: "public",
  }
];

export default MainRouter;