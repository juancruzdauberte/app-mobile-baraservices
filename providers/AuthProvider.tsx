import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.config";
import { loginUser, registerUser } from "../lib/lib";
import { Role } from "../types/types";

type AuthContextType = {
  loading: boolean;
  session: Session | null;
  user: User | null;
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
  }) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("[AUTH] Initializing...");
    // sesión inicial
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("[AUTH] getSession result:", {
        hasSession: !!data.session,
        error,
      });
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // cambios de auth
    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      },
    );

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
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

  const value = useMemo<AuthContextType>(
    () => ({
      loading,
      session,
      user,
      signOut,
      signIn,
      signUp,
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
