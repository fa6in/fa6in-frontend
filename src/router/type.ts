


// export interface RouteType {
//   path: string;
//   element: React.ReactNode;
//   layout: "public" | "private";
//   allowedRoles?: string[]; 
// }


export interface RouteType {
  path: string;
  element: React.ReactNode;
  layout: "public" | "private";
  allowedRoles?: string[];

  sidebar?: {
    key: string;
    label: string; 
    icon: React.ReactNode;
  };
}
