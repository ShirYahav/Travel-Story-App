import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import UserModel from '../Models/UserModel';
import config from '../Utils/Config';

type SafeUser = Omit<UserModel, 'password'>;

interface UserContextType {
  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      
      axios.get(config.userValidationUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
