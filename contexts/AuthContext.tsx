'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/types/user';
import type { User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{data: any, error: any}>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  
  // Create supabase client only once
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return profileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authUser) return;
    
    const profileData = await fetchProfile(authUser.id);
    if (profileData) {
      setProfile(profileData);
    }
  }, [authUser, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!authUser) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single();
      
    if (!error && data) {
      setProfile(data);
    }
    
    return { data, error };
  }, [authUser]);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted && profileData) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        setInitializing(false);
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes - only create one listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted && profileData) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        if (initializing) {
          setInitializing(false);
        }
        setLoading(false);
      }
    );
    
    authSubscription = subscription;

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Remove dependencies to prevent re-creating listeners

  const value = {
    authUser,
    profile,
    loading: loading || initializing,
    updateProfile,
    refreshProfile,
  };


  return (
    <AuthContext.Provider value={value}>
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