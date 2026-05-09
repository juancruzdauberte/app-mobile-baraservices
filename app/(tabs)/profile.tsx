import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const { user, signOut } = useAuth();

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
  const userMetadata = user?.user_metadata as Record<string, any> | undefined;
  const nombre =
    userMetadata?.nombre || userMetadata?.full_name?.split(" ")[0] || "";
  const apellido =
    userMetadata?.apellido ||
    userMetadata?.full_name?.split(" ").slice(1).join(" ") ||
    "";
  const rol = userMetadata?.rol || "CLIENTE";

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

  // Nombre completo del usuario
  const fullName =
    nombre && apellido ? `${nombre} ${apellido}` : user?.email || "Usuario";

  const menuItems = [
    {
      icon: "person-outline",
      label: "Editar Perfil",
      color: "#3b82f6",
      onPress: () =>
        Alert.alert("Próximamente", "Esta función estará disponible pronto."),
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
              {user.user_metadata?.avatar ? (
                <Ionicons name="person" size={36} color="#fff" />
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
                {user?.email || "Sin email"}
              </Text>

              {/* Role Badge */}
              <View
                className={`inline-flex px-3 py-1 rounded-full ${rol === "PROFESIONAL" ? "bg-purple-500/20" : "bg-emerald-500/20"}`}
              >
                <Text
                  className={`text-xs font-semibold ${rol === "PROFESIONAL" ? "text-purple-400" : "text-emerald-400"}`}
                >
                  {rol === "PROFESIONAL" ? "Profesional" : "Cliente"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* User ID */}
        <View className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-gray-800 p-2 rounded-lg mr-3">
              <Ionicons name="key-outline" size={18} color="#6b7280" />
            </View>
            <View>
              <Text className="text-gray-400 text-xs">ID de Usuario</Text>
              <Text
                className="text-white text-sm font-medium mt-0.5"
                numberOfLines={1}
              >
                {user?.id || "Sin ID"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (user?.id) {
                // Copiar al portapapeles (funcionalidad futura)
                Alert.alert("Copiado", "ID copiado al portapapeles");
              }
            }}
            className="p-2"
          >
            <Ionicons name="copy-outline" size={20} color="#6b7280" />
          </Pressable>
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
          <Text className="text-white text-lg font-bold mb-4">
            Zona de Peligro
          </Text>

          <View className="gap-3">
            <Pressable
              onPress={handleClearCache}
              className="bg-amber-500/10 rounded-2xl p-4 flex-row items-center border border-amber-500/20 active:bg-amber-500/20"
            >
              <View className="bg-amber-500/20 p-2 rounded-lg mr-4">
                <Ionicons name="trash-outline" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-amber-500 font-semibold">
                  Limpiar Cache
                </Text>
                <Text className="text-amber-500/60 text-xs mt-0.5">
                  Borra datos locales y cierra sesión
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
            </Pressable>

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
          <Text className="text-gray-500 text-xs">BaraServices v1.0.0</Text>
          <Text className="text-gray-600 text-xs mt-1">
            © 2024 Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
