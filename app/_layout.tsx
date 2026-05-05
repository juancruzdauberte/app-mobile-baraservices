import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../providers/AuthProvider";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
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
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
