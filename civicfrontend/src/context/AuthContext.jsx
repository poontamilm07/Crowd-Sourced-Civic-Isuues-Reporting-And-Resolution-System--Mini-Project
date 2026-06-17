import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken =
        localStorage.getItem('token');
      const savedUser =
        localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );
  };

  const isLoggedIn = () => {
    const t = localStorage.getItem('token');
    return !!t && !!user;
  };

  const isCitizen = () =>
    user?.role === 'CITIZEN';
  const isAdmin = () =>
    user?.role === 'ADMIN';
  const isAuthority = () =>
    user?.role === 'AUTHORITY';

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'CITIZEN':
        return '/citizen/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'AUTHORITY':
        return '/authority/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isLoggedIn,
      isCitizen,
      isAdmin,
      isAuthority,
      getDashboardRoute,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }
  return context;
};

export default AuthContext;