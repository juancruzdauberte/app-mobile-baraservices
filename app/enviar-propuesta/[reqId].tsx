import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { createProposal } from "../../lib/lib";

export default function EnviarPropuestaScreen() {
  const { reqId } = useLocalSearchParams<{ reqId: string }>();
  const router = useRouter();

  const [precio, setPrecio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await createProposal(reqId, {
        precio_estimado: precio ? parseFloat(precio) : undefined,
        mensaje: mensaje.trim() || undefined,
      });
      Toast.show({
        type: "success",
        text1: "Propuesta enviada",
        text2: "El cliente podrá ver tu propuesta.",
      });
      router.back();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        Toast.show({
          type: "error",
          text1: "Ya enviaste una propuesta para esta solicitud.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo enviar la propuesta.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <View className="flex-row items-center pt-4 pb-5">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <Text className="text-white text-lg font-bold flex-1">
              Nueva propuesta
            </Text>
          </View>

          {/* ── Form card ───────────────────────────────────────────────── */}
          <View className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-5">
            {/* Precio */}
            <Text className="text-white text-sm font-semibold mb-2">
              Precio estimado (opcional)
            </Text>
            <TextInput
              value={precio}
              onChangeText={setPrecio}
              keyboardType="numeric"
              placeholder="Ej: 5000"
              placeholderTextColor="#6b7280"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
            />
            <Text className="text-gray-500 text-xs mt-2 leading-4">
              Si no ingresás precio, quedará como &quot;a coordinar&quot;
            </Text>

            {/* Separador */}
            <View className="mt-5 border-t border-gray-800" />

            {/* Mensaje */}
            <Text className="text-white text-sm font-semibold mt-5 mb-2">
              Tu mensaje (opcional)
            </Text>
            <TextInput
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="Describí brevemente cómo podés ayudar, tu experiencia, o cualquier info relevante..."
              placeholderTextColor="#6b7280"
              textAlignVertical="top"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm leading-5 min-h-[100px]"
            />
            <Text className="text-gray-500 text-xs text-right mt-1">
              {mensaje.length}/500
            </Text>
          </View>

          {/* ── Submit button ────────────────────────────────────────────── */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="bg-emerald-500 py-4 rounded-2xl items-center"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#030712" />
            ) : (
              <Text className="text-gray-950 font-bold text-base">
                Enviar propuesta
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
