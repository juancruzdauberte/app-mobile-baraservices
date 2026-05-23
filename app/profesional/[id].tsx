import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getProfessionalById } from "../../lib/lib";
import { PublicProfessional } from "../../types/types";

export default function ProfessionalProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [professional, setProfessional] = useState<PublicProfessional | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessionalById(id);
        setProfessional(data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (loadError || professional === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar el perfil
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setLoadError(false);
              setLoading(true);
              getProfessionalById(id)
                .then(setProfessional)
                .catch(() => setLoadError(true))
                .finally(() => setLoading(false));
            }}
            className="bg-emerald-500 px-6 py-3 rounded-full"
          >
            <Text className="text-gray-950 font-bold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const rating = professional.calificacion_promedio ?? 0;
  const hasRating = rating > 0;
  const roundedRating = Math.round(rating);

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View className="flex-row items-center pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Perfil del profesional</Text>
        </View>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 items-center">
          {/* Avatar */}
          {professional.avatar ? (
            <Image
              source={{ uri: professional.avatar }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <View
              className="bg-gray-800 border border-gray-700 items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: 40 }}
            >
              <Ionicons name="person" size={36} color="#6b7280" />
            </View>
          )}

          {/* Nombre */}
          <Text className="text-white text-xl font-bold mt-3 text-center">
            {professional.nombre} {professional.apellido}
          </Text>

          {/* Rating estrellas */}
          {hasRating ? (
            <View className="flex-row items-center mt-2" style={{ gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= roundedRating ? "star" : "star-outline"}
                  size={16}
                  color={n <= roundedRating ? "#f59e0b" : "#4b5563"}
                />
              ))}
              <Text className="text-amber-400 font-semibold ml-1">
                {rating.toFixed(1)}
              </Text>
              {professional.total_trabajos_realizados != null && (
                <Text className="text-gray-400 text-sm ml-1">
                  ({professional.total_trabajos_realizados}{" "}
                  {professional.total_trabajos_realizados === 1 ? "trabajo" : "trabajos"})
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-gray-500 text-sm mt-2">Sin calificaciones aún</Text>
          )}
        </View>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <View className="flex-row mb-4" style={{ gap: 12 }}>
          {/* Trabajos */}
          <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4 items-center">
            <Ionicons name="briefcase-outline" size={22} color="#10b981" style={{ marginBottom: 4 }} />
            <Text className="text-white text-xl font-bold">
              {professional.total_trabajos_realizados ?? 0}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">Trabajos</Text>
          </View>

          {/* Calificación */}
          <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4 items-center">
            <Ionicons name="star-outline" size={22} color="#f59e0b" style={{ marginBottom: 4 }} />
            <Text className="text-white text-xl font-bold">
              {professional.calificacion_promedio != null
                ? professional.calificacion_promedio.toFixed(1)
                : "—"}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">Calificación</Text>
          </View>
        </View>

        {/* ── Biografía ─────────────────────────────────────────────────── */}
        {professional.biografia ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <Text className="text-white font-bold mb-2">Sobre mí</Text>
            <Text className="text-gray-400 text-sm leading-5">
              {professional.biografia}
            </Text>
          </View>
        ) : null}

        {/* ── Badge verificado ──────────────────────────────────────────── */}
        {professional.estado_perfil === "ACTIVO" ? (
          <View className="flex-row items-center mb-4" style={{ gap: 6 }}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text className="text-emerald-400 text-sm font-medium">
              Profesional verificado
            </Text>
          </View>
        ) : null}

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
