import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        // Check expiration
        const exp = decoded.exp * 1000;
        if (Date.now() >= exp) {
          logout();
        } else {
          setUser({
            email: decoded.sub,
            role: decoded.role || 'CUSTOMER', // Our backend token generator maps 'role' as claim
            name: decoded.name,
          });
        }
      } else {
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const loginUser = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ token, user, login: loginUser, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
