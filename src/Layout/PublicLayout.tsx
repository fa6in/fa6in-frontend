

import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

type LayoutProps = {
    children: ReactNode
  }
  

const PublicLayout = ({children} : LayoutProps) => {
    const {i18n} = useTranslation()
    return (
      <div className="" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
    {/* <SidePublic/> */}
    {children}
  </div>
    )
}

export default PublicLayout







// import { Outlet } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// const PublicLayout = () => {
//   const { i18n } = useTranslation();

//   return (
//     <div
//       dir={i18n.language === "ar" ? "rtl" : "ltr"}
//       className="min-h-screen bg-gray-100 flex items-center justify-center"
//     >
//       {/* Ici tu peux ajouter un header public si tu veux */}
//       <Outlet />
//     </div>
//   );
// };

// export default PublicLayout;
