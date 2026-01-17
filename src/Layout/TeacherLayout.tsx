



import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TeacherLayout = () => {
  const { i18n } = useTranslation();

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex bg-blue-50"
    >
      {/* Sidebar Teacher */}
      <aside className="w-64 bg-blue-800 text-white">
        <div className="p-4 font-bold text-lg">Teacher Space</div>
        {/* Menu teacher */}
      </aside>

      <main className="flex-1 p-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Teacher</h1>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
