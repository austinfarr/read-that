'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/types/user';
import type { User as AuthUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  profileLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{data: any, error: any}>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Track if we've completed initial setup
  const hasInitialized = useRef(false);
  const profileFetchPromise = useRef<Promise<User | null> | null>(null);
  
  // Create supabase client only once
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    // If there's already a profile fetch in progress, return that promise
    if (profileFetchPromise.current) {
      return profileFetchPromise.current;
    }

    // Create new fetch promise
    profileFetchPromise.current = (async () => {
      try {
        console.log('[Auth] Fetching profile for user:', userId);
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('[Auth] Error fetching user profile:', error);
          return null;
        }
        
        console.log('[Auth] Profile fetched successfully');
        return profileData;
      } catch (error) {
        console.error('[Auth] Error fetching user profile:', error);
        return null;
      } finally {
        // Clear the promise ref after completion
        profileFetchPromise.current = null;
      }
    })();

    return profileFetchPromise.current;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!authUser) return;
    
    setProfileLoading(true);
    const profileData = await fetchProfile(authUser.id);
    if (profileData) {
      setProfile(profileData);
    }
    setProfileLoading(false);
  }, [authUser, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!authUser) return { data: null, error: new Error('Not authenticated') };
    
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
  }, [authUser, supabase]);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      // Prevent double initialization
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        console.log('[Auth] Initializing auth state...');
        
        // Get the initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('[Auth] Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[Auth] Found active session');
          setAuthUser(session.user);
          
          // Fetch profile
          setProfileLoading(true);
          const profileData = await fetchProfile(session.user.id);
          
          if (!mounted) return;
          
          if (profileData) {
            setProfile(profileData);
          }
          setProfileLoading(false);
        } else {
          console.log('[Auth] No active session');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`[Auth] Auth state changed: ${event}`);
        
        // Update auth user immediately
        setAuthUser(session?.user ?? null);
        
        // Handle different auth events
        switch (event) {
          case 'INITIAL_SESSION':
            // Skip - already handled in initializeAuth
            break;
            
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              // Only fetch profile if we don't have one or if user ID changed
              if (!profile || profile.id !== session.user.id) {
                setProfileLoading(true);
                const profileData = await fetchProfile(session.user.id);
                if (mounted && profileData) {
                  setProfile(profileData);
                }
                setProfileLoading(false);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            setProfile(null);
            break;
            
          case 'USER_UPDATED':
            // Refresh profile data
            if (session?.user) {
              await refreshProfile();
            }
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    authUser,
    profile,
    loading,
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