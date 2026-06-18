import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

import { createReview, getWorkOrderById } from "../../lib/lib";
import { CreateReviewPayload, WorkOrder } from "../../types/types";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from '@/hooks/useTheme';

// ─── Star label map ────────────────────────────────────────────────────────────

const STAR_LABELS: Record<number, { text: string; textClass: string }> = {
  0: { text: "", textClass: "" },
  1: { text: "Muy malo", textClass: "text-red-400" },
  2: { text: "Malo", textClass: "text-orange-400" },
  3: { text: "Regular", textClass: "text-amber-400" },
  4: { text: "Bueno", textClass: "text-emerald-400" },
  5: { text: "¡Excelente!", textClass: "text-emerald-400 font-bold" },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResenaScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { profile } = useAuth();
  const isPro = profile?.rol === "PROFESIONAL";

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [puntaje, setPuntaje] = useState(0); // 0 = sin seleccionar
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ─── Load order ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkOrderById(orderId);
        setOrder(data);
      } catch {
        // silent — show fallback "Profesional" in UI
      } finally {
        setLoadingOrder(false);
      }
    }
    load();
  }, [orderId]);

  // ─── Submit handler ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (puntaje === 0) {
      Toast.show({ type: "error", text1: "Seleccioná una calificación" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateReviewPayload = {
        orden_trabajo_id: orderId,
        puntaje,
        comentario: comentario.trim() || undefined,
      };
      console.log(payload);
      await createReview(payload);
      setSubmitted(true);
    } catch (err: any) {
      console.log(err);
      const status = err?.response?.status;
      if (status === 409) {
        Toast.show({
          type: "info",
          text1: "Ya dejaste una reseña para esta orden.",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo enviar la reseña.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success state ────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-8">
        <Ionicons name="checkmark-circle" size={72} color="#10b981" />
        <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mt-4">
          ¡Gracias por tu reseña!
        </Text>
        <Text className="text-slate-500 dark:text-gray-400 text-sm text-center mt-2">
          Tu opinión ayuda a otros clientes a elegir mejor.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace(isPro ? "/(profesional)" : ("/(cliente)" as any))
          }
          className="bg-emerald-500 px-8 py-3 rounded-2xl mt-8"
        >
          <Text className="text-gray-950 font-bold text-base">
            Volver al inicio
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ─── Evaluated person name (depends on who is reviewing) ─────────────────────

  const evaluatedName = isPro
    ? order?.solicitudes_trabajo?.clientes?.nombre
      ? `${order.solicitudes_trabajo.clientes.nombre} ${order.solicitudes_trabajo.clientes.apellido ?? ""}`.trim()
      : "Cliente"
    : order?.propuestas?.profesionales?.nombre
      ? `${order.propuestas.profesionales.nombre} ${order.propuestas.profesionales.apellido ?? ""}`.trim()
      : "Profesional";

  const starLabel = STAR_LABELS[puntaje];

  // ─── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <View className="flex-row items-center pt-4 pb-5">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#0F172A'} />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold flex-1">
              {isPro ? "Calificar cliente" : "Calificar profesional"}
            </Text>
          </View>

          {/* ── Order info card ───────────────────────────────────────────── */}
          {loadingOrder ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
              {order?.propuestas?.profesionales?.avatar ? (
                <Image
                  source={{ uri: order.propuestas.profesionales.avatar }}
                  className="w-14 h-14 rounded-full"
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={48}
                  color="#6b7280"
                />
              )}
              <View className="flex-1">
                <Text className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">
                  Calificando a
                </Text>
                <Text className="text-gray-900 dark:text-white font-bold text-base">
                  {evaluatedName}
                </Text>
                {order?.solicitudes_trabajo?.titulo ? (
                  <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                    {order.solicitudes_trabajo.titulo}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (isPro) {
                      const clienteId = order?.solicitudes_trabajo?.clientes?.id;
                      if (clienteId) router.push(`/cliente/${clienteId}` as any);
                    } else {
                      const profesionalId = order?.propuestas?.profesionales?.id;
                      if (profesionalId) router.push(`/profesional/${profesionalId}` as any);
                    }
                  }}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Text className="text-emerald-500 text-xs mt-1">
                    Ver perfil →
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Stars section ─────────────────────────────────────────────── */}
          <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">
            Tu calificación
          </Text>

          <View className="flex-row gap-3 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                accessibilityRole="button"
                key={n}
                onPress={() => setPuntaje(n)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Ionicons
                  name={n <= puntaje ? "star" : "star-outline"}
                  size={40}
                  color={n <= puntaje ? "#f59e0b" : "#4b5563"}
                />
              </Pressable>
            ))}
          </View>

          {/* Label with reserved height */}
          <View style={{ height: 20 }}>
            {starLabel.text ? (
              <Text className={`text-sm ${starLabel.textClass}`}>
                {starLabel.text}
              </Text>
            ) : null}
          </View>

          {/* ── Comment section ───────────────────────────────────────────── */}
          <Text className="text-gray-900 dark:text-white font-bold mt-6 mb-2">
            Comentario (opcional)
          </Text>

          <TextInput
            multiline
            numberOfLines={4}
            maxLength={500}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Contá cómo fue tu experiencia..."
            placeholderTextColor="#6b7280"
            className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm"
            style={{ textAlignVertical: "top", minHeight: 100 }}
          />
          <Text className="text-gray-500 text-xs text-right mt-1">
            {comentario.length}/500
          </Text>

          {/* ── Submit button ─────────────────────────────────────────────── */}
          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={puntaje === 0 || submitting}
            className={`w-full mt-6 mb-4 py-4 rounded-2xl items-center ${
              puntaje === 0 ? "bg-slate-100 dark:bg-gray-800" : "bg-emerald-500"
            }`}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color={puntaje === 0 ? "#6b7280" : "#030712"}
              />
            ) : puntaje === 0 ? (
              <Text className="text-gray-500">Seleccioná una calificación</Text>
            ) : (
              <Text className="text-gray-950 font-bold text-base">
                Enviar reseña
              </Text>
            )}
          </Pressable>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
