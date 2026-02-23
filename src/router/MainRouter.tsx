// MainRouter.tsx
import { lazy, Suspense } from "react";
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
  // SettingOutlined,
  // AppstoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import AuthService from "../Auth-service/AuthService";
// Admin Components
const HomeAdmin = lazy(() => import("../Pages/Admin/Dashboard/HomeAdmin"));
const StudentAdmin = lazy(() => import("../Pages/Admin/Student/StudentView"));
const TeacherAdmin = lazy(() => import("../Pages/Admin/Teacher/TeacherView"));
const Prapared = lazy(() => import("../Pages/Admin/PraperedLater"));
const MartieresView = lazy(() => import("../Pages/Admin/Matieres/MatiereView"));
const MartieresViewStudent = lazy(() => import("../Pages/Student-Pages/Matieres/MatiereViewStudent"));
const ChapitreView = lazy(() => import("../Pages/Admin/Chapitres/ChapitreView"));
const ChapitreViewStudent = lazy(() => import("../Pages/Student-Pages/Chapitres/ChapitreViewStudent"));
const Content = lazy(() => import("../Pages/Student-Pages/Contenu/ContenuView"));
const AssignemnetViewStudent = lazy(() => import("../Pages/Student-Pages/Assignements/AssignementViewStudent"));
const AssignemnetViewAdmin = lazy(() => import("../Pages/Admin/Assignments/AssignmentViewAdmin"));
// const AdminsView = lazy(() => import("../Pages/Admin/Admin/AdminsView"));
const role = AuthService.getRole()

const MainRouter: RouteType[] = [
  // ==================== Auth ROUTES ====================
  ...AuthRouter,

  // ====================  ROUTES MAIN ====================
  {
    path: "/",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <HomeAdmin />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher"],
    sidebar: {
      key: "dashboard",
      label: "sidebar.dashboard",
      icon: <DashboardOutlined />,
    }
  },
  //   {
  //   path: "/admins",
  //   element: (
  //     <Suspense fallback={<SpinnerLoader />}>
  //       <AdminsView />
  //     </Suspense>
  //   ),

  //   layout: "private",
  //   allowedRoles: ["admin"],
  //   sidebar: {
  //     key: "teachers",
  //     label: "sidebar.teachers",
  //     icon: <GrUserAdmin />,
  //   }
  // },

  {
    path: "/students",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <StudentAdmin />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin", "teacher"],
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
         {role === "student" ? <MartieresViewStudent /> : <MartieresView />}
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
         {role === "student" ? <ChapitreViewStudent /> : <ChapitreView />}

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
        {role === "student" ? <Content /> : <Content />}
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
        {role === "student" ? <AssignemnetViewStudent /> : <AssignemnetViewAdmin />}
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
    path: "/roles",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "roles",
      label: ("sidebar.roles"),
      icon: <SafetyCertificateOutlined />,
    }
  },

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