import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { useAuthFlowStore } from "../store/authFlow.store";
import { api } from "../config/axios.config";
import { ProfesionalStateProfile } from "../types/types";

export default function Index() {
  const { session, profile, loading } = useAuth();
  const [targetRoute, setTargetRoute] = useState<string | null>(null);
  console.log(profile);
  useEffect(() => {
    const resolvePostLogin = async () => {
      if (loading) return;

      if (!session) {
        setTargetRoute("/login");
        return;
      }

      const { pendingRole, clearPendingRole } = useAuthFlowStore.getState();

      try {
        // Si recién se registró o tenemos un rol pendiente en memoria, le damos prioridad
        if (pendingRole === "CLIENTE") {
          setTargetRoute("/(tabs)");
          return;
        }

        if (pendingRole === "PROFESIONAL") {
          setTargetRoute(getRouteByProfesionalEstado(profile?.estado_perfil));
          return;
        }

        // Si NO hay pending role, dependemos de que exista el profile en la DB.
        // if (!profile) {
        //   // Solución a bug de concurrencia:
        //   // Si Supabase tiró onAuthStateChange pero todavía no terminamos de fetchear el perfil global, esperamos.
        //   // Solo caemos en el fallback si el endpoint REALMENTE falló o vino nulo.
        //   console.warn(
        //     "[Index] Sesión detectada pero sin profile ni pendingRole. Intentando obtener de fallback...",
        //   );
        //   const usuarioResp = await fetchAuthed("/auth/profile");

        //   let fetchedRol = null;
        //   let fetchedEstado = null;

        //   if (usuarioResp.status === "fulfilled" && usuarioResp.value) {
        //     fetchedRol = usuarioResp.value.rol;
        //     fetchedEstado = usuarioResp.value.estado_perfil;
        //   }

        //   if (fetchedRol === "CLIENTE") {
        //     setTargetRoute("/(tabs)");
        //     return;
        //   }
        //   if (fetchedRol === "PROFESIONAL") {
        //     setTargetRoute(getRouteByProfesionalEstado(fetchedEstado));
        //     return;
        //   }

        //   console.warn("[Index] Fallback falló. Cerrando sesión...");
        //   await signOut();
        //   setTargetRoute("/login");
        //   return;
        // }

        if (
          profile?.rol === "CLIENTE" ||
          (profile?.rol === undefined && !profile?.estado_perfil)
        ) {
          setTargetRoute("/(tabs)");
          return;
        }

        if (
          profile?.rol === "PROFESIONAL" ||
          profile?.estado_perfil !== undefined
        ) {
          setTargetRoute(getRouteByProfesionalEstado(profile.estado_perfil));
          return;
        }

        // fallback seguro
        console.warn("[Index] Todos los flujos fallaron. Enviando a login...");
        setTargetRoute("/login");
      } catch (error) {
        console.error("[Index] Error en post-login:", error);
        setTargetRoute("/login");
      } finally {
        clearPendingRole();
      }
    };

    resolvePostLogin();
  }, [session, profile, loading]);

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
  if (estado === "SUSPENDIDO") return "/usuario-suspendido";
  if (estado === "PENDIENTE_CATEGORIAS") return "/completar-perfil-profesional";
  if (estado === "ACTIVO") return "/(tabs)";
  return "/profesional-validacion";
}

async function fetchAuthed(path: string) {
  const { data } = await api.get(path);
  return data;
}
