
import { lazy, Suspense } from "react";
import SpinnerLoader from "../ui/SpinnerLoader";

const LoginView = lazy(() => import("../Pages/Auth/Login"));
const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));
const RegisterPage = lazy(() => import("../Pages/Auth/Register"));

const AuthRouter = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <LoginView />
      </Suspense>
    ),
    layout: "public" as const
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ResetPassword />
      </Suspense>
    ),
    layout: "public" as const
  },

  {
    path: "/register",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <RegisterPage />
      </Suspense>
    ),
    layout: "public" as const
  }
];

export default AuthRouter;

