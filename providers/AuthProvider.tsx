import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.config";
import { setGlobalAuthToken } from "../config/axios.config";
import { Platform } from "react-native";
import {
  loginUser,
  registerUser,
  forgotPassword as apiForgotPassword,
  updatePassword as apiUpdatePassword,
  getProfile,
  registerDeviceToken,
} from "../lib/lib";
import { router } from "expo-router";
import { registerForPushNotificationsAsync } from "../services/notifications.service";
import { RegisterResponse, Role, UserProfile } from "../types/types";

type AuthContextType = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signIn: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<{ access_token: string; refresh_token: string }>;
  signUp: ({
    email,
    password,
    nombre,
    apellido,
    rol,
    telefono,
    dni,
  }: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: Role;
    telefono: string;
    dni: string;
  }) => Promise<RegisterResponse>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    try {
      const profileData = await getProfile();
      setProfile(profileData || null);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    console.log("[AUTH] Initializing...");

    const fetchProfile = async (currentSession: Session | null) => {
      if (currentSession) {
        try {
          const profileData = await getProfile();
          console.log("[AUTH] profileData fetched:", profileData);
          setProfile(profileData || null);

          const pushToken = await registerForPushNotificationsAsync();

          if (pushToken) {
            await registerDeviceToken({
              token: pushToken,
              plataforma: Platform.OS,
            });

            console.log("[AUTH] push token registered");
          }

        } catch (error) {
          console.log("[AUTH] Error fetching profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    };

    supabase.auth.getSession().then(async ({ data, error }) => {
      setSession(data.session ?? null);
      console.log(data.session?.access_token);
      setUser(data.session?.user ?? null);
      setGlobalAuthToken(data.session?.access_token ?? null);
      await fetchProfile(data.session ?? null);
      setLoading(false);
    });
    // cambios de auth
    const { data: authSub } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[AUTH] onAuthStateChange event:", event);
        setGlobalAuthToken(newSession?.access_token ?? null);

        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        await fetchProfile(newSession);
        setLoading(false);
      },
    );

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const data = await loginUser({ email, password });
    return data;
  };

  const signUp = async ({
    email,
    password,
    nombre,
    apellido,
    rol,
    telefono,
    dni,
  }: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: Role;
    telefono: string;
    dni: string;
  }) => {
    const data = await registerUser({
      email,
      password,
      nombre,
      apellido,
      rol,
      telefono,
      dni,
    });
    return data;
  };

  const forgotPassword = async (email: string) => {
    const data = await apiForgotPassword(email);
    return data;
  };

  const updatePassword = async (password: string) => {
    const data = await apiUpdatePassword(password);
    return data;
  };

  const value = useMemo<AuthContextType>(
    () => ({
      loading,
      session,
      user,
      profile,
      refreshProfile,
      signOut,
      signIn,
      signUp,
      forgotPassword,
      updatePassword,
    }),
    [loading, session, user, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
