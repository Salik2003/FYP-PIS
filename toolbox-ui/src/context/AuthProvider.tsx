import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthUser {
    username: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): AuthUser | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { username: payload.username ?? '', name: payload.name ?? payload.username ?? 'User', role: payload.role ?? 'USER' };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<AuthUser | null>(() => {
        const t = localStorage.getItem('token');
        return t ? decodeToken(t) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setUser(decodeToken(token));
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string) => setToken(newToken);
    const logout = () => setToken(null);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
