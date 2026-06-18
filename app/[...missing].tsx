import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";

export default function MissingRoute() {
  useEffect(() => {
    // Si caemos acá por un deep link raro, mandamos a la raíz para que el flujo principal resuelva
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}
