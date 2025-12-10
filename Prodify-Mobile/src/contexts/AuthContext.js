import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state listener on mount
  useEffect(() => {
    const unsubscribe = authService.initializeAuthListener((firebaseUser, profile) => {
      setUser(firebaseUser);
      setUserProfile(profile);
      setIsAuthenticated(!!firebaseUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(email, password);
      setUser(result.user);
      setUserProfile(result.profile);
      setIsAuthenticated(true);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.register(email, password, userData);
      setUser(result.user);
      setUserProfile(result.profile);
      setIsAuthenticated(true);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    try {
      setError(null);
      const profile = await authService.fetchUserProfile();
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check if current user is a manager
  const isManager = () => {
    return userProfile?.isManager || false;
  };

  // Check if current user is a programmer
  const isProgrammer = () => {
    return userProfile && !userProfile.isManager;
  };

  // Get user display name
  const getUserDisplayName = () => {
    return userProfile?.name || user?.email || 'Utilizador';
  };

  // Get user ID
  const getUserId = () => {
    return user?.uid || null;
  };

  // Context value
  const contextValue = {
    // State
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    error,

    // Methods
    login,
    register,
    logout,
    refreshUserProfile,
    clearError,

    // Helpers
    isManager,
    isProgrammer,
    getUserDisplayName,
    getUserId,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export context for direct access if needed
export default AuthContext;
