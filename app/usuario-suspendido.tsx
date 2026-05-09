import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";

export default function UsuarioSuspendido() {
  const { signOut } = useAuth();

  const handleContactSupport = () => {
    // Aquí puedes agregar la lógica para abrir email, WhatsApp, etc.
    // Por ejemplo, Linking.openURL('mailto:soporte@baraservices.com')
    // O mostrar un modal con información de contacto
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 justify-center px-8 py-12">
        {/* Icono y título */}
        <View className="mb-8 items-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-red-500/20">
            <Ionicons name="alert" size={48} color="#ef4444" />
          </View>
          <Text className="mb-4 text-3xl font-bold text-white">
            Cuenta Suspendida
          </Text>
          <Text className="text-center text-base text-gray-400">
            Tu cuenta ha sido temporalmente suspendida. Esto puede deberse a una
            violación de nuestros términos de servicio o una investigación en
            curso.
          </Text>
        </View>

        {/* Información adicional */}
        <View className="mb-8 rounded-2xl bg-gray-900 p-6">
          <View className="flex-row items-center gap-3">
            <Ionicons name="information-circle" size={24} color="#f59e0b" />
            <Text className="flex-1 text-base text-gray-300">
              Si crees que esto es un error o necesitas más información,
              contacta con nuestro equipo de soporte.
            </Text>
          </View>
        </View>

        {/* Opciones */}
        <View className="gap-4">
          {/* Contactar soporte */}
          <Pressable
            onPress={handleContactSupport}
            className="w-full flex-row items-center justify-center gap-3 rounded-2xl border border-gray-700 bg-transparent px-6 py-4 active:bg-gray-800"
          >
            <Ionicons name="mail-outline" size={20} color="#10b981" />
            <Text className="text-base font-semibold text-emerald-500">
              Contactar Soporte
            </Text>
          </Pressable>

          {/* Cerrar sesión */}
          <Pressable
            onPress={handleSignOut}
            className="w-full flex-row items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 active:bg-red-700"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-base font-semibold text-white">
              Cerrar Sesión
            </Text>
          </Pressable>
        </View>

        {/* Nota inferior */}
        <View className="mt-8 items-center">
          <Text className="text-center text-sm text-gray-500">
            ¿Necesitas ayuda?{" "}
            <Text className="text-emerald-500">soporte@baraservices.com</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
