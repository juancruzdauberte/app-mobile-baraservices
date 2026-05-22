import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";
import { TabBarVisibilityProvider } from "../../components/TabBarVisibilityContext";
import { useAuth } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const isSuspended = profile?.estado_perfil === "SUSPENDIDO";

  useEffect(() => {
    if (!loading && isSuspended) {
      router.replace("/usuario-suspendido");
    }
  }, [isSuspended, loading]);

  // No mostrar tabs si está suspended
  if (isSuspended) {
    return null;
  }

  return (
    <TabBarVisibilityProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Inicio" }} />
        <Tabs.Screen
          name="my-jobs-requests"
          options={{ title: "Solicitudes" }}
        />
        <Tabs.Screen name="expenses" options={{ title: "Mis Gastos" }} />
        <Tabs.Screen name="payments-history" options={{ title: "Pagos" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
