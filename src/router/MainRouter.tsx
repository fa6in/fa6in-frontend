// MainRouter.tsx
import { lazy, Suspense } from "react";
import SpinnerLoader from "../ui/SpinnerLoader";
import AuthRouter from "./AuthRouter";
import ErrorPage from "../Pages/ErrorPage";
import type { RouteType } from "./type";

// Admin Components
const HomeAdmin = lazy(() => import("../Pages/Admin/HomeAdmin"));
const StudentAdmin = lazy(() => import("../Pages/Admin/Student"));
const Prapared = lazy(() => import("../Pages/Admin/PraperedLater"));

// Student Components
const HomeStudent = lazy(() => import("../Pages/Student/HomeStudent"));

// Teacher Components
const HomeTeacher = lazy(() => import("../Pages/Teacher/HomeTeacher"));

const MainRouter: RouteType[] = [
  // ==================== Auth ROUTES ====================
  ...AuthRouter, // Ces routes n'ont pas allowedRoles (c'est OK car c'est optionnel)

  // ==================== ADMIN ROUTES ====================
  {
    path: "/admin/dashboard",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <HomeAdmin />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"] // Seul admin peut accéder
  },
  {
    path: "/admin/students",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <StudentAdmin />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["admin"] // Seul admin peut accéder
  },

  {
    path: "/admin/teachers",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

    layout: "private",
    allowedRoles: ["admin"] 
  },

  {
    path: "/admin/courses",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

  {
    path: "/admin/courses",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },
  {
    path: "/admin/classes",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },
   {
    path: "/admin/matieres",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },
  {
    path: "/admin/exams",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

  {
    path: "/admin/grades",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

  {
    path: "/admin/assignments",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

   {
    path: "/admin/roles",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

  {
    path: "/admin/settings",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <Prapared />
      </Suspense>
    ),

     layout: "private",
    allowedRoles: ["admin"] 
  },

  // ==================== STUDENT ROUTES ====================
  {
    path: "/student",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <HomeStudent />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["student"] // Seul student peut accéder
  },

  // ==================== TEACHER ROUTES ====================
  {
    path: "/teacher",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <HomeTeacher />
      </Suspense>
    ),
    layout: "private",
    allowedRoles: ["teacher"] // Seul teacher peut accéder
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