import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { useAuthFlowStore } from "../store/authFlow.store";
import { api } from "../config/axios.config";
import { ProfesionalStateProfile } from "../types/types";

export default function Index() {
  const { session, user, loading } = useAuth();
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  // user tiene: id, email, user_metadata, etc.
  // session tiene: access_token, refresh_token
  console.log("Usuario:", user);
  console.log("Email:", user?.email);
  console.log("Token:", session?.access_token);
  useEffect(() => {
    const resolvePostLogin = async () => {
      if (loading) return;

      if (!session) {
        setTargetRoute("/login");
        return;
      }

      const { pendingRole, clearPendingRole } = useAuthFlowStore.getState();

      try {
        if (pendingRole === "CLIENTE") {
          setTargetRoute("/(tabs)");
          return;
        }

        if (pendingRole === "PROFESIONAL") {
          const perfilResp = await fetchAuthed("/professionals/profile").catch(
            () => null,
          );
          setTargetRoute(
            getRouteByProfesionalEstado(perfilResp?.estado_perfil),
          );
          return;
        }

        // Sesión persistida sin pendingRole: inferimos estado desde backend
        const [usuarioResp, profesionalResp] = await Promise.allSettled([
          fetchAuthed("/users/profile"),
          fetchAuthed("/professionals/profile"),
        ]);

        if (
          profesionalResp.status === "fulfilled" &&
          profesionalResp.value?.estado_perfil
        ) {
          setTargetRoute(
            getRouteByProfesionalEstado(profesionalResp.value.estado_perfil),
          );
          return;
        }

        if (
          usuarioResp.status === "fulfilled" &&
          usuarioResp.value?.rol === "CLIENTE"
        ) {
          setTargetRoute("/(tabs)");
          return;
        }

        // fallback seguro
        setTargetRoute("/login");
      } catch (error) {
        console.error("[Index] Error en post-login:", error);
        const { supabase } = await import("../config/supabase.config");
        await supabase.auth.signOut();
        setTargetRoute("/login");
      } finally {
        clearPendingRole();
      }
    };

    if (!loading && !session) {
      setTargetRoute("/login");
    }
    resolvePostLogin();
  }, [session, loading]);

  if (targetRoute) {
    return <Redirect href={targetRoute as any} />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-950">
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}

function getRouteByProfesionalEstado(estado?: ProfesionalStateProfile): string {
  if (!estado || estado === "INCOMPLETO") return "/onboarding-profesional";
  if (estado === "PENDIENTE_APROBACION") return "/profesional-validacion";
  if (estado === "PENDIENTE_CATEGORIAS") return "/completar-perfil-profesional";
  if (estado === "ACTIVO") return "/(tabs)";
  return "/profesional-validacion";
}

async function fetchAuthed(path: string) {
  const { data } = await api.get(path);
  return data;
}
