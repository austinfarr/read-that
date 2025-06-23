"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@/types/user";
import type { User as AuthUser } from "@supabase/supabase-js";

export function useUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Get initial auth user
    const getInitialUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setAuthUser(user);

        if (user) {
          // Fetch user profile from public.users table
          const { data: profileData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Force session refresh for protected pages that might be OAuth redirect targets
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const isProtectedPage = ['/my-books', '/profile', '/settings'].includes(pathname);
      const maybeFromOAuth = url.searchParams.has('code') || 
                            document.referrer.includes('/auth/callback') ||
                            sessionStorage.getItem('supabase.auth.returned_from_oauth') ||
                            // Force refresh on protected pages if no auth user yet
                            (isProtectedPage && !authUser);
      
      if (maybeFromOAuth) {
        sessionStorage.removeItem('supabase.auth.returned_from_oauth');
        // Force Supabase to refresh session from cookies
        setTimeout(async () => {
          try {
            await supabase.auth.refreshSession();
            await getInitialUser();
          } catch (error) {
            console.error('Error refreshing session:', error);
            await getInitialUser();
          }
        }, 200);
      }
    }

    // Also check auth state when page becomes visible (handles OAuth redirects)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getInitialUser();
      }
    };

    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also check auth state when window gains focus
    const handleFocus = () => {
      getInitialUser();
    };

    window.addEventListener("focus", handleFocus);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        // Fetch updated profile
        const { data: profileData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [pathname]);

  const updateProfile = async (updates: Partial<User>) => {
    if (!authUser) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", authUser.id)
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
