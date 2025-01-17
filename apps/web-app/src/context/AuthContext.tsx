import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useCommonApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { fetchProfile, logout: logoutApi } = useCommonApi();
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

    useEffect(() => {
        if(user) return;
        (async () => {
            setLoadingProfile(true);
            try {
                const { id, email, name, role } = await fetchProfile();
                setUser({ id, email, name, role });
    
                if (role == "admin") navigate("/dashboard");
                else if (role == user) navigate("/");
                
            } catch (error) {
                navigate('/login')
            }
            finally {
                setLoadingProfile(false);
            }
        })();
    }, []);

    const login = async (email: string, password: string) => {
        // Implement API call
        // Set user after successful login
        setUser({
            id: "lksdjf",
            email,
            name: "lksjdf",
            role: "admin",
        });
        navigate("/admin");
    };

    const register = async (email: string, password: string, name: string) => {
        // Implement API call
        // Set user after successful registration
        setUser({
            id: "93939",
            email,
            name,
            role: "user",
        });
        navigate("/");
    };

    const logout = () => {
        (async () => {
            try {
                const res = await logoutApi();
                toast.success(res.message)
                setUser(null);
                navigate('/login')
            } catch (error) {
                console.log(error);
            }
        })();
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
