'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/types/user';
import type { User as AuthUser } from '@supabase/supabase-js';

export function useUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Get initial auth user
    const getInitialUser = async () => {
      // Set a timeout to ensure loading doesn't get stuck
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);
        
        if (user) {
          // Fetch user profile from public.users table
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
          } else if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch updated profile
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const updateProfile = async (updates: Partial<User>) => {
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
  };

  return {
    authUser,
    profile,
    loading,
    updateProfile,
  };
}