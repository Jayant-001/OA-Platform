import React, { createContext, useState } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

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
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
