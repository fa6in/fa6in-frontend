import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { motion } from "framer-motion";
import { BookOutlined, TeamOutlined, TrophyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LanguageSite from "../../Components/LanguageSite";
import logo from "../../assets/images/logo-auth.png";

type AuthLayoutProps = {
  children: ReactNode;
  compact?: boolean;
};

const features = [
  { icon: <BookOutlined />, key: "feature_courses" },
  { icon: <TeamOutlined />, key: "feature_teachers" },
  { icon: <TrophyOutlined />, key: "feature_progress" },
  { icon: <SafetyCertificateOutlined />, key: "feature_secure" },
];

const AuthLayout = ({ children, compact = false }: AuthLayoutProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#17ab5b",
          borderRadius: 12,
          fontFamily: "inherit",
        },
      }}
    >
      <div className="auth-shell" dir={isRtl ? "rtl" : "ltr"}>
        <div className="auth-bg-orbs" aria-hidden>
          <span className="auth-orb auth-orb-1" />
          <span className="auth-orb auth-orb-2" />
          <span className="auth-orb auth-orb-3" />
        </div>

        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 lg:mt-12"
            >
              <p className="text-white/70 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase mb-3">
                {t("auth_ui.brand_kicker")}
              </p>
              <h1 className="text-white text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {t("auth_ui.brand_title")}
              </h1>
              <p className="mt-3 hidden sm:block text-white/80 text-sm sm:text-base leading-relaxed max-w-md">
                {t("auth_ui.brand_subtitle")}
              </p>
            </motion.div>

            <ul className="hidden lg:grid grid-cols-2 gap-3 mt-10">
              {features.map((item, index) => (
                <motion.li
                  key={item.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-base">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{t(`auth_ui.${item.key}`)}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </aside>

        <main className={`auth-panel ${compact ? "auth-panel-compact" : ""}`}>
          <div className="auth-panel-top">
            <LanguageSite />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="auth-card"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="auth-logo-wrap"
            >
              <img src={logo} alt="نواة المستقبل" className="auth-logo" />
            </motion.div>
            {children}
          </motion.div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default AuthLayout;
