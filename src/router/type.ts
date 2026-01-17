


export interface RouteType {
  path: string;
  element: React.ReactNode;
  layout: "public" | "private";
  allowedRoles?: string[]; // Optionnel pour les routes publiques
}


