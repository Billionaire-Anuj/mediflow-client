import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AuthenticationService, ProfileService } from "@mediflow/mediflow-api";
import { AuthUser, mapProfileToUser } from "@/lib/auth";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthUser | null>;
    logout: () => void;
    isLoading: boolean;
    isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const loadProfile = useCallback(async (): Promise<AuthUser | null> => {
        try {
            const response = await ProfileService.getProfile();
            const profileUser = mapProfileToUser(response.result);
            setUser(profileUser);
            return profileUser;
        } catch {
            setUser(null);
            return null;
        } finally {
            setIsInitializing(false);
        }
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const login = useCallback(
        async (email: string, _password: string): Promise<AuthUser | null> => {
            setIsLoading(true);
            try {
                const response = await AuthenticationService.loginViaSpa({
                    requestBody: { emailAddressOrUsername: email, password: _password }
                });
                if (response.result?.isTwoFactorRequired) {
                    setIsLoading(false);
                    return null;
                }
                const profileUser = mapProfileToUser(response.result?.profile);
                if (profileUser) {
                    setUser(profileUser);
                    setIsLoading(false);
                    return profileUser;
                }
                const loadedUser = await loadProfile();
                setIsLoading(false);
                return loadedUser;
            } catch {
                setIsLoading(false);
                return null;
            }
        },
        [loadProfile]
    );

    const logout = useCallback(() => {
        setIsLoading(true);
        AuthenticationService.logout()
            .catch(() => undefined)
            .finally(() => {
                setUser(null);
                setIsLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                isLoading,
                isInitializing
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
