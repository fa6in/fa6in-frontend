import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import SidebarAdmin from '../Components/Admin/SidebarAdmin';
import NavbarAdmin from '../Components/Admin/NavbarAdmin';
import StudentShell from './StudentShell';
import AuthService from '../Auth-service/AuthService';
import { FatinChromeProvider } from '../ui/FatinChrome';

const { Content } = Layout;

const MOBILE_BREAKPOINT = 1024;
const SIDEBAR_WIDTH = {
  collapsed: 80,
  expanded: 220,
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  const language = i18n.language || localStorage.getItem('language') || 'ar';
  const isRTL = language === 'ar';

  // ===== Détection responsive =====
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ===== Langue et direction RTL/LTR =====
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language, isRTL]);

  // ===== Calcul offset sidebar desktop =====
  const sidebarOffset = useMemo(() => {
    if (isMobile) return 0;
    return collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
  }, [collapsed, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(true);
    else setCollapsed(prev => !prev);
  };

  if (AuthService.getRole() === "student" && isMobile) {
    return <StudentShell>{children}</StudentShell>;
  }

  return (
    <FatinChromeProvider>
    <div className="admin-shell min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ===== Sidebar Desktop ===== */}
      {!isMobile && (
        <SidebarAdmin
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onCollapse={setCollapsed}
        />
      )}

      {/* ===== Mobile Drawer ===== */}
      {isMobile && (
        <Drawer
          placement={isRTL ? 'right' : 'left'}
          open={mobileOpen}
          width={220}
          closable={false}
          styles={{body : {
            padding : 0
          }}}
          onClose={() => setMobileOpen(false)}
        >
          <SidebarAdmin
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onCollapse={setCollapsed}
          />
        </Drawer>
      )}

      {/* ===== Main Layout ===== */}
      <motion.main
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginLeft: !isRTL ? sidebarOffset : 0,
          marginRight: isRTL ? sidebarOffset : 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* ===== Header ===== */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md">
          <div className="flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-4 md:px-7">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleSidebar}
                className="mt-1 !h-11 !w-11 shrink-0 rounded-xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
                aria-label="القائمة"
              />
            )}
            <div className="min-w-0 flex-1">
              <NavbarAdmin collapsed={collapsed} onToggle={toggleSidebar} />
            </div>
          </div>
        </header>

        {/* ===== Content ===== */}
        <Content className="flex-1 overflow-auto px-0 py-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-[calc(100vh-140px)]"
          >
            {children}
          </motion.div>
        </Content>
      </motion.main>

      {/* ===== Mobile Overlay ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
    </FatinChromeProvider>
  );
};

export default AdminLayout;
