import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole, mockUsers, demoCredentials } from "@/mock/users";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginAs: (role: UserRole) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active");

        if (foundUser) {
            setUser(foundUser);
            setIsLoading(false);
            return true;
        }

        setIsLoading(false);
        return false;
    }, []);

    const loginAs = useCallback((role: UserRole) => {
        const credentials = demoCredentials[role];
        const foundUser = mockUsers.find((u) => u.email === credentials.email);
        if (foundUser) {
            setUser(foundUser);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                loginAs,
                logout,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
