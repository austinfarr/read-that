"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@/types/user";
import type { User as AuthUser } from "@supabase/supabase-js";

export function useUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
  }, []);

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
