import React, { useState, useEffect } from 'react';
import { Layout, Drawer, Button } from 'antd';
import {
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import SidebarAdmin from '../Components/Admin/SidebarAdmin';
import NavbarAdmin from '../Components/Admin/NavbarAdmin';

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { i18n } = useTranslation();
  const location = useLocation();

  // Utiliser i18n.language au lieu de localStorage pour la réactivité
  const languegChanger = i18n.language || localStorage.getItem("languegChanger") || "ar";

  // Détection du mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mettre à jour la direction quand la langue change
  useEffect(() => {
    document.documentElement.dir = languegChanger === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = languegChanger;

    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem("languegChanger", languegChanger);
  }, [languegChanger]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  const handleCollapse = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  };

  return (
    <div
      className="admin-layout-container min-h-screen bg-gray-50"
      dir={languegChanger === "ar" ? "rtl" : "ltr"}
    >
      {/* Layout Principal */}
      <div className="admin-layout flex min-h-screen">
        {/* Sidebar Desktop - Fixé à gauche/droite selon la langue */}
        {!isMobile && (
          <div
            className={`sidebar-desktop fixed h-screen z-40 ${collapsed ? 'w-28' : 'w-80'
              }`}
            style={{
              [languegChanger === "ar" ? "right" : "left"]: 0,
              top: 0
            }}
          >
            <SidebarAdmin
              collapsed={collapsed}
              onToggle={handleToggle}
              onCollapse={handleCollapse}
            />
          </div>
        )}

        {/* Sidebar Mobile (Drawer) */}
        {isMobile && (
          <Drawer
            placement={languegChanger === "ar" ? "right" : "left"}
            closable={false}
            onClose={handleCloseMobile}
            open={mobileOpen}
            width={280}
            bodyStyle={{ padding: 0 }}
            className="sidebar-drawer"
            extra={
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleCloseMobile}
                className={`drawer-close-btn ${languegChanger === "ar" ? "mr-auto" : "ml-auto"
                  }`}
                style={{
                  [languegChanger === "ar" ? "marginRight" : "marginLeft"]: 'auto'
                }}
              />
            }
          >
            <SidebarAdmin
              collapsed={false}
              onToggle={handleCloseMobile}
              onCollapse={handleCollapse}
            />
          </Drawer>
        )}

        {/* Contenu Principal */}
        <motion.main
          className={`site-layout flex-1 min-h-screen flex flex-col transition-all duration-300 ${!isMobile
            ? (collapsed
              ? (languegChanger === "ar" ? 'mr-20' : 'ml-20')
              : (languegChanger === "ar" ? 'mr-48' : 'ml-48')
            )
            : ''
            }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header avec bouton mobile */}
          <div className="header-wrapper bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className={`flex items-center justify-between px-6 py-3 ${isMobile && languegChanger === "ar" ? 'flex-row-reverse' : ''
              }`}>
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0, x: languegChanger === "ar" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mobile-menu-btn ${languegChanger === "ar" ? 'order-last' : ''
                    }`}
                >
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={handleToggle}
                    className="mobile-toggle-btn"
                  />
                </motion.div>
              )}

              <div className={`flex-1 ${isMobile ? (languegChanger === "ar" ? 'mr-4' : 'ml-4') : ''}`}>
                <NavbarAdmin
                  collapsed={collapsed}
                  onToggle={handleToggle}
                />
              </div>
            </div>
          </div>

          {/* Contenu Principal */}
          <Content className="site-content flex-1 p-6 bg-gray-50">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="content-wrapper bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-200px)]"
            >
              {children}
            </motion.div>
          </Content>

          {/* Footer */}
          {/* <motion.footer
            className="site-footer bg-white border-t border-gray-200 py-4 px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`footer-content flex flex-col md:flex-row justify-between items-center ${languegChanger === "ar" ? 'md:flex-row-reverse' : ''
              }`}>
              <div className={`footer-left ${languegChanger === "ar" ? 'md:text-right' : ''} mb-2 md:mb-0`}>
                <span className="footer-text text-gray-600 text-sm">
                  © {new Date().getFullYear()} EduPlatform. {languegChanger === "ar" ? "جميع الحقوق محفوظة." : "Tous droits réservés."}
                </span>
              </div>
              <div className="footer-right">
                <div className={`footer-links flex items-center space-x-4 ${languegChanger === "ar" ? 'space-x-reverse' : ''
                  }`}>
                  <a href="/privacy" className="footer-link text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    {languegChanger === "ar" ? "الخصوصية" : "Confidentialité"}
                  </a>
                  <span className="footer-separator text-gray-400">•</span>
                  <a href="/terms" className="footer-link text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    {languegChanger === "ar" ? "الشروط" : "Conditions"}
                  </a>
                  <span className="footer-separator text-gray-400">•</span>
                  <a href="/help" className="footer-link text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    {languegChanger === "ar" ? "مساعدة" : "Aide"}
                  </a>
                </div>
              </div>
            </div>
          </motion.footer> */}
        </motion.main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="mobile-overlay fixed inset-0 bg-black z-30"
            onClick={handleCloseMobile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;