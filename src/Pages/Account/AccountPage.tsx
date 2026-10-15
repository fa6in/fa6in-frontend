import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UpdateProfileAdmin } from "../Admin/UpdateProfile";
import { useFatinChrome } from "../../ui/FatinChrome";
import AuthService from "../../Auth-service/AuthService";

function useDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return desktop;
}

export default function AccountPage() {
  const hideForStudent = useDesktop() && AuthService.getRole() === "student";
  useFatinChrome({ subtitle: hideForStudent ? "" : "الملف الشخصي" });
  if (hideForStudent) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-lg px-4 py-4 lg:mx-0 lg:px-7">
      <UpdateProfileAdmin handleCancel={() => undefined} />
    </div>
  );
}
