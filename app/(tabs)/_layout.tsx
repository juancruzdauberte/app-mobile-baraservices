import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";
import { TabBarVisibilityProvider } from "../../components/TabBarVisibilityContext";
import { useAuth } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { isSuspended, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de suspensión si el usuario está suspendido
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
        <Tabs.Screen name="expenses" options={{ title: "Mis Gastos" }} />
        <Tabs.Screen name="payments-history" options={{ title: "Pagos" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
