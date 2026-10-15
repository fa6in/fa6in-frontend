import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type Action = { label: string; onClick: () => void };

type Chrome = {
  subtitle: string;
  action: Action | null;
  query: string;
  setQuery: (value: string) => void;
  setSubtitle: (value: string) => void;
  setAction: (value: Action | null) => void;
};

const ChromeContext = createContext<Chrome | null>(null);

export function FatinChromeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [subtitle, setSubtitle] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSubtitle("");
    setAction(null);
    setQuery("");
  }, [pathname]);

  return (
    <ChromeContext.Provider value={{ subtitle, action, query, setQuery, setSubtitle, setAction }}>
      {children}
    </ChromeContext.Provider>
  );
}

export function useFatinChrome(options: { subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  const ctx = useContext(ChromeContext);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const { subtitle = "", actionLabel, onAction } = options;

  useEffect(() => {
    const current = ctxRef.current;
    if (!current) return;
    current.setSubtitle(subtitle);
    current.setAction(actionLabel && onAction ? { label: actionLabel, onClick: onAction } : null);
  }, [subtitle, actionLabel, onAction]);
}

export function useFatinQuery() {
  return useContext(ChromeContext)?.query ?? "";
}

export function useFatinChromeState() {
  return useContext(ChromeContext);
}
