import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AuthenticationService, ProfileService } from "@mediflow/mediflow-api";
import { AuthUser, mapProfileToUser } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ user: AuthUser | null; message: string | null }>;
    logout: () => void;
    isLoading: boolean;
    isInitializing: boolean;
    refreshProfile: () => Promise<AuthUser | null>;
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
        async (email: string, _password: string): Promise<{ user: AuthUser | null; message: string | null }> => {
            setIsLoading(true);
            try {
                const response = await AuthenticationService.loginViaSpa({
                    requestBody: { emailAddressOrUsername: email, password: _password }
                });
                const message = response.message || null;
                if (response.result?.isTwoFactorRequired) {
                    setIsLoading(false);
                    return { user: null, message };
                }
                const profileUser = mapProfileToUser(response.result?.profile);
                if (profileUser) {
                    setUser(profileUser);
                    setIsLoading(false);
                    return { user: profileUser, message };
                }
                const loadedUser = await loadProfile();
                setIsLoading(false);
                return { user: loadedUser, message };
            } catch (error) {
                setIsLoading(false);
                return { user: null, message: getErrorMessage(error) };
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
                isInitializing,
                refreshProfile: loadProfile
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
