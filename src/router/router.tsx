import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ErrorPage from "../Pages/ErrorPage";
import PublicLayout from "../Layout/PublicLayout";
import MainRouter from "./MainRouter";
import AdminLayout from "../Layout/AdminLayout";
import { useAuth } from "../Services/Auth/AuthProvider";
import { useEffect, useState } from "react";
import { useAutoLogout } from "../Services/Auth/useAutoLogout";
import AuthService from "../Auth-service/AuthService";
import LoadingSpinner from "../ui/LoadingSpinner";

const Router = () => {
    const { loading, isAuthenticated } = useAuth();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { resetTimer } = useAutoLogout();

    useEffect(() => {
        if (isAuthenticated) {
            resetTimer();
        }
    }, [isAuthenticated, resetTimer]);

    useEffect(() => {
        if (!loading) {
            setIsCheckingAuth(false);
        }
    }, [loading]);

    // Si toujours en train de vérifier l'authentification
    if (isCheckingAuth) {
        return <LoadingSpinner />; // Ou un autre indicateur de chargement
    }

    // Fonction pour vérifier si l'utilisateur a accès à la route
    const hasAccessToRoute = (routeRoles: string[] | undefined, userRole: string | null): boolean => {
        // Si la route n'a pas de restriction de rôle, tout le monde y a accès
        if (!routeRoles || routeRoles.length === 0) {
            return true;
        }

        // Si l'utilisateur n'a pas de rôle, il n'a pas accès
        if (!userRole) {
            return false;
        }

        // Vérifier si le rôle de l'utilisateur est dans les rôles autorisés
        return routeRoles.includes(userRole);
    };

    const routes = MainRouter.map((route) => {
        const isAuthRoute = [
            "/login",
            "/register",
            "/forget-password",
            "/reset-password",
            "/reset-success",
            "/otp",
            "/forgot-password"
        ].includes(route.path || "");

        const userRole = AuthService.getRole();

        // 1. Si l'utilisateur n'est PAS authentifié
        if (!isAuthenticated) {
            // Si c'est une route d'authentification, permettre l'accès
            if (isAuthRoute) {
                return {
                    ...route,
                    element: route.element ?
                        <PublicLayout>{route.element}</PublicLayout>
                        : <ErrorPage status={"404"} message="Page not found" />
                };
            }
            // Sinon, rediriger vers login
            return {
                ...route,
                element: <Navigate replace to="/login" />
            };
        }

        // 2. Si l'utilisateur EST authentifié
        // Empêcher l'accès aux routes d'authentification
        if (isAuthRoute) {
            // Rediriger vers le dashboard approprié selon le rôle
            if (userRole === "admin") {
                return {
                    ...route,
                    element: <Navigate replace to="/admin/dashboard" />
                };
            } else if (userRole === "student") {
                return {
                    ...route,
                    element: <Navigate replace to="/student" />
                };
            } else if (userRole === "teacher") {
                return {
                    ...route,
                    element: <Navigate replace to="/teacher" />
                };
            }
            return {
                ...route,
                element: <Navigate replace to="/" />
            };
        }

        // 3. Vérifier les permissions de rôle
        if (!hasAccessToRoute(route.allowedRoles, userRole)) {
            return {
                ...route,
                element: <ErrorPage status={"403"} message="Access denied" />
            };
        }

        // 4. Si tout est OK, afficher la route
        return {
            ...route,
            element: route.element ?
                route.layout === "private" ?
                    <AdminLayout>{route.element}</AdminLayout>
                    : <PublicLayout>{route.element}</PublicLayout>
                : <ErrorPage status={"404"} message="Page not found" />
        };
    });

    const router = createBrowserRouter(routes);
    return <RouterProvider router={router} />;
};

export default Router;