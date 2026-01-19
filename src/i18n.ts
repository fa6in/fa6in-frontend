import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./Locales/fr.json";
import en from "./Locales/en.json";
import ar from "./Locales/ar.json";
// const LangeParDefaut = localStorage.getItem("languegChanger");

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: fr,
      },
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },
    // lng: LangeParDefaut || "ar", 
    lng: "ar",
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;