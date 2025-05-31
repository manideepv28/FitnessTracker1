import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { storage } from '@/lib/storage';
import type { User, InsertUser, LoginUser } from '@shared/schema';
import { userSchema, insertUserSchema, loginSchema } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginUser) => Promise<{ success: boolean; error?: string }>;
  register: (userData: InsertUser) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginUser): Promise<{ success: boolean; error?: string }> => {
    try {
      const validCredentials = loginSchema.parse(credentials);
      const users = storage.getUsers();
      
      // Check for demo account
      if (validCredentials.email === 'demo@fittracker.com' && validCredentials.password === 'demo123') {
        const demoUser: User = {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@fittracker.com',
          password: 'demo123',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        storage.setCurrentUser(demoUser);
        return { success: true };
      }

      const foundUser = users.find(u => 
        u.email === validCredentials.email && u.password === validCredentials.password
      );

      if (foundUser) {
        setUser(foundUser);
        storage.setCurrentUser(foundUser);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password. Try demo@fittracker.com / demo123' };
      }
    } catch (error) {
      return { success: false, error: 'Invalid input data' };
    }
  };

  const register = async (userData: InsertUser): Promise<{ success: boolean; error?: string }> => {
    try {
      const validUserData = insertUserSchema.parse(userData);
      const users = storage.getUsers();
      
      // Check if email already exists
      if (users.some(u => u.email === validUserData.email)) {
        return { success: false, error: 'Email already registered' };
      }

      const newUser: User = {
        ...validUserData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      storage.saveUsers(updatedUsers);
      setUser(newUser);
      storage.setCurrentUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid input data' };
    }
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    
    // Validate the updated user
    try {
      userSchema.parse(updatedUser);
      setUser(updatedUser);
      storage.setCurrentUser(updatedUser);
      
      // Update in users list
      const users = storage.getUsers();
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      storage.saveUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}