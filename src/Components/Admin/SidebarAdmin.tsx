import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
    AppstoreOutlined,
    TeamOutlined,
    BookOutlined,
    BarChartOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../Services/Auth/useLogout";
import AuthService from "../../Auth-service/AuthService";

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
    match?: string[];
    submenu?: SidebarItem[];
};

const SidebarAdmin: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const { mutate: logout } = useLogout()
    const role = AuthService.getRole()

    const menuItems = useMemo<SidebarItem[]>(() => {
        if (role === "teacher") {
            return [
                { key: "board", label: "لوحتي", icon: <AppstoreOutlined />, path: "/" },
                { key: "content", label: "محتواي", icon: <BookOutlined />, path: "/content" },
                { key: "students", label: "طلابي", icon: <TeamOutlined />, path: "/students" },
                { key: "account", label: "حسابي", icon: <UserOutlined />, path: "/account" },
            ];
        }
        if (role === "student") {
            return [
                { key: "home", label: "الرئيسية", icon: <AppstoreOutlined />, path: "/" },
                { key: "path", label: "مساري", icon: <BookOutlined />, path: "/matieres", match: ["/units", "/learn"] },
                { key: "progress", label: "تقدمي", icon: <BarChartOutlined />, path: "/progress" },
                { key: "account", label: "حسابي", icon: <UserOutlined />, path: "/account" },
            ];
        }
        if (role === "regional_admin") {
            return [
                { key: "overview", label: "نظرة عامة", icon: <AppstoreOutlined />, path: "/" },
                { key: "users", label: "المستخدمون", icon: <TeamOutlined />, path: "/students" },
                { key: "reports", label: "التقارير", icon: <BarChartOutlined />, path: "/analytics" },
                { key: "account", label: "حسابي", icon: <UserOutlined />, path: "/account" },
            ];
        }
        return [
            { key: "overview", label: "نظرة عامة", icon: <AppstoreOutlined />, path: "/" },
            { key: "users", label: "المستخدمون", icon: <TeamOutlined />, path: "/students", match: ["/wilayas"] },
            { key: "curriculum", label: "المنهج", icon: <BookOutlined />, path: "/curriculum", match: ["/content"] },
            { key: "reports", label: "التقارير", icon: <BarChartOutlined />, path: "/analytics" },
            { key: "account", label: "حسابي", icon: <UserOutlined />, path: "/account" },
        ];
    }, [role]);

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
        if (item.match?.some((prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))) {
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
                            ? "bg-white/15 font-extrabold text-white"
                            : item.submenu && isParentActive
                                ? "bg-white/10 font-extrabold text-white"
                                : "text-white/90 hover:bg-white/10"
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
                        className="flex min-w-6 items-center justify-center text-lg text-white"
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
                className="fixed top-0 z-50 flex h-screen flex-col overflow-hidden bg-[#0F5C47] text-white"
                initial={{ width: 220 }}
                animate={{ width: collapsed ? 80 : 220 }}
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
                <div className={`flex items-start justify-between gap-2 px-4 pb-4 pt-6 ${collapsed ? "flex-col items-center" : ""}`}>
                    <div className={collapsed ? "text-center" : "px-1"}>
                        <div className="text-[26px] font-extrabold leading-none">{collapsed ? "ف" : "فَطِن"}</div>
                        {!collapsed && (
                            <div className="mt-1 text-[13px] text-white/80">
                                {role === "teacher"
                                    ? t("navbar.roles.teacher")
                                    : role === "student"
                                        ? t("navbar.roles.student")
                                        : role === "regional_admin"
                                        ? "مدير ولاية"
                                        : t("navbar.profile.administrator")}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none bg-white/10 text-base text-white"
                        onClick={onToggle}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </button>
                </div>

                <motion.div
                    className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
                    layout
                >
                    <nav className="flex flex-col gap-1">
                        {menuItems?.map((item) => renderItem(item))}
                    </nav>
                </motion.div>

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
                                bg-white/10 text-white hover:bg-white/20
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
