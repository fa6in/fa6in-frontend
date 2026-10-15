import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useGetProfile } from "../Services/Profile/useGetProfile";

const TABS = [
  { to: "/", label: "الرئيسية", icon: "⌂" },
  { to: "/matieres", label: "مساري", icon: "▤" },
  { to: "/progress", label: "تقدمي", icon: "◍" },
  { to: "/account", label: "حسابي", icon: "☺" },
];

export default function StudentShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { data } = useGetProfile();
  const name = data?.first_name || "بك";
  const framed = pathname === "/" || pathname === "/progress" || pathname === "/account";
  const head =
    pathname === "/progress"
      ? { kicker: "ملخص أدائك", title: "تقدمي" }
      : pathname === "/account"
        ? { kicker: "الملف الشخصي", title: "حسابي" }
        : { kicker: "مرحبا بك", title: `أهلاً ${name}` };

  return (
    <div className="fatin-phone" dir="rtl">
      <div className="fatin-phone-inner student-frame">
        {framed && (
          <header className="bg-[#0F5C47] px-5 pb-8 pt-8 text-white">
            <p className="text-[13px] text-white/80">{head.kicker}</p>
            <h1 className="mt-1 text-[26px] font-extrabold sm:text-[28px]">{head.title}</h1>
          </header>
        )}
        <div className={`min-h-0 flex-1 ${framed ? "-mt-4" : ""}`}>{children}</div>
        <nav className="student-tabbar">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
