import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import SpinnerLoader from "../../ui/SpinnerLoader";
import { Avatar, Dropdown, Modal, type MenuProps } from "antd";
import { UpdateProfileAdmin } from "../../Pages/Admin/UpdateProfile";

interface NavbarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const NavbarTeacher: React.FC<NavbarProps> = ({ collapsed }) => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [isModalOpenProfile, setIsModalOpenProfile] = useState(false);

    const handlecancelProfile = () => {
        setIsModalOpenProfile(false)
        setUserMenuOpen(false)
    }

    const showModalProfile = () => {
        setIsModalOpenProfile(true);
    };

    const { data: dataProfile, isPending } = useGetProfile()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("dashboard")) return t("navbar.titles.dashboard");
        if (path.includes("students")) return t("navbar.titles.students");
        if (path.includes("teachers")) return t("navbar.titles.teachers");
        if (path.includes("courses")) return t("navbar.titles.courses");
        if (path.includes("classes")) return t("navbar.titles.classes");
        if (path.includes("subjects")) return t("navbar.titles.subjects");
        if (path.includes("exams")) return t("navbar.titles.exams");
        if (path.includes("grades")) return t("navbar.titles.grades");
        if (path.includes("assignments")) return t("navbar.titles.assignments");
        if (path.includes("roles")) return t("navbar.titles.roles");
        if (path.includes("reports")) return t("navbar.titles.reports");
        if (path.includes("settings")) return t("navbar.titles.settings");
        return "Ed-Tech";
    };


    const items: MenuProps["items"] = [
        {
            key: "1",
            label: t("navbar.profile.editProfile"),
            onClick: () => showModalProfile(),


        },
    ];


    const navbarVariants = {
        initial: {
            y: -100,
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
        scrolled: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            transition: {
                duration: 0.3,
            },
        },
    };


    if (isPending) {
        return <SpinnerLoader />
    }

    return (
        <motion.nav
            className="fixed top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60  "
            variants={{ navbarVariants }}
            initial="initial"
            animate={isScrolled ? ["animate", "scrolled"] : "animate"}
            style={i18n.language === "ar" ? {
                right: collapsed ? '95px' : '215px',
                left: 0,
                transition: 'right 0.3s ease-in-out'
            } : {
                left: collapsed ? '95px' : '215px',
                right: 0,
                transition: 'left 0.3s ease-in-out'
            }}
        >
            <div className="px-6 py-3 ">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            className="hidden md:flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="h-6 w-px bg-gray-300 mx-4"></div>
                            <motion.h1
                                className="text-lg font-semibold text-gray-800"
                                key={location.pathname}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {getPageTitle()}
                            </motion.h1>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-3 ">

                        <Dropdown menu={{ items }} placement="bottom" arrow>

                            <div className="flex items-center justify-center space-x-3 cursor-pointer gap-2">

                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[14px]">{dataProfile?.first_name} - {dataProfile?.role === "admin" ? "مشرف" : dataProfile?.role === "student" ? "تلميذ" : dataProfile?.role === "teacher" ? "أستاذ" : ""}</span>
                                </div>
                                <div>
                                    <Avatar size={40}
                                        src={<img src={(String(dataProfile?.profile_image!))}



                                            className="text-black text-[11px]" alt="logo-profile" />} />

                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(userMenuOpen || notificationsOpen || searchOpen || languageOpen) && (
                    <motion.div
                        className="fixed inset-0 bg-black/5 z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setUserMenuOpen(false);
                            setNotificationsOpen(false);
                            setSearchOpen(false);
                            setLanguageOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <Modal
                destroyOnClose={true}
                onCancel={handlecancelProfile}
                open={isModalOpenProfile}
                footer={null}
                width={412}
                closable={false}
                className=''
            >
                <UpdateProfileAdmin handleCancel={handlecancelProfile} />
            </Modal>
        </motion.nav>
    );
};

export default NavbarTeacher;

