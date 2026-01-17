



// import { lazy, Suspense } from "react";
// import SpinnerLoader from "../ui/SpinnerLoader";
// const LoginView = lazy(() => import("../Pages/Auth/Login"));
// const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));


// var AuthRouter = [
    
//   {
//     path: "/login",
//     element: (
//       <Suspense fallback={<SpinnerLoader />}>
//         < LoginView />
//       </Suspense>
//     ),
//     layout: "public",
//     role: ""
//   },

 
//   {
//     path: "/reset-password",
//     element: (
//       <Suspense fallback={<SpinnerLoader />}>
//         < ResetPassword />
//       </Suspense>
//     ),
//     layout: "public",
//     role: ""
//   },
 
  
  
// ]


// export default AuthRouter








// AuthRouter.tsx
// AuthRouter.tsx
import { lazy, Suspense } from "react";
import SpinnerLoader from "../ui/SpinnerLoader";

const LoginView = lazy(() => import("../Pages/Auth/Login"));
const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));

const AuthRouter = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <LoginView />
      </Suspense>
    ),
    layout: "public" as const // Ajoutez "as const" pour le type littéral
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<SpinnerLoader />}>
        <ResetPassword />
      </Suspense>
    ),
    layout: "public" as const // Ajoutez "as const" pour le type littéral
  }
];

export default AuthRouter;