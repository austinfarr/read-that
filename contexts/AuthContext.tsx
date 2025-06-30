'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/types/user';
import type { User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  profileLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{data: any, error: any}>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Profile fetch timeout (5 seconds)
const PROFILE_FETCH_TIMEOUT = 5000;
// Max retry attempts
const MAX_RETRY_ATTEMPTS = 3;
// Retry delay in ms
const RETRY_DELAY = 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Create supabase client only once
  const supabase = useMemo(() => createClient(), []);

  const fetchProfileWithTimeout = useCallback(async (userId: string, signal: AbortSignal): Promise<User | null> => {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(signal);
        
      if (error) {
        console.error('[Auth] Error fetching user profile:', error);
        return null;
      }
      
      return profileData;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('[Auth] Profile fetch timed out');
      } else {
        console.error('[Auth] Error fetching user profile:', error);
      }
      return null;
    }
  }, [supabase]);

  const fetchProfileWithRetry = useCallback(async (userId: string, attemptNumber = 1): Promise<User | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT);

    try {
      const profile = await fetchProfileWithTimeout(userId, controller.signal);
      clearTimeout(timeoutId);
      
      if (!profile && attemptNumber < MAX_RETRY_ATTEMPTS) {
        console.log(`[Auth] Retrying profile fetch (attempt ${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attemptNumber));
        return fetchProfileWithRetry(userId, attemptNumber + 1);
      }
      
      return profile;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Auth] Profile fetch failed:', error);
      return null;
    }
  }, [fetchProfileWithTimeout]);

  const refreshProfile = useCallback(async () => {
    if (!authUser) return;
    
    setProfileLoading(true);
    const profileData = await fetchProfileWithRetry(authUser.id);
    if (profileData) {
      setProfile(profileData);
    }
    setProfileLoading(false);
  }, [authUser, fetchProfileWithRetry]);

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
        console.log('[Auth] Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
          setAuthUser(null);
          setProfile(null);
          setInitializing(false);
          setLoading(false);
          return;
        }
        
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[Auth] User authenticated, fetching profile...');
          setProfileLoading(true);
          const profileData = await fetchProfileWithRetry(session.user.id);
          
          if (!isMounted) return;
          
          if (profileData) {
            console.log('[Auth] Profile loaded successfully');
            setProfile(profileData);
          } else {
            console.warn('[Auth] Could not load profile after retries');
            setProfile(null);
          }
          setProfileLoading(false);
        } else {
          console.log('[Auth] No authenticated user');
          setProfile(null);
        }
        
        setInitializing(false);
        setLoading(false);
      } catch (error) {
        console.error('[Auth] Error getting initial session:', error);
        if (isMounted) {
          setAuthUser(null);
          setProfile(null);
          setInitializing(false);
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes - only create one listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log(`[Auth] Auth state changed: ${event}`);
        
        // Skip if this is the initial session (already handled above)
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        setAuthUser(session?.user ?? null);
        setLoading(true);
        
        if (session?.user) {
          setProfileLoading(true);
          const profileData = await fetchProfileWithRetry(session.user.id);
          
          if (!isMounted) return;
          
          if (profileData) {
            setProfile(profileData);
          } else {
            console.warn('[Auth] Could not load profile after auth change');
            setProfile(null);
          }
          setProfileLoading(false);
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
  }, [supabase, fetchProfileWithRetry]); // Add necessary dependencies

  const value = {
    authUser,
    profile,
    loading: loading || initializing,
    profileLoading,
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