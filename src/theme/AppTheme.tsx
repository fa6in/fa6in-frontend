import { ConfigProvider } from "antd";
import arEG from "antd/locale/ar_EG";
import frFR from "antd/locale/fr_FR";
import enUS from "antd/locale/en_US";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const BRAND = {
  primary: "#17ab5b",
  primaryDark: "#0d8a48",
  secondary: "#f89b22",
  ink: "#12261b",
  muted: "#5b6b62",
  surface: "#f6faf7",
};

const locales = {
  ar: arEG,
  fr: frFR,
  en: enUS,
} as const;

type AppThemeProps = {
  children: ReactNode;
};

export default function AppTheme({ children }: AppThemeProps) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "ar").slice(0, 2) as keyof typeof locales;
  const isRtl = lang === "ar";

  return (
    <ConfigProvider
      direction={isRtl ? "rtl" : "ltr"}
      locale={locales[lang] ?? arEG}
      theme={{
        token: {
          colorPrimary: BRAND.primary,
          colorInfo: BRAND.primary,
          colorSuccess: BRAND.primary,
          colorWarning: BRAND.secondary,
          colorLink: BRAND.primary,
          borderRadius: 12,
          fontFamily: "inherit",
          controlHeight: 40,
          colorText: BRAND.ink,
          colorBgLayout: BRAND.surface,
        },
        components: {
          Button: {
            controlHeight: 40,
            fontWeight: 600,
            borderRadius: 12,
          },
          Card: {
            borderRadiusLG: 18,
          },
          Table: {
            headerBg: "#eef8f2",
            headerColor: "#0f5132",
            headerSplitColor: "transparent",
            rowHoverBg: "#f4fbf7",
            borderColor: "#e5eee8",
          },
          Input: {
            borderRadius: 12,
          },
          Select: {
            borderRadius: 12,
          },
          Modal: {
            borderRadiusLG: 18,
          },
          Tabs: {
            itemSelectedColor: BRAND.primary,
            inkBarColor: BRAND.primary,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
