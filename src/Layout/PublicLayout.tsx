






// import SidePublic from "./SidePublic"

import type { ReactNode } from "react"

type LayoutProps = {
    children: ReactNode
  }
  

const PublicLayout = ({children} : LayoutProps) => (
    
    <div className="">
    {/* <SidePublic/> */}
    {children}
  </div>
  )

export default PublicLayout

