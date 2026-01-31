// MainRouter.tsx
import { lazy, Suspense } from "react";
import SpinnerLoader from "../ui/SpinnerLoader";
import AuthRouter from "./AuthRouter";
import ErrorPage from "../Pages/ErrorPage";
import type { RouteType } from "./type";

import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  // AppstoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
// Admin Components
const HomeAdmin = lazy(() => import("../Pages/Admin/Dashboard/HomeAdmin"));
const StudentAdmin = lazy(() => import("../Pages/Admin/Student/StudentView"));
const TeacherAdmin = lazy(() => import("../Pages/Admin/Teacher/TeacherView"));
const Prapared = lazy(() => import("../Pages/Admin/PraperedLater"));
const MartieresView = lazy(() => import("../Pages/Admin/Matieres/MatiereView"));
const ChapitreView = lazy(() => import("../Pages/Admin/Chapitres/ChapitreView"));


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
      icon: <UserOutlined />,
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
      icon: <UserOutlined />,
    }
  },

  {
    path: "/matieres",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <MartieresView />
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
        <ChapitreView />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin", "teacher"],
    sidebar: {
      key: "exams",
      label: ("sidebar.exams"),
      icon: <FileTextOutlined />,
    }
  },


  {
    path: "/assignments",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin"],
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

  {
    path: "/settings",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin"],
    sidebar: {
      key: "settings",
      label: ("sidebar.settings"),
      icon: <SettingOutlined />,
    }
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