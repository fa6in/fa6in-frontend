



import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const StudentLayout = () => {
  const { i18n } = useTranslation();

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex bg-green-50"
    >
      {/* Sidebar Student */}
      <aside className="w-64 bg-green-700 text-white">
        <div className="p-4 font-bold text-lg">Student Space</div>
        {/* Menu student */}
      </aside>

      <main className="flex-1 p-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Student</h1>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
