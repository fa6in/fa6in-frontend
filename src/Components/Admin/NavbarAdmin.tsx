import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  DownOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import LanguageSite from "../LanguageSite";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import SpinnerLoader from "../../ui/SpinnerLoader";
import { Modal } from "antd";
import { UpdateProfileAdmin } from "../../Pages/Admin/UpdateProfile";

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NavbarAdmin: React.FC<NavbarProps> = ({ collapsed }) => {
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

  const dropdownVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (isPending) {
    return <SpinnerLoader />
  }

  return (
    <motion.nav
      className="fixed top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60"
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
      <div className="px-6 py-3">
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
            {/* Dropdown de langue */}
            {/* <div className="relative">
              <AnimatePresence>
                <LanguageSite />
              </AnimatePresence>
            </div> */}

            {/* Profil Utilisateur */}
            <div className="relative">
              <motion.button
                className="flex items-center space-x-3 bg-white/90 border border-gray-200 rounded-2xl pl-3 pr-2 py-2 shadow-sm hover:shadow-md transition-all duration-200 hover:border-main-color/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br !bg-main-color rounded-full flex items-center justify-center shadow-md">
                    <UserOutlined className="text-white text-sm" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium text-gray-900 leading-none">
                      {dataProfile?.first_name} {dataProfile?.last_name}
                    </div>
                    <div className="text-xs text-gray-500 leading-none mt-1">
                      {dataProfile?.role}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DownOutlined className="text-xs text-gray-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                    variants={dropdownVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-main-color to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <UserOutlined className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {dataProfile?.first_name || ""} {dataProfile?.last_name || ""}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {dataProfile?.role || ""}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {dataProfile?.email || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center !gap-5 m-2 cursor-pointer" onClick={showModalProfile}>
                      <span className="text-sm font-medium">
                        <ProfileOutlined /> {t("navbar.profile.editProfile")}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour les dropdowns */}
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

export default NavbarAdmin;