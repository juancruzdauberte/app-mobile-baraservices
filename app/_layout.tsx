import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../providers/AuthProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { useTheme } from "../hooks/useTheme";
import Toast from "react-native-toast-message";

function ThemedStatusBar() {
  const { colorScheme } = useTheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <ThemedStatusBar />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" options={{ gestureEnabled: false }} />
            <Stack.Screen name="confirm-email" />
            <Stack.Screen name="register" />
            <Stack.Screen name="onboarding-profesional" />
            <Stack.Screen name="profesional-validacion" />
            <Stack.Screen name="usuario-suspendido" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(cliente)" />
            <Stack.Screen name="(profesional)" />
            <Stack.Screen
              name="solicitud/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="orden/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="enviar-propuesta/[reqId]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="resena/[orderId]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="profesional/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="cliente/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="editar-perfil"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="editar-perfil-profesional"
              options={{ animation: "slide_from_right" }}
            />
          </Stack>
          <Toast />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
