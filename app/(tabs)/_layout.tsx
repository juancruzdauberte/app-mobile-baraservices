import { Tabs } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";
import { TabBarVisibilityProvider } from "../../components/TabBarVisibilityContext";

export default function TabsLayout() {
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
