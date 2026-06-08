import { View, Text, Pressable, Alert, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Perfil() {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleClearCache = async () => {
    Alert.alert(
      "Limpiar Cache",
      "Esto cerrará tu sesión y limpiará los datos guardados. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            await signOut();
            await AsyncStorage.clear();
            router.replace("/login");
          },
        },
      ],
    );
  };

  // Obtener datos del usuario desde user_metadata de Supabase
  const nombre = profile?.nombre;
  const apellido = profile?.apellido || "";

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return "?";
  };

  // Nombre completo del usuario
  const fullName =
    nombre && apellido ? `${nombre} ${apellido}` : profile?.email || "Usuario";

  const menuItems = [
    {
      icon: "person-outline",
      label: "Editar Perfil",
      color: "#3b82f6",
      onPress: () => router.push("/editar-perfil" as any),
    },
    {
      icon: "settings-outline",
      label: "Configuración",
      color: "#8b5cf6",
      onPress: () =>
        Alert.alert("Próximamente", "Esta función estará disponible pronto."),
    },
    {
      icon: "help-circle-outline",
      label: "Ayuda y Soporte",
      color: "#10b981",
      onPress: () =>
        Alert.alert("Ayuda", "Contactanos a soporte@baraservices.com"),
    },
    {
      icon: "document-text-outline",
      label: "Términos y Condiciones",
      color: "#f59e0b",
      onPress: () => Alert.alert("Términos", "Versión 1.0.0"),
    },
    {
      icon: "shield-checkmark-outline",
      label: "Política de Privacidad",
      color: "#ec4899",
      onPress: () => Alert.alert("Privacidad", "Versión 1.0.0"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="mb-6 text-3xl font-bold text-white">Mi Perfil</Text>

        {/* Profile Card */}
        <View className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800">
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full items-center justify-center mr-4 shadow-lg">
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <Text className="text-2xl font-bold text-white">
                  {getInitials()}
                </Text>
              )}
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white mb-1">
                {fullName}
              </Text>
              <Text className="text-gray-400 text-sm mb-2">
                {profile?.email || "Sin email"}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            Configuración
          </Text>

          <View className="gap-3">
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.onPress}
                className="bg-gray-900 rounded-2xl p-4 flex-row items-center border border-gray-800 active:bg-gray-800"
              >
                <View className={`bg-gray-800 p-2 rounded-lg mr-4`}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text className="flex-1 text-white font-medium">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-8">
          <View className="gap-3">
            <Pressable
              onPress={handleSignOut}
              className="bg-red-500/10 rounded-2xl p-4 flex-row items-center border border-red-500/20 active:bg-red-500/20"
            >
              <View className="bg-red-500/20 p-2 rounded-lg mr-4">
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-red-500 font-semibold">
                  Cerrar Sesión
                </Text>
                <Text className="text-red-500/60 text-xs mt-0.5">
                  Salir de tu cuenta
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-500 text-xs">Baraservices v1.0.0</Text>
          <Text className="text-gray-600 text-xs mt-1">
            © 2026 Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
