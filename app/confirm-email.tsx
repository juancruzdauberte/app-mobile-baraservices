import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { api } from "../config/axios.config";

export default function ConfirmEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;

    setResendLoading(true);
    try {
      await api.post("/auth/resend-confirmation", { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Error al reenviar email:", error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 justify-center px-8">
        {/* Botón atrás */}
        <Pressable
          onPress={() => router.replace("/login")}
          className="absolute left-8 top-8 z-10"
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Pressable>

        {/* Icono de verificación */}
        <View className="mb-8 items-center">
          <View className="mb-6 rounded-full bg-emerald-500/20 p-6">
            <Ionicons name="mail-unread" size={64} color="#10b981" />
          </View>
        </View>

        {/* Título y descripción */}
        <View className="mb-8 items-center">
          <Text className="mb-4 text-3xl font-bold text-white">
            Verifica tu email
          </Text>
          <Text className="text-center text-base text-gray-400">
            Te hemos enviado un correo de verificación a{" "}
            <Text className="font-semibold text-emerald-400">{email}</Text>
          </Text>
        </View>

        {/* Instrucciones */}
        <View className="mb-8 rounded-2xl bg-gray-800 p-6">
          <Text className="mb-4 text-lg font-semibold text-white">
            ¿Qué debes hacer?
          </Text>
          <View className="gap-3">
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="flex-1 text-gray-300">
                Revisa tu bandeja de entrada
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="flex-1 text-gray-300">
                Busca el correo de{" "}
                <Text className="font-semibold text-white">BaraServices</Text>
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="flex-1 text-gray-300">
                Haz clic en el enlace de confirmación
              </Text>
            </View>
          </View>
        </View>

        {/* Información de spam */}
        <View className="mb-8 flex-row items-center gap-3 rounded-xl bg-amber-500/10 p-4">
          <Ionicons name="alert-circle" size={24} color="#f59e0b" />
          <Text className="flex-1 text-sm text-amber-200">
            Si no recibes el correo, revisa la carpeta de spam
          </Text>
        </View>

        {/* Botón reenviar */}
        <Pressable
          onPress={handleResendEmail}
          disabled={resendLoading || resendSuccess}
          className={`mb-6 w-full flex-row items-center justify-center gap-2 rounded-2xl border-2 border-gray-700 px-6 py-4 active:bg-gray-800 ${resendSuccess ? "border-emerald-500 bg-emerald-500/10" : ""}`}
        >
          <Ionicons
            name={resendSuccess ? "checkmark-circle" : "refresh"}
            size={20}
            color={resendSuccess ? "#10b981" : "#9ca3af"}
          />
          <Text
            className={`text-base font-semibold ${resendSuccess ? "text-emerald-500" : "text-gray-300"}`}
          >
            {resendLoading
              ? "Enviando..."
              : resendSuccess
                ? "¡Email reenviado!"
                : "Reenviar email de verificación"}
          </Text>
        </Pressable>

        {/* Botón ir a login */}
        <Pressable
          onPress={() => router.replace("/login")}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-4 active:bg-emerald-600"
        >
          <Text className="text-center text-base font-semibold text-white">
            Ya verifiqué mi email
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
