import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Dropdown, Modal, Tag, type MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import { UpdateProfileAdmin } from "../../Pages/Admin/UpdateProfile";
// import LanguageSite from "../LanguageSite";

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "navbar.roles.admin",
  teacher: "navbar.roles.teacher",
  student: "navbar.roles.student",
};

const NavbarAdmin: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isModalOpenProfile, setIsModalOpenProfile] = useState(false);
  const { data: dataProfile } = useGetProfile();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("wilayas")) return t("navbar.titles.wilaya");
    if (path.includes("students")) return t("navbar.titles.students");
    if (path.includes("teachers")) return t("navbar.titles.teachers");
    if (path.includes("curriculum")) return t("navbar.titles.curriculum");
    if (path.includes("skills")) return t("navbar.titles.skills");
    if (path.includes("assessment")) return t("navbar.titles.assessment");
    if (path.includes("analytics")) return t("navbar.titles.analytics");
    if (path.includes("admins")) return t("navbar.titles.admins");
    if (path.includes("matieres")) return t("navbar.titles.subjects");
    if (path.includes("chapitres")) return t("navbar.titles.exams");
    if (path.includes("contenu")) return t("sidebar.content");
    if (path.includes("assignments")) return t("navbar.titles.assignments");
    if (path === "/") return t("navbar.titles.dashboard");
    return "Ed-Tech";
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: t("navbar.profile.editProfile"),
      onClick: () => setIsModalOpenProfile(true),
    },
  ];

  const role = dataProfile?.role || "";
  const roleLabel = ROLE_LABEL[role] ? t(ROLE_LABEL[role]) : role;
  const displayName = [dataProfile?.first_name, dataProfile?.last_name]
    .filter(Boolean)
    .join(" ") || dataProfile?.username || "—";

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <motion.h1
        key={location.pathname + i18n.language}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="truncate text-lg font-bold tracking-tight text-ink md:text-xl"
      >
        {getPageTitle()}
      </motion.h1>

      <div className="flex items-center gap-3">
        {/* <LanguageSite /> */}
        <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            className="flex items-center gap-3 rounded-2xl border border-[#e5eee8] bg-white px-2.5 py-1.5 shadow-sm transition hover:border-main-color/30"
          >
            <Avatar
              size={36}
              src={dataProfile?.profile_image ? String(dataProfile.profile_image) : undefined}
              icon={<UserOutlined />}
              className="bg-main-color"
            />
            <div className="hidden text-start sm:block">
              <div className="max-w-[140px] truncate text-sm font-semibold text-ink">
                {displayName}
              </div>
              <Tag color="green" className="m-0 text-[11px]">{roleLabel}</Tag>
            </div>
          </motion.button>
        </Dropdown>
      </div>

      <Modal
        destroyOnClose
        onCancel={() => setIsModalOpenProfile(false)}
        open={isModalOpenProfile}
        footer={null}
        width={412}
        closable={false}
      >
        <UpdateProfileAdmin handleCancel={() => setIsModalOpenProfile(false)} />
      </Modal>
    </div>
  );
};

export default NavbarAdmin;
