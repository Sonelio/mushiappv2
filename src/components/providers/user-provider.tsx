"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/auth-helpers-nextjs';

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {}
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const supabase = createClientComponentClient();

  const refreshUser = async () => {
    console.log('Refreshing user');
    try {
      const { data } = await supabase.auth.getUser();
      console.log('User data fetched:', data);
      setUser(data.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      console.log('Finished refreshing user');
      setIsLoading(false);
    }
  };

  // Initial setup and auth state change listener
  useEffect(() => {
    const initialFetch = async () => {
      console.log('Initial user fetch');
      try {
        const { data } = await supabase.auth.getUser();
        console.log('Initial user data:', data);
        setUser(data.user);
      } catch (error) {
        console.error('Error in initial fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => {
        console.log('Auth state changed, incrementing refresh attempt');
        setRefreshAttempt(prev => prev + 1);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (refreshAttempt > 0) {
      console.log('Handling refresh attempt:', refreshAttempt);
      refreshUser();
    }
  }, [refreshAttempt]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout reached, setting loading to false');
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
} 