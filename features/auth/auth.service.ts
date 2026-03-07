import AsyncStorage from "@react-native-async-storage/async-storage";

import { ROLES, type AppRole } from "@/constants/roles";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/domain";

type AuthCredentials = {
  email: string;
  password: string;
};

type SignUpInput = AuthCredentials & {
  fullName: string;
};

function mapRole(role: string | null | undefined): AppRole {
  return role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CLIENT;
}

export const authService = {
  async signIn({ email, password }: AuthCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    return data;
  },

  async signUp({ email, password, fullName }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: "global" });

    const keys = await AsyncStorage.getAllKeys();
    const supabaseKeys = keys.filter((key) => key.startsWith("sb-"));
    if (supabaseKeys.length > 0) {
      await Promise.all(supabaseKeys.map((key) => AsyncStorage.removeItem(key)));
    }

    if (error) {
      throw error;
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    return data.session;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("id, full_name, role, created_at").eq("id", userId).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }

      throw error;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      role: mapRole(data.role),
      createdAt: data.created_at,
    };
  },
};
