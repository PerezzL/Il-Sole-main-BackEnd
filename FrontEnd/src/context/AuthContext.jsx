import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAuth } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const savedAuth = localStorage.getItem('isAuthenticated');
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedAuth === 'true' && savedUser && savedToken) {
          // Verificar si el token sigue siendo válido
          try {
            const response = await verifyAuth();
            if (response.authenticated) {
              setIsAuthenticated(true);
              setUser(JSON.parse(savedUser));
              setToken(savedToken);
            } else {
              // Token inválido, limpiar sesión
              logout();
            }
          } catch (error) {            logout();
          }
        }
      } catch (error) {        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Event listener para detectar cuando se cierra la página/navegador
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Marcar que la sesión debe cerrarse al cerrar la página
      sessionStorage.setItem('shouldLogout', 'true');
    };

    const handlePageShow = (event) => {
      // Si la página se carga desde cache (back/forward), verificar si debe cerrar sesión
      if (event.persisted) {
        const shouldLogout = sessionStorage.getItem('shouldLogout');
        if (shouldLogout === 'true') {
          logout();
          sessionStorage.removeItem('shouldLogout');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const login = (userData, authToken) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(authToken);
    // Guardar en localStorage para persistir la sesión
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    // Limpiar localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 