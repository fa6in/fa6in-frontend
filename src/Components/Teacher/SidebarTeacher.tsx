



import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DashboardOutlined,
    UserOutlined,
    BookOutlined,
    SettingOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SolutionOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logo.png"
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogout } from "../../Services/Auth/useLogout";

interface SidebarProps {
    collapsed: boolean;
    onToggle?: () => void;
    onCollapse?: (collapsed: boolean) => void;
}

const SidebarTeacher: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const { mutate: logout } = useLogout()

    const menuItems = [
        {
            key: "dashboard",
            label: t("sidebar.dashboard"),
            icon: <DashboardOutlined />,
            path: "/admin/dashboard",
        },
        {
            key: "students",
            label: t("sidebar.students"),
            icon: <UserOutlined />,
            path: "/admin/students",
        },
        {
            key: "teachers",
            label: t("sidebar.teachers"),
            icon: <SolutionOutlined />,
            path: "/admin/teachers",
        },

        {
            key: "subjects",
            label: t("sidebar.subjects"),
            icon: <BookOutlined />,
            path: "/admin/matieres",
        },
        {
            key: "exams",
            label: t("sidebar.exams"),
            icon: <FileTextOutlined />,
            path: "/admin/chapitres",
        },

        {
            key: "courses",
            label: t("sidebar.courses"),
            icon: <BookOutlined />,
            path: "/admin/courses",
        },
        {
            key: "classes",
            label: t("sidebar.classes"),
            icon: <AppstoreOutlined />,
            path: "/admin/classes",
        },
        
        {
            key: "grades",
            label: t("sidebar.grades"),
            icon: <FileTextOutlined />,
            path: "/admin/grades",
        },
        {
            key: "assignments",
            label: t("sidebar.assignments"),
            icon: <FileTextOutlined />,
            path: "/admin/assignments",
        },
        {
            key: "roles",
            label: t("sidebar.roles"),
            icon: <SafetyCertificateOutlined />,
            path: "/admin/roles",
        },
        // {
        //     key: "reports",
        //     label: t("sidebar.reports"),
        //     icon: <BarChartOutlined />,
        //     path: "/admin/reports",
        // },
        {
            key: "settings",
            label: t("sidebar.settings"),
            icon: <SettingOutlined />,
            path: "/admin/settings",
        },
    ];

    const handleLogout = () => {
        logout()
        window.location.href = "/login";
        return navigate("/login")
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActiveParent = (item: any) => {
        if (location.pathname === item.path) return true;
        if (item.submenu) {
            return item.submenu.some((sub: any) => location.pathname === sub.path);
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

    return (
        <>
            <motion.div
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
                className="h-screen bg-gradient-to-b from-white to-[#fafbff] shadow-lg flex flex-col fixed top-0 z-50 overflow-hidden"
                initial={{ width: 200 }}
                animate={{ width: collapsed ? 100 : 210 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    [i18n.language === "ar" ? "right" : "left"]: 0,
                    top: 0,
                    borderRight: i18n.language === "ar" ? "none" : "1px solid #e5e7eb",
                    borderLeft: i18n.language === "ar" ? "1px solid #e5e7eb" : "none",
                }}
            >
                {/* En-tête du Sidebar */}
                <motion.div
                    className={`flex items-center justify-between p-6 border-b border-gray-100 bg-white/90 backdrop-blur-sm ${i18n.language === "ar" ? "flex-row-reverse" : ""
                        }`}
                    layout
                >
                    <motion.div
                        className={`flex items-center cursor-pointer ${i18n.language === "ar" ? "flex-row-reverse space-x-reverse" : "space-x-2"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <img src={logo} className="" alt="Logo" />
                    </motion.div>

                    <motion.button
                        className="w-10 h-10 border-none rounded-lg bg-transparent text-gray-600 cursor-pointer flex items-center justify-center text-base transition-all duration-200"
                        onClick={onToggle}
                        whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(63, 81, 181, 0.1)",
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </motion.button>
                </motion.div>

                {/* Menu Principal */}
                <motion.div
                    className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
                    layout
                >
                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => {
                            const isParentActive = isActiveParent(item);

                            return (
                                <div key={item.key} className="relative">
                                    <motion.div
                                        className={`
                                            flex items-center cursor-pointer mx-2 rounded-xl font-medium text-sm relative overflow-hidden transition-all duration-200
                                            ${isParentActive
                                                ? "!bg-main-color text-white font-semibold"
                                                : "text-gray-600 hover:bg-[#3f51b5]/10"
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
                                            handleNavigation(item.path);
                                        }}
                                    >
                                        <div
                                            className={`text-lg min-w-6 flex items-center justify-center transition-colors duration-200 ${isParentActive ? "text-white" : "text-gray-600"
                                                }`}
                                        >
                                            {item.icon}
                                        </div>

                                        <AnimatePresence>
                                            {!collapsed && (
                                                <motion.span
                                                    className="whitespace-nowrap overflow-hidden font-inherit"
                                                    variants={textVariants}
                                                    initial="expanded"
                                                    animate="expanded"
                                                    exit="collapsed"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </nav>
                </motion.div>

                {/* Footer du Sidebar */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className={`text-center py-3 text-xs text-gray-500 bg-[#f8f9ff]/80 mx-2 rounded-lg backdrop-blur-sm mb-4 ${i18n.language === "ar" ? "text-right px-3" : "text-left px-3"
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="font-medium mb-1">
                                {t("sidebar.version")} v1.0.0
                            </div>
                            <div className="text-[10px] text-gray-400">
                                {t("sidebar.copyright")}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bouton de déconnexion */}
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
                                bg-red-50 text-red-600 hover:bg-red-100
                                transition-all duration-200
                                ${i18n.language === "ar" ? "" : ""}
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

export default SidebarTeacher;