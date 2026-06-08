import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

export default function ProfesionalValidacionScreen() {
  const { signOut } = useAuth();

  const handleRefresh = () => {
    router.replace("/");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/20">
          <Ionicons name="time-outline" size={48} color="#f59e0b" />
        </View>

        <Text className="mb-2 text-center text-3xl font-bold text-white">
          Perfil en validación
        </Text>

        <Text className="mb-8 text-center text-base text-gray-300">
          Tu perfil profesional fue enviado correctamente y está siendo revisado
          por el equipo. El tiempo estimado de validación es de 48 horas hábiles.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={handleRefresh}
          className="mb-4 w-full rounded-2xl bg-emerald-600 px-6 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">
            Revalidar estado
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          className="w-full rounded-2xl border border-gray-700 px-6 py-4"
        >
          <Text className="text-center text-base font-semibold text-gray-200">
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
