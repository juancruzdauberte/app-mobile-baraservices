import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Profile() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 p-6">
        <Text className="mb-6 text-3xl font-bold text-white">Mi Perfil</Text>

        <View className="mt-10 text-white">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center gap-3 rounded-2xl bg-red-500/10 py-4 active:bg-red-500/20"
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-lg font-semibold text-red-500">
              Cerrar Sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
