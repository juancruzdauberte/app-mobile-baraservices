import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo / App Name */}
        <View className="mb-12 items-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/20">
            <Ionicons name="wallet-outline" size={48} color="#10b981" />
          </View>
          <Text className="mb-2 text-4xl font-bold text-white">
            Baraservices
          </Text>
          <Text className="text-center text-base text-gray-400">
            Administrá tus servicios de forma simple y compartida
          </Text>
        </View>

        {/* Botón — idéntico a onPress={() => promptAsync()} del repo */}
        <Pressable className="mb-4 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 active:bg-gray-200">
          <Ionicons name="logo-google" size={22} color="#1f2937" />
          <Text className="text-base font-semibold text-gray-800">
            Continuar con Google
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)")}>
          <Text className="text-base font-semibold text-gray-800">
            Modo Test
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
