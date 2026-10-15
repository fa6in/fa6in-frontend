import { ConfigProvider } from "antd";
import arEG from "antd/locale/ar_EG";
import frFR from "antd/locale/fr_FR";
import enUS from "antd/locale/en_US";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const BRAND = {
  primary: "#1B7F5C",
  primaryDark: "#0F5C47",
  secondary: "#E0A526",
  ink: "#12302B",
  muted: "#4C6A63",
  surface: "#F3F7F5",
  line: "#DCE8E3",
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
            headerBg: "#E7F2ED",
            headerColor: "#0F5C47",
            headerSplitColor: "transparent",
            rowHoverBg: "#F3F7F5",
            borderColor: "#DCE8E3",
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
