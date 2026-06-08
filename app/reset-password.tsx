import {
  Pressable,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validar campos vacíos
    if (!password || !confirmPassword) {
      Alert.alert(
        "Campos vacíos",
        "Por favor ingresa y confirma tu nueva contraseña",
      );
      return;
    }

    // Validar longitud mínima
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    // Validar que coincidan
    if (password !== confirmPassword) {
      Alert.alert(
        "Contraseñas no coinciden",
        "Las contraseñas ingresadas no son iguales",
      );
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);

      Alert.alert(
        "Contraseña actualizada",
        "Tu contraseña ha sido actualizada exitosamente",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error: any) {
      console.error("Reset password error:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo actualizar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8 py-12">
            {/* Icono y título */}
            <View className="mb-8 items-center">
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <Ionicons
                  name="lock-closed-outline"
                  size={40}
                  color="#10b981"
                />
              </View>
              <Text className="mb-2 text-3xl font-bold text-white">
                Nueva Contraseña
              </Text>
              <Text className="text-center text-base text-gray-400">
                Ingresa tu nueva contraseña y confírmala
              </Text>
            </View>

            {/* Formulario */}
            <View className="mb-6 w-full">
              {/* Campo nueva contraseña */}
              <View className="mb-4 w-full flex-row items-center rounded-2xl bg-gray-800 pr-4">
                <TextInput
                  className="flex-1 px-6 py-4 text-white"
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>

              {/* Campo confirmar contraseña */}
              <View className="w-full flex-row items-center rounded-2xl bg-gray-800 pr-4">
                <TextInput
                  className="flex-1 px-6 py-4 text-white"
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Botón guardar */}
            <Pressable
              onPress={handleResetPassword}
              disabled={loading}
              className="mb-4 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 active:bg-emerald-600"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? "Guardando..." : "Guardar Contraseña"}
              </Text>
            </Pressable>

            {/* Información */}
            <View className="mt-4 items-center">
              <Text className="text-center text-sm text-gray-500">
                Mínimo 6 caracteres
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
