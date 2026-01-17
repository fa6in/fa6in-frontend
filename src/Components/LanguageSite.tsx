


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface LanguageSiteProps {
  className?: string;
}

const LanguageSite: React.FC<LanguageSiteProps> = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);

  const languegChanger = localStorage.getItem("languegChanger");
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("languegChanger", lang);
    setLanguageOpen(false);
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

  return (
    <div className={`relative ${className}`}>
      <motion.button
        className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:!text-main-color hover:border-main-color/30 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguageOpen(!languageOpen)}
      >
        <GlobalOutlined className="text-lg" />
      </motion.button>

      <AnimatePresence>
        {languageOpen && (
          <motion.div
            className={`absolute ${
              i18n.language === "ar" ? "left-0" : "right-0"
            } top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50`}
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <button
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-200 ${
                i18n.language === "fr" ? "!text-main-color font-medium" : "text-gray-700"
              } ${
                i18n.language === "ar" ? "flex-row-reverse" : ""
              }`}
              onClick={() => handleLanguageChange("fr")}
            >
              <span>🇫🇷 Français</span>
              {i18n.language === "fr" && (
                <div className={`w-2 h-2 rounded-full !bg-main-color ${
                  languegChanger === "ar" ? "mr-2" : ""
                }`}></div>
              )}
            </button>
           
            <button
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-200 ${
                i18n.language === "ar" ? "!text-main-color font-medium" : "text-gray-700"
              } ${
                i18n.language === "ar" ? "flex-row-reverse" : ""
              }`}
              onClick={() => handleLanguageChange("ar")}
            >
              <span>🇸🇦 العربية</span>
              {i18n.language === "ar" && (
                <div className={`w-2 h-2 rounded-full !bg-main-color ${
                  i18n.language === "ar" ? "mr-2" : ""
                }`}></div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour fermer le dropdown */}
      <AnimatePresence>
        {languageOpen && (
          <motion.div
            className="fixed inset-0 bg-black/5 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLanguageOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSite;