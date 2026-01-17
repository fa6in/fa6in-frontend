






import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useLogout } from "./useLogout";
import AuthService from "../../Auth-service/AuthService";

export const useAutoLogout = () => {
  const { setAuthState, isAuthenticated } = useAuth();
  const timeoutRef = useRef<number | undefined>(undefined);

  const { mutate: logoutFunc } = useLogout();

  // Fonction de déconnexion (sans navigate)
  const logout = useCallback(() => {
    AuthService.clearTokens();
    setAuthState({
      loading: false,
      isAuthenticated: false,
    });

    // Redirection via window.location au lieu de useNavigate
    window.location.href = "/login";
  }, [setAuthState]);

  // Réinitialiser le timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

  
    timeoutRef.current = window.setTimeout(() => {
      logoutFunc();
      logout();

    }, 600000); 
  }, [logout]);


  const events = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
    "keydown",
    "wheel",
    "resize",
  ];

  useEffect(() => {
    // Ne s'appliquer que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      return;
    }

    // Initialiser le timer
    resetTimer();

    // Ajouter les écouteurs d'événements
    const eventHandlers = events.map(
      (event) => [event, resetTimer] as [string, EventListener]
    );

    eventHandlers.forEach(([event, handler]) => {
      document.addEventListener(event, handler);
    });

    // Nettoyer
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      eventHandlers.forEach(([event, handler]) => {
        document.removeEventListener(event, handler);
      });
    };
  }, [resetTimer, isAuthenticated]);

  return { resetTimer };
};
