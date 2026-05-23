import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";
import { TabBarVisibilityProvider } from "../../components/TabBarVisibilityContext";
import { useAuth } from "../../providers/AuthProvider";

export default function ClienteTabsLayout() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const isSuspended = profile?.estado_perfil === "SUSPENDIDO";

  useEffect(() => {
    if (!loading && isSuspended) {
      router.replace("/usuario-suspendido");
    }
  }, [isSuspended, loading]);

  if (isSuspended) return null;

  return (
    <TabBarVisibilityProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Inicio" }} />
        <Tabs.Screen name="solicitudes" options={{ title: "Solicitudes" }} />
        <Tabs.Screen name="ordenes" options={{ title: "Órdenes" }} />
        <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
