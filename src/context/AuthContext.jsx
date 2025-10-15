import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUnifiedWallet } from './UnifiedWalletContext';

const AuthContext = createContext();

const ADMIN_ADDRESSES = [
  '0x03a33E8A69f1A5b61178f70BC5c8E674aB571334',
  '0x038d0d4945cb85c59b2258699f58510604e362d47f2d80d6817d7da4cd943f84' // Most important one
];

export const AuthProvider = ({ children }) => {
  const { account } = useUnifiedWallet();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if connected wallet is in the admin list
    if (account) {
      const isUserAdmin = ADMIN_ADDRESSES.some(
        addr => addr.toLowerCase() === account.toLowerCase()
      );
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  return (
    <AuthContext.Provider value={{ isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
