import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from '../types';

// dados que serão compartilhados
interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isStaff: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

// Contexto react
const AuthContext = createContext<AuthContextData>({} as AuthContextData);


// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Carregar usuário do localStorage ao iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('@ticketon:user');
        const storedToken = localStorage.getItem('@ticketon:token');

        // verifica se existe usuário e token
        if(storedUser && storedToken){
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }

        setLoading(false);
    }, []);

    // Função de Login
    const login = useCallback((token: string, user: User) => {
        setToken(token);
        setUser(user);
        
        localStorage.setItem('@ticketon:token', token);
        localStorage.setItem('@ticketon:user', JSON.stringify(user));
    }, []);

    // Função de Logout
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);

        localStorage.removeItem('@ticketon:token');
        localStorage.removeItem('@ticketon:user');
    }, []);

    // Getters
    const isAuthenticated = !!user && !!token;
    const isOrganizer = user?.role === 'ORGANIZER';
    const isStaff = user?.role === 'STAFF';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isOrganizer,
                isStaff,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// Hook para usar o AuthContext
export const useAuth = (): AuthContextData => {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
    }
    return context;
};