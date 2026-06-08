import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { AVATAR_PLACEHOLDER, IMAGE_CACHE_POLICY, IMAGE_TRANSITION } from "../../constants/image-config";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getProfessionalById,
  getReviewsForProfessional,
  getServicesForProfessional,
} from "../../lib/lib";
import { PublicProfessional, PublicReview, ProfessionalService } from "../../types/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStars(puntaje: number): string {
  const full = Math.min(5, Math.max(0, Math.round(puntaje)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function formatReviewDate(fechaCreacion: string): string {
  return new Date(fechaCreacion).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: PublicReview }) {
  const authorName = review.evaluador
    ? `${review.evaluador.nombre} ${review.evaluador.apellido}`
    : "Cliente";

  return (
    <View className="bg-gray-800/60 rounded-xl p-3 mb-2">
      {/* Author row */}
      <View className="flex-row items-center mb-1.5" style={{ gap: 8 }}>
        {review.evaluador?.avatar ? (
          <Image
            source={{ uri: review.evaluador.avatar }}
            placeholder={AVATAR_PLACEHOLDER}
            transition={IMAGE_TRANSITION}
            cachePolicy={IMAGE_CACHE_POLICY}
            contentFit="cover"
            style={{ width: 28, height: 28, borderRadius: 14 }}
          />
        ) : (
          <View
            className="bg-gray-700 items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 14 }}
          >
            <Ionicons name="person" size={14} color="#6b7280" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-white text-xs font-semibold">{authorName}</Text>
          <Text className="text-gray-500 text-xs">{formatReviewDate(review.fecha_creacion)}</Text>
        </View>
        <Text className="text-amber-400 text-sm tracking-wide">
          {renderStars(review.puntaje)}
        </Text>
      </View>

      {/* Comment */}
      {review.comentario ? (
        <Text className="text-gray-400 text-sm leading-5 italic">
          "{review.comentario}"
        </Text>
      ) : null}
    </View>
  );
}

export default function ProfessionalProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [professional, setProfessional] = useState<PublicProfessional | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [enrichLoading, setEnrichLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessionalById(id);
        setProfessional(data);
        // Fetch reviews + services in parallel after profile loads — fail silently
        setEnrichLoading(true);
        Promise.all([
          getReviewsForProfessional(id, 5),
          getServicesForProfessional(id),
        ])
          .then(([fetchedReviews, fetchedServices]) => {
            setReviews(fetchedReviews);
            setServices(fetchedServices);
          })
          .catch(() => {
            // Silently degrade — profile is still usable
          })
          .finally(() => setEnrichLoading(false));
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

  if (loadError || professional == null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar el perfil
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <Pressable
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
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const rating = professional.calificacion_promedio ?? 0;
  const hasRating = rating > 0;

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View className="flex-row items-center pt-4 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Perfil del profesional</Text>
        </View>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 items-center">
          {/* Avatar */}
          {professional.avatar ? (
            <Image
              source={{ uri: professional.avatar }}
              placeholder={AVATAR_PLACEHOLDER}
              transition={IMAGE_TRANSITION}
              cachePolicy={IMAGE_CACHE_POLICY}
              contentFit="cover"
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

          {/* Nombre + badge verificado inline */}
          <View className="flex-row items-center justify-center mt-3" style={{ gap: 6 }}>
            <Text className="text-white text-xl font-bold text-center">
              {professional.nombre} {professional.apellido}
            </Text>
            {professional.estado_perfil === "ACTIVO" ? (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            ) : null}
          </View>

          {/* Rating estrellas */}
          {hasRating ? (
            <View className="flex-row items-center mt-2" style={{ gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const isFull = rating >= n;
                const isHalf = !isFull && rating >= n - 0.5;
                return (
                  <Ionicons
                    key={n}
                    name={isFull ? "star" : isHalf ? "star-half" : "star-outline"}
                    size={16}
                    color={isFull || isHalf ? "#f59e0b" : "#4b5563"}
                  />
                );
              })}
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

        {/* ── Servicios ─────────────────────────────────────────────────── */}
        {enrichLoading ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 items-center">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : services.length > 0 ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <Text className="text-white font-bold mb-3">Servicios</Text>
            {services.map((service, idx) => (
              <View
                key={service.categoria_id}
                className={idx < services.length - 1 ? "mb-3 pb-3 border-b border-gray-800" : ""}
              >
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-white text-sm font-semibold flex-1 mr-2">
                    {service.nombre}
                  </Text>
                  {service.precio_base_por_hora != null ? (
                    <Text className="text-emerald-400 text-sm font-bold">
                      ${service.precio_base_por_hora.toLocaleString("es-AR")}/h
                    </Text>
                  ) : null}
                </View>
                {service.descripcion ? (
                  <Text className="text-gray-400 text-xs leading-4">
                    {service.descripcion}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Reseñas ───────────────────────────────────────────────────── */}
        {!enrichLoading && reviews.length > 0 ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-bold">Reseñas</Text>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text className="text-amber-400 text-xs font-semibold">
                  {(reviews.reduce((sum, r) => sum + r.puntaje, 0) / reviews.length).toFixed(1)}
                </Text>
                <Text className="text-gray-500 text-xs">
                  ({reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"})
                </Text>
              </View>
            </View>

            {/* Review cards */}
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        ) : null}

        {/* ── Contacto ──────────────────────────────────────────────────── */}
        {(professional.telefono || professional.email) ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Contacto
            </Text>

            {professional.telefono ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${professional.telefono}`)}
                className="flex-row items-center py-3 border-b border-gray-800"
                style={{ gap: 12 }}
              >
                <View className="w-9 h-9 rounded-full bg-emerald-500/15 items-center justify-center">
                  <Ionicons name="call-outline" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-0.5">Teléfono</Text>
                  <Text className="text-white text-sm font-medium">
                    {professional.telefono}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </Pressable>
            ) : null}

            {professional.email ? (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${professional.email}`)}
                className="flex-row items-center pt-3"
                style={{ gap: 12 }}
              >
                <View className="w-9 h-9 rounded-full bg-blue-500/15 items-center justify-center">
                  <Ionicons name="mail-outline" size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-0.5">Email</Text>
                  <Text className="text-white text-sm font-medium">
                    {professional.email}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
