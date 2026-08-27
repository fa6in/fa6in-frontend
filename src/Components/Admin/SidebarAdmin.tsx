import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    DownOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logo1.png"
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../Services/Auth/useLogout";
import AuthService from "../../Auth-service/AuthService";
import MainRouter from "../../router/MainRouter";

interface SidebarProps {
    collapsed: boolean;
    onToggle?: () => void;
    onCollapse?: (collapsed: boolean) => void;
}

type SidebarItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    submenu?: SidebarItem[];
};

const USER_MENU_KEYS = ["students", "teachers", "admins", "wilaya"];

const SidebarAdmin: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const { mutate: logout } = useLogout()
    const role = AuthService.getRole()

    const menuItems = useMemo<SidebarItem[]>(() => {
        const flat = MainRouter.filter(
            (route) =>
                route.layout === "private" &&
                route.sidebar &&
                route.allowedRoles?.includes(role!)
        ).map((route) => ({
            key: route.sidebar!.key,
            label: t(route.sidebar!.label),
            icon: route.sidebar!.icon,
            path: route.path,
        }));

        if (role !== "admin") return flat;

        const userChildren: SidebarItem[] = USER_MENU_KEYS.flatMap((key) => {
            const item = flat.find((entry) => entry.key === key);
            return item ? [item] : [];
        });
        const rest = flat.filter((item) => !USER_MENU_KEYS.includes(item.key));

        if (userChildren.length === 0) return rest;

        const usersGroup: SidebarItem = {
            key: "users",
            label: t("sidebar.users"),
            icon: <TeamOutlined />,
            submenu: userChildren,
        };

        const dashIndex = rest.findIndex((item) => item.key === "dashboard");
        if (dashIndex >= 0) {
            return [
                ...rest.slice(0, dashIndex + 1),
                usersGroup,
                ...rest.slice(dashIndex + 1),
            ];
        }
        return [usersGroup, ...rest];
    }, [role, t]);

    const [usersOpen, setUsersOpen] = useState(() =>
        ["/students", "/teachers", "/admins", "/wilayas"].some((p) =>
            location.pathname === p || location.pathname.startsWith(`${p}/`)
        )
    );

    const handleLogout = () => {
        logout()
        window.location.href = "/login";
        return navigate("/login")
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActiveParent = (item: SidebarItem) => {
        if (item.path && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))) {
            return true;
        }
        if (item.submenu) {
            return item.submenu.some(
                (sub) =>
                    sub.path &&
                    (location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`))
            );
        }
        return false;
    };

    const itemVariants = {
        collapsed: {
            justifyContent: "center",
            padding: "12px 16px",
            transition: {
                duration: 0.2,
            },
        },
        expanded: {
            justifyContent: "flex-start",
            padding: i18n.language === "ar" ? "12px 20px 12px 16px" : "12px 16px 12px 20px",
            transition: {
                duration: 0.2,
            },
        },
    };

    const textVariants = {
        collapsed: {
            opacity: 0,
            width: 0,
            marginLeft: 0,
            marginRight: 0,
            transition: {
                duration: 0.2,
            },
        },
        expanded: {
            opacity: 1,
            width: "auto",
            marginLeft: i18n.language === "ar" ? 0 : 12,
            marginRight: i18n.language === "ar" ? 12 : 0,
            transition: {
                duration: 0.2,
                delay: 0.1,
            },
        },
    };

    const renderItem = (item: SidebarItem, nested = false) => {
        const isParentActive = isActiveParent(item);
        const isOpen = item.key === "users" ? usersOpen || isParentActive : false;

        return (
            <div key={item.key} className="relative">
                <motion.div
                    className={`
                        flex items-center cursor-pointer mx-2 rounded-xl font-medium text-sm relative overflow-hidden transition-all duration-200
                        ${nested ? "ms-4" : ""}
                        ${isParentActive && !item.submenu
                            ? "!bg-main-color font-semibold text-white shadow-lg shadow-emerald-900/40"
                            : item.submenu && isParentActive
                                ? "bg-white/10 font-semibold text-white"
                                : "text-white/70 hover:bg-white/8 hover:text-white"
                        }
                    `}
                    variants={itemVariants}
                    initial="expanded"
                    animate={collapsed ? "collapsed" : "expanded"}
                    whileHover={{
                        transform: i18n.language === "ar" ? "translateX(-4px)" : "translateX(4px)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (item.submenu) {
                            if (collapsed) {
                                const first = item.submenu[0];
                                if (first?.path) handleNavigation(first.path);
                                return;
                            }
                            setUsersOpen((open) => !open);
                            return;
                        }
                        if (item.path) handleNavigation(item.path);
                    }}
                >
                    <div
                        className={`flex min-w-6 items-center justify-center text-lg transition-colors duration-200 ${isParentActive ? "text-white" : "text-white/70"
                            }`}
                    >
                        {item.icon}
                    </div>

                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap font-inherit"
                                variants={textVariants}
                                initial="expanded"
                                animate="expanded"
                                exit="collapsed"
                            >
                                {item.label}
                                {item.submenu && (
                                    <DownOutlined
                                        className={`ms-2 text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                                    />
                                )}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>

                {item.submenu && isOpen && !collapsed && (
                    <div className="mt-1 mb-1 flex flex-col gap-0.5">
                        {item.submenu.map((sub) => renderItem(sub, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <motion.div
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
                className="fixed top-0 z-50 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0a1f14] via-[#0f2a1c] to-[#12261b] shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
                initial={{ width: 248 }}
                animate={{ width: collapsed ? 80 : 248 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    [i18n.language === "ar" ? "right" : "left"]: 0,
                    top: 0,
                    borderRight: i18n.language === "ar" ? "none" : "1px solid rgba(255,255,255,0.06)",
                    borderLeft: i18n.language === "ar" ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
            >
                <motion.div
                    className={`flex items-center justify-between border-b border-white/10 p-5 ${i18n.language === "ar" ? "flex-row-reverse" : ""
                        }`}
                >
                    <motion.div
                        className={`flex items-center cursor-pointer ${i18n.language === "ar" ? "flex-row-reverse space-x-reverse" : "space-x-2"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <img src={logo} alt="Logo" className={`object-contain ${collapsed ? "h-8" : "h-11"}`} />
                    </motion.div>

                    <motion.button
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-white/5 text-base text-white/80 transition-all duration-200"
                        onClick={onToggle}
                        whileHover={{
                            scale: 1.08,
                            backgroundColor: "rgba(23, 171, 91, 0.25)",
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </motion.button>
                </motion.div>

                <motion.div
                    className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
                    layout
                >
                    <nav className="flex flex-col gap-1">
                        {menuItems?.map((item) => renderItem(item))}
                    </nav>
                </motion.div>

                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className={`mx-2 mb-3 rounded-xl bg-white/5 py-3 text-center text-xs text-white/50 ${i18n.language === "ar" ? "px-3 text-right" : "px-3 text-left"
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="font-medium mb-1">
                                {t("sidebar.version")} v1.0.0
                            </div>
                            <div className="text-[10px] text-white/35">
                                {t("sidebar.copyright")}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!collapsed && (
                    <motion.div
                        className={`mx-2 mb-4 ${i18n.language === "ar" ? "text-right" : ""}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <motion.button
                            className={`
                                w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm
                                bg-red-500/10 text-red-300 hover:bg-red-500/20
                                transition-all duration-200
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                        >
                            <span className={i18n.language === "ar" ? "ml-2" : "mr-2"}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                            </span>
                            <span>{t("sidebar.logout")}</span>
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
};

export default SidebarAdmin;
