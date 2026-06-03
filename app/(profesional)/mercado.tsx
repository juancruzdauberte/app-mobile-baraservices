import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { getCategories, getMyJobRequests } from "../../lib/lib";
import { Category, JobRequest, Urgencia } from "../../types/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  Urgencia,
  { label: string; bg: string; text: string }
> = {
  BAJA: { label: "Baja", bg: "bg-emerald-500/20", text: "text-emerald-400" },
  MEDIA: { label: "Media", bg: "bg-amber-500/20", text: "text-amber-400" },
  EMERGENCIA: { label: "Alta", bg: "bg-red-500/20", text: "text-red-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeAgo(fechaCreacion: string): string {
  const diff = Date.now() - new Date(fechaCreacion).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Hace menos de 1 hora";
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}

// ─── MarketJobCard ────────────────────────────────────────────────────────────

interface MarketJobCardProps {
  item: JobRequest;
  categoryName?: string;
  onPress: () => void;
}

function MarketJobCard({ item, categoryName, onPress }: MarketJobCardProps) {
  const urgencyCfg = item.urgencia
    ? (URGENCY_CONFIG[item.urgencia] ?? URGENCY_CONFIG.BAJA)
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3"
    >
      {/* Top row: title + urgency badge */}
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className="text-white font-semibold text-sm flex-1 mr-2"
          numberOfLines={2}
        >
          {item.titulo}
        </Text>
        {urgencyCfg ? (
          <View className={`px-2.5 py-1 rounded-full ${urgencyCfg.bg}`}>
            <Text className={`text-xs font-semibold ${urgencyCfg.text}`}>
              {urgencyCfg.label}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Category badge */}
      {categoryName ? (
        <View className="flex-row items-center mb-2" style={{ gap: 4 }}>
          <Ionicons name="pricetag-outline" size={13} color="#6b7280" />
          <View className="bg-gray-800 px-2 py-0.5 rounded-full">
            <Text className="text-gray-400 text-xs font-semibold">
              {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Description */}
      {item.descripcion ? (
        <Text
          className="text-gray-400 text-sm leading-5 mb-2"
          numberOfLines={2}
        >
          {item.descripcion}
        </Text>
      ) : null}

      {/* Address */}
      {item.direccion_formateada ? (
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={13} color="#6b7280" />
          <Text
            className="text-gray-400 text-xs ml-1.5 flex-1"
            numberOfLines={1}
          >
            {item.direccion_formateada}
          </Text>
        </View>
      ) : null}

      {/* Footer: time ago + chevron */}
      <View className="flex-row items-center justify-between border-t border-gray-800 pt-2.5 mt-1">
        <Text className="text-gray-500 text-xs">
          {getTimeAgo(item.fecha_creacion)}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MercadoScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState<Urgencia | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchRequests = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [result, cats] = await Promise.all([
          getMyJobRequests({
            estado: "ABIERTA",
            limit: 20,
            page: 1,
            ...(selectedUrgency ? { urgencia: selectedUrgency } : {}),
          }),
          categories.length === 0
            ? getCategories()
            : Promise.resolve(categories),
        ]);
        setRequests(result.data);
        if (categories.length === 0) setCategories(cats as Category[]);
      } catch {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudieron cargar las solicitudes.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedUrgency],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  function handleRefresh() {
    setRefreshing(true);
    fetchRequests(true);
  }

  const urgencyFilters: Array<{ key: Urgencia | null; label: string }> = [
    { key: null, label: "Todos" },
    { key: "EMERGENCIA", label: "Alta" },
    { key: "MEDIA", label: "Media" },
    { key: "BAJA", label: "Baja" },
  ];

  const filteredRequests = selectedCategory
    ? requests.filter((r) => r.categoria_id === selectedCategory)
    : requests;

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-3xl font-bold">Mercado</Text>
        {filteredRequests.length > 0 ? (
          <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-semibold">
              {filteredRequests.length}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Urgency filter chips ─────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 8,
          alignItems: "center",
        }}
      >
        {urgencyFilters.map((f) => {
          const isActive = selectedUrgency === f.key;
          return (
            <TouchableOpacity
              key={f.key ?? "all"}
              onPress={() => setSelectedUrgency(f.key)}
              className={`mr-2 px-4 py-2 rounded-full ${
                isActive
                  ? "bg-emerald-500"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-gray-950" : "text-gray-400"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Category filter chips ────────────────────────────────────────── */}
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 8,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedCategory === null
                ? "bg-gray-700"
                : "bg-gray-900 border border-gray-800"
            }`}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                selectedCategory === null ? "text-white" : "text-gray-400"
              }`}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  isActive
                    ? "bg-gray-700"
                    : "bg-gray-900 border border-gray-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold capitalize ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {/* ── List ────────────────────────────────────────────────────────── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          className="mt-5"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
            />
          }
          renderItem={({ item }) => (
            <MarketJobCard
              item={item}
              categoryName={
                categories.find((c) => c.id === item.categoria_id)?.nombre
              }
              onPress={() => router.push(`/solicitud/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="search-outline" size={56} color="#374151" />
              <Text className="text-white text-lg font-bold mt-5 mb-2">
                Sin oportunidades disponibles
              </Text>
              <Text className="text-gray-400 text-sm text-center leading-5 px-6">
                No hay solicitudes en tu categoría por el momento. Volvé a
                revisar más tarde.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
