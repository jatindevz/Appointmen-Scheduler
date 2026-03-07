import createContextHook from "@nkzw/create-context-hook";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { ROLES, type AppRole } from "@/constants/roles";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/domain";

import { authService } from "./auth.service";

type AuthContextValue = {
  isInitializing: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const defaultValue: AuthContextValue = {
  isInitializing: true,
  session: null,
  user: null,
  profile: null,
  role: null,
  signIn: async () => {
    return;
  },
  signUp: async () => {
    return;
  },
  signOut: async () => {
    return;
  },
  refreshProfile: async () => {
    return;
  },
};

const [AuthContext, useAuth] = createContextHook<AuthContextValue>(() => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      return;
    }

    const userProfile = await authService.getProfile(userId);
    setProfile(userProfile);
  };

  useEffect(() => {
    let mounted = true;

    authService
      .getSession()
      .then(async (restoredSession) => {
        if (!mounted) {
          return;
        }

        console.log('✓ Session restored:', restoredSession?.user?.email ?? 'no user');
        setSession(restoredSession);
        if (restoredSession?.user.id) {
          const userProfile = await authService.getProfile(restoredSession.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }
      })
      .catch((error) => {
        console.error('✗ Auth initialization error:', error);
      })
      .finally(() => {
        if (mounted) {
          console.log('✓ Auth init complete');
          setIsInitializing(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user.id) {
        const userProfile = await authService.getProfile(nextSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitializing,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      signIn: async (email, password) => {
        await authService.signIn({ email, password });
      },
      signUp: async (email, password, fullName) => {
        await authService.signUp({ email, password, fullName });
      },
      signOut: async () => {
        await authService.signOut();
        setSession(null);
        setProfile(null);
      },
      refreshProfile,
    }),
    [isInitializing, profile, session],
  );

  return value;
}, defaultValue);

export { AuthContext, ROLES, useAuth };

