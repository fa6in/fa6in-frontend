





import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import AuthService from "../../Auth-service/AuthService";

type AuthState = {
    loading: boolean;
    isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
    setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        loading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        setAuthState({
            loading: false,
            isAuthenticated: AuthService.isAuthenticated(),
        });
    }, []);

    return (
        <AuthContext.Provider value={{ ...authState, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};