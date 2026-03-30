import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {mockUser} from '../utils/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        setUser(mockUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (
      (email === 'rizki@mobilejaga.id' || email === 'admin@test.com') &&
      (password === 'password123' || password === 'admin')
    ) {
      const token = 'mock_jwt_token_' + Date.now();
      await AsyncStorage.setItem('auth_token', token);
      setUser(mockUser);
      setIsAuthenticated(true);
      return {success: true};
    }

    return {success: false, error: 'Email atau password salah'};
  };

  const loginWithBiometric = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const token = 'mock_jwt_token_biometric_' + Date.now();
    await AsyncStorage.setItem('auth_token', token);
    setUser(mockUser);
    setIsAuthenticated(true);
    return {success: true};
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = updatedData => {
    setUser(prev => ({...prev, ...updatedData}));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        loginWithBiometric,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
