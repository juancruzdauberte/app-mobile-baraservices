import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Image } from "expo-image";
import {
  AVATAR_PLACEHOLDER,
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION,
} from "../../constants/image-config";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../hooks/useTheme";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getMyReviews } from "../../lib/lib";
import { Review } from "../../types/types";


export default function Perfil() {
  const { signOut, profile } = useAuth();
  const { colorScheme, isSystemDefault, setTheme } = useTheme();
  const themeIconName =
    colorScheme === "dark" ? "moon-outline" : "sunny-outline";
  const themeModeLabel = isSystemDefault
    ? `Automático (${colorScheme === "dark" ? "Oscuro" : "Claro"})`
    : colorScheme === "dark"
      ? "Oscuro"
      : "Claro";

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
            await AsyncStorage.multiRemove([
              "sb-vcbzebztlilhtomnedzw-auth-token",
              "@bara:theme_override",
            ]);
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

  // Estados para datos dinámicos
  const { refreshProfile } = useAuth();
  const [loadingFresh, setLoadingFresh] = useState(true);

  // Reseñas del propio profesional
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [myReviewsTotal, setMyReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  // Al montar la pantalla, refresca el perfil de useAuth() y trae las reseñas iniciales
  useEffect(() => {
    async function loadData() {
      try {
        await refreshProfile(); // Esto actualiza la información global (calificación y cantidad de trabajos)

        // Traer las primeras 5 reseñas
        const reviewsRes = await getMyReviews({ page: 1, limit: 5 });
        setMyReviews(reviewsRes.data);
        setMyReviewsTotal(reviewsRes.meta.total);
        setReviewsHasMore(reviewsRes.meta.page < reviewsRes.meta.totalPages);
        setReviewsPage(1);
      } catch (err) {
        console.error("Error al cargar datos en perfil propio:", err);
      } finally {
        setLoadingFresh(false);
      }
    }
    loadData();
  }, []);

  async function loadMoreMyReviews() {
    if (loadingMoreReviews || !reviewsHasMore) return;
    setLoadingMoreReviews(true);
    const nextPage = reviewsPage + 1;
    try {
      const res = await getMyReviews({ page: nextPage, limit: 5 });
      setMyReviews((prev) => [...prev, ...res.data]);
      setReviewsHasMore(res.meta.page < res.meta.totalPages);
      setReviewsPage(nextPage);
    } catch (err) {
      console.error("Error al cargar más reseñas en perfil propio:", err);
    } finally {
      setLoadingMoreReviews(false);
    }
  }

  function handleSeeLessMyReviews() {
    setMyReviews((prev) => prev.slice(0, 5));
    setReviewsPage(1);
    // Solo mostrar "Ver más" si el total real supera las 5 que quedan visibles
    setReviewsHasMore(myReviewsTotal > 5);
  }


  // Helper para renderizar estrellas de reseñas propias
  function renderStars(puntaje: number): string {
    const full = Math.min(5, Math.max(0, Math.round(puntaje)));
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  // Helper para dar formato a la fecha
  function formatReviewDate(fechaCreacion: string): string {
    return new Date(fechaCreacion).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }


  const menuItems = [
    {
      icon: "person-outline",
      label: "Editar Perfil",
      color: "#3b82f6",
      onPress: () => router.push("/editar-perfil-profesional" as any),
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
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={["top"]}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </Text>

        {/* Profile Card */}
        <View className="bg-slate-50 dark:bg-gray-900 rounded-3xl p-5 mb-6 border border-slate-200 dark:border-gray-800">
          {/* Avatar + info */}
          <View className="flex-row items-center mb-5">
            <View
              className="bg-emerald-500 rounded-full items-center justify-center mr-4"
              style={{ width: 72, height: 72, borderRadius: 36 }}
            >
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  placeholder={AVATAR_PLACEHOLDER}
                  transition={IMAGE_TRANSITION}
                  cachePolicy={IMAGE_CACHE_POLICY}
                  contentFit="cover"
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                />
              ) : (
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getInitials()}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text
                className="text-xl font-bold text-gray-900 dark:text-white mb-0.5"
                numberOfLines={1}
              >
                {fullName}
              </Text>
              <Text
                className="text-slate-500 dark:text-gray-400 text-sm"
                numberOfLines={1}
              >
                {profile?.email || "Sin email"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="border-t border-slate-200 dark:border-gray-800 mb-4" />

          {/* Stats */}
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1 bg-slate-100/60 dark:bg-gray-800/60 rounded-2xl p-3 items-center">
              <Ionicons name="star" size={18} color="#f59e0b" />
              <Text className="text-gray-900 dark:text-white text-lg font-bold mt-1">
                {profile?.calificacion_promedio
                  ? profile.calificacion_promedio.toFixed(1)
                  : "—"}
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                Calificación
              </Text>
            </View>
            <View className="flex-1 bg-slate-100/60 dark:bg-gray-800/60 rounded-2xl p-3 items-center">
              <Ionicons name="briefcase-outline" size={18} color="#10b981" />
              <Text className="text-gray-900 dark:text-white text-lg font-bold mt-1">
                {profile?.total_trabajos_realizados ?? 0}
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                Trabajos
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Reseñas Recibidas */}
        <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-5 mb-6">
          <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
            Mis Reseñas Recibidas
          </Text>

          {loadingFresh ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : myReviews.length > 0 ? (
            <View>
              {myReviews.map((review) => (
                <View
                  key={review.id}
                  className="bg-slate-100/60 dark:bg-gray-800/60 rounded-xl p-3 mb-2"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-slate-500 text-xs">
                      {formatReviewDate(review.fecha_creacion)}
                    </Text>
                    <Text className="text-amber-400 text-sm tracking-wide">
                      {renderStars(review.puntaje)}
                    </Text>
                  </View>
                  {review.comentario ? (
                    <Text className="text-slate-500 dark:text-gray-400 text-sm leading-5 italic">
                      "{review.comentario}"
                    </Text>
                  ) : null}
                </View>
              ))}

              {/* Botones Ver más / Ver menos */}
              <View className="flex-row items-center mt-3" style={{ gap: 12 }}>
                {reviewsHasMore && (
                  <Pressable
                    onPress={loadMoreMyReviews}
                    disabled={loadingMoreReviews}
                    className="flex-1 py-2 bg-slate-200/50 dark:bg-gray-800/80 rounded-xl items-center active:opacity-70"
                  >
                    {loadingMoreReviews ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Text className="text-emerald-500 dark:text-emerald-400 font-semibold text-xs">
                        Ver más reseñas
                      </Text>
                    )}
                  </Pressable>
                )}

                {reviewsPage > 1 && (
                  <Pressable
                    onPress={handleSeeLessMyReviews}
                    className="flex-1 py-2 bg-slate-200/50 dark:bg-gray-800/80 rounded-xl items-center active:opacity-70"
                  >
                    <Text className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
                      Ver menos
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Text className="text-gray-500 text-sm italic">
              Aún no has recibido calificaciones.
            </Text>
          )}
        </View>

        {/* Menu Items */}
        <View className="mb-6">
          <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
            Configuración
          </Text>

          <View className="gap-3">
            {menuItems.map((item, index) => (
              <Pressable
                accessibilityRole="button"
                key={index}
                onPress={item.onPress}
                className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4 flex-row items-center border border-slate-200 dark:border-gray-800 dark:active:bg-gray-800 active:bg-gray-200"
              >
                <View
                  className={`bg-slate-100 dark:bg-gray-800 p-2 rounded-lg mr-4`}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text className="flex-1 text-gray-900 dark:text-white font-medium">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>
            ))}

            {/* Theme Toggle */}
            <Pressable
              onPress={() =>
                setTheme(colorScheme === "dark" ? "light" : "dark")
              }
              accessibilityRole="button"
              accessibilityLabel={
                colorScheme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4 flex-row items-center border border-slate-200 dark:border-gray-800 dark:active:bg-gray-800 active:bg-gray-200"
            >
              <View className="bg-slate-100 dark:bg-gray-800 p-2 rounded-lg mr-4">
                <Ionicons
                  name={themeIconName as any}
                  size={20}
                  color={colorScheme === "dark" ? "#CBD5E1" : "#64748B"}
                />
              </View>
              <Text className="flex-1 text-gray-900 dark:text-white font-medium">
                Apariencia
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-sm">
                {themeModeLabel}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-8">
          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
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
