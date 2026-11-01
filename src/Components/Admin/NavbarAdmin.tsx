import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Dropdown, Modal, type MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetProfile } from "../../Services/Profile/useGetProfile";
import { UpdateProfileAdmin } from "../../Pages/Admin/UpdateProfile";
import { useFatinChromeState } from "../../ui/FatinChrome";
import { useLogout } from "../../Services/Auth/useLogout";
import NotificationsBell from "./NotificationsBell";
// import LanguageSite from "../LanguageSite";

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NavbarAdmin: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { t, i18n } = useTranslation();
  const [isModalOpenProfile, setIsModalOpenProfile] = useState(false);
  const { data: dataProfile } = useGetProfile();
  const chrome = useFatinChromeState();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("wilayas")) return t("navbar.titles.wilaya");
    if (path.includes("students")) return dataProfile?.role === "teacher" ? "طلابي" : "المستخدمون";
    if (path.includes("teachers")) return t("navbar.titles.teachers");
    if (path.includes("curriculum")) return "المنهج";
    if (path.includes("skills")) return t("navbar.titles.skills");
    if (path.includes("assessment")) return t("navbar.titles.assessment");
    if (path.includes("analytics")) return "التقارير";
    if (path.includes("admins")) return t("navbar.titles.admins");
    if (path.startsWith("/content")) return dataProfile?.role === "teacher" ? "محتواي" : "المحتوى";
    if (path.includes("matieres")) {
      if (dataProfile?.role === "teacher") return "محتواي";
      if (dataProfile?.role === "student") return "مساري";
      return t("navbar.titles.subjects");
    }
    if (path.includes("chapitres")) return t("navbar.titles.exams");
    if (path.includes("contenu")) return t("sidebar.content");
    if (path.includes("assignments")) return t("navbar.titles.assignments");
    if (path.includes("account")) return "حسابي";
    if (path.includes("progress")) return "تقدمي";
    if (path.startsWith("/units/")) return "خريطة المهارات";
    if (path.startsWith("/learn/")) return "جلسة تعلّم";
    if (path === "/") {
      if (dataProfile?.role === "teacher") return "لوحتي";
      if (dataProfile?.role === "regional_admin") return "نظرة عامة";
      if (dataProfile?.role === "student") return `أهلاً ${dataProfile.first_name || ""}`.trim();
      return "نظرة عامة";
    }
    return "Ed-Tech";
  };

  const items: MenuProps["items"] = [
    {
      key: "account",
      label: "حسابي",
      onClick: () => navigate("/account"),
    },
    {
      key: "edit",
      label: t("navbar.profile.editProfile"),
      onClick: () => setIsModalOpenProfile(true),
    },
    { type: "divider" },
    {
      key: "logout",
      danger: true,
      label: t("sidebar.logout"),
      onClick: () => {
        logout();
        window.location.href = "/login";
      },
    },
  ];

  const displayName = [dataProfile?.first_name, dataProfile?.last_name]
    .filter(Boolean)
    .join(" ") || dataProfile?.username || "—";

  const initial = (dataProfile?.first_name || dataProfile?.username || "ف").slice(0, 1);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <motion.h1
          key={location.pathname + i18n.language}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-ink sm:text-[26px]"
        >
          {getPageTitle()}
        </motion.h1>
        {chrome?.subtitle && <p className="mt-1 text-[13px] text-[#4C6A63]">{chrome.subtitle}</p>}
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        <label className="fatin-search w-full sm:w-[220px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            type="search"
            value={chrome?.query ?? ""}
            onChange={(event) => chrome?.setQuery(event.target.value)}
            placeholder={t("navbar.search", { defaultValue: "بحث..." })}
            className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#8CA39C]"
          />
        </label>
        {chrome?.action && (
          <button type="button" onClick={chrome.action.onClick} className="h-11 rounded-full bg-[#0F5C47] px-4 text-sm font-extrabold text-white">
            {chrome.action.label}
          </button>
        )}
        <NotificationsBell role={dataProfile?.role} />
        {dataProfile?.role === "student" ? (
          <button
            type="button"
            onClick={() => navigate("/account")}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-0 bg-[#1B7F5C] text-base font-extrabold text-white"
            aria-label={displayName}
          >
            {dataProfile?.profile_image ? (
              <Avatar size={44} src={String(dataProfile.profile_image)} icon={<UserOutlined />} className="bg-[#1B7F5C]" />
            ) : (
              initial
            )}
          </button>
        ) : (
        <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-0 bg-[#1B7F5C] text-base font-extrabold text-white"
            aria-label={displayName}
          >
            {dataProfile?.profile_image ? (
              <Avatar
                size={44}
                src={String(dataProfile.profile_image)}
                icon={<UserOutlined />}
                className="bg-[#1B7F5C]"
              />
            ) : (
              initial
            )}
          </button>
        </Dropdown>
        )}
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
