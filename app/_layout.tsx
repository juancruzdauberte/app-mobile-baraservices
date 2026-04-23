import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  // if (loading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         alignItems: "center",
  //         justifyContent: "center",
  //         backgroundColor: "#030712",
  //       }}
  //     >
  //       <ActivityIndicator size="large" color="#10b981" />
  //     </View>
  //   );
  // }

  return (
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
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
