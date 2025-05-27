import { lazy, Suspense } from "react"
import SpinnerLoader from "../ui/SpinnerLoader"

const PageHome = lazy(() => import("../Pages/Home/HomePage"));
const LoginePage = lazy(() => import("../Pages/Auth/Login"))
const ForgetPassword = lazy(() => import("../Pages/Auth/ForgetPassword"))

const ErrorPage = lazy(() => import("../Pages/ErrorPage"))


var MainRouter = [
     {
        path:"/login",
        element: (
            <Suspense  fallback={  <SpinnerLoader/>}>
              < LoginePage/>
            </Suspense>
          ),
        layout : "public",
        role:"admin"
    },
      {
        path:"/forget-password",
        element: (
            <Suspense  fallback={  <SpinnerLoader/>}>
              < ForgetPassword/>
            </Suspense>
          ),
        layout : "public",
        role:"admin"
    },


    {
        path:"/",
        element: (
            <Suspense  fallback={  <SpinnerLoader/>}>
              < PageHome/>
            </Suspense>
          ),
        layout : "private",
        role:"admin"
    },

    
    {
        path:"*",
        element: (
            <Suspense  fallback={  <SpinnerLoader/>}>
              < ErrorPage/>
            </Suspense>
          ),
        layout : "private",
        role:"admin"
    },
    
]



export default MainRouter