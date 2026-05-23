import { Tabs } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";
import { TabBarVisibilityProvider } from "../../components/TabBarVisibilityContext";

export default function ProfesionalTabsLayout() {
  return (
    <TabBarVisibilityProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="mercado" options={{ title: "Mercado" }} />
        <Tabs.Screen name="propuestas" options={{ title: "Propuestas" }} />
        <Tabs.Screen name="ordenes" options={{ title: "Órdenes" }} />
        <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
