import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

type LayoutProps = {
  children: ReactNode
}

const PublicLayout = ({ children }: LayoutProps) => {
  const { i18n } = useTranslation()
  return (
    <div className="" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {children}
    </div>
  )
}

export default PublicLayout

