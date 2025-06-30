"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@/types/user";
import type { User as AuthUser, Session } from "@supabase/supabase-js";

interface AuthContextType {
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  profileLoading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ data: any; error: any }>;
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

  // Track if we've completed initial setup
  const hasInitialized = useRef(false);
  const profileFetchPromise = useRef<Promise<User | null> | null>(null);

  // Create supabase client only once
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string): Promise<User | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        console.log("[Auth] Fetching profile for user:", userId);
        
        // Add timeout to the fetch
        const profilePromise = supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        const { data: profileData, error } = await Promise.race([
          profilePromise,
          new Promise<{ data: null, error: Error }>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error('Profile fetch timeout'));
            });
          })
        ]).catch(err => {
          console.error("[Auth] Profile fetch timeout or error:", err);
          return { data: null, error: err };
        });

        clearTimeout(timeoutId);

        if (error) {
          console.error("[Auth] Error fetching user profile:", error);
          return null;
        }

        console.log("[Auth] Profile fetched successfully:", profileData);
        return profileData;
      } catch (error) {
        console.error("[Auth] Caught error fetching user profile:", error);
        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!authUser) return;

    setProfileLoading(true);
    const profileData = await fetchProfile(authUser.id);
    if (profileData) {
      setProfile(profileData);
    }
    setProfileLoading(false);
  }, [authUser, fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!authUser)
        return { data: null, error: new Error("Not authenticated") };

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
    },
    [authUser, supabase]
  );

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      // Prevent double initialization
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        console.log("[Auth] Initializing auth state...");

        // Get the initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("[Auth] Session error:", error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("[Auth] Found active session");
          setAuthUser(session.user);

          // Fetch profile
          setProfileLoading(true);
          const profileData = await fetchProfile(session.user.id);

          if (!mounted) return;

          if (profileData) {
            setProfile(profileData);
          } else {
            console.warn("[Auth] Could not load profile after retries");
            setProfile(null);
          }
          setProfileLoading(false);
        } else {
          console.log("[Auth] No active session");
        }

        setLoading(false);
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
        if (mounted) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log(`[Auth] Auth state changed: ${event}`);

      // Update auth user immediately
      setAuthUser(session?.user ?? null);
      setLoading(true);

      // Handle different auth events
      switch (event) {
        case "INITIAL_SESSION":
          // Skip - already handled in initializeAuth
          setLoading(false);
          break;

        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session?.user) {
            setProfileLoading(true);
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              if (profileData) {
                setProfile(profileData);
              } else {
                console.warn("[Auth] Could not load profile for signed in user");
                setProfile(null);
              }
              setProfileLoading(false);
            }
          }
          setLoading(false);
          break;

        case "SIGNED_OUT":
          setProfile(null);
          setLoading(false);
          break;

        case "USER_UPDATED":
          // Refresh profile data
          if (session?.user) {
            await refreshProfile();
          }
          setLoading(false);
          break;

        default:
          setLoading(false);
          break;
      }
    });

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
