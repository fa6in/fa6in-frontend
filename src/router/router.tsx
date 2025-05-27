



import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";


import MainRouter from "./MainRouter";

import AuthService from "../Auth-service/AuthService";
import ErrorPage from "../Pages/ErrorPage";
import PublicLayout from "../Layout/PublicLayout";

const Router = () => {

  const routes = MainRouter.map((route) => {

    //   if (!AuthService.isAuthenticated() && !["/login", "/forget-password", "/reset-password", "/reset-success", "/otp", "/register"].includes(route.path)) {
    //     return {
    //       ...route,
    //       element: <Navigate replace to="/login" />,
    //     };
    //   } 

    //   const RouteRest = route.path?.startsWith("/reset-password/:token")
    //     if (!AuthService.isAuthenticated() && !["/login", "/forget-password", "/reset-success", "/register", "/otp", "/success-send-email", "/success-reset-password"].includes(route.path)
    //     && !RouteRest) {
    //         return {
    //           ...route,
    //           element: <Navigate replace to="/login" />,
    //         };
    //     }  

    //   if(AuthService.isAuthenticated() && route.layout === "public"){
    //     return {
    //         ...route,
    //         element: <Navigate replace to="/" />,
    //       };
    //   }
   
    return {
        ...route,
        element: route.element? 
         
             <PublicLayout>{route.element}</PublicLayout>
         : <ErrorPage status={"404"} message="Page not found"/>  
        };
    }
)
    ;
  const router = createBrowserRouter(routes); 
  return <RouterProvider router={router} />;
};

export default Router;