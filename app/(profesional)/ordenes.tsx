import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";
import { getMyWorkOrders } from "../../lib/lib";
import { WorkOrder, WorkOrderEstado } from "../../types/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  WorkOrderEstado,
  { label: string; bg: string; text: string }
> = {
  PROGRAMADA: {
    label: "Programada",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
  },
  EN_PROGRESO: {
    label: "En progreso",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
  },
  EN_DISPUTA: {
    label: "En disputa",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
  },
  COMPLETADA: {
    label: "Completada",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
  },
  CANCELADA: {
    label: "Cancelada",
    bg: "bg-red-500/20",
    text: "text-red-400",
  },
};

const STATUS_HINT: Record<WorkOrderEstado, string> = {
  PROGRAMADA: "Esperando inicio del trabajo",
  EN_PROGRESO: "Trabajo en curso",
  EN_DISPUTA: "En revisión por el equipo",
  COMPLETADA: "Completado ✓",
  CANCELADA: "Esta orden fue cancelada.",
};

// ─── WorkOrderCard ────────────────────────────────────────────────────────────

interface WorkOrderCardProps {
  order: WorkOrder;
  onPress: () => void;
}

function WorkOrderCard({ order, onPress }: WorkOrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.estado] ?? STATUS_CONFIG.PROGRAMADA;
  const hint = STATUS_HINT[order.estado];

  const titulo =
    order.solicitudes_trabajo?.titulo ?? "Orden de trabajo";

  const proNombre = order.propuestas?.profesionales
    ? `Prof. ${order.propuestas.profesionales.nombre ?? ""} ${order.propuestas.profesionales.apellido ?? ""}`.trim()
    : "Profesional asignado";

  const createdDate = new Date(order.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "short", year: "numeric" },
  );

  const scheduledDate = order.fecha_programada
    ? new Date(order.fecha_programada).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 mb-3"
    >
      {/* Top row: title + badge */}
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className="text-gray-900 dark:text-white font-semibold text-sm flex-1 mr-2"
          numberOfLines={2}
        >
          {titulo}
        </Text>
        <View className={`px-2.5 py-1 rounded-full ${statusCfg.bg}`}>
          <Text className={`text-xs font-semibold ${statusCfg.text}`}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Price */}
      {order.precio_final > 0 ? (
        <Text className="text-emerald-400 font-bold text-base mb-2">
          ${order.precio_final.toLocaleString("es-AR")}
        </Text>
      ) : null}

      {/* Professional */}
      <View className="flex-row items-center mb-1.5">
        <Ionicons name="person-outline" size={13} color="#6b7280" />
        <Text className="text-slate-500 dark:text-gray-400 text-xs ml-1.5">{proNombre}</Text>
      </View>

      {/* Scheduled date */}
      {scheduledDate && (
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={13} color="#6b7280" />
          <Text className="text-slate-500 dark:text-gray-400 text-xs ml-1.5">{scheduledDate}</Text>
        </View>
      )}

      {/* Footer: hint + creation date + chevron */}
      <View className="flex-row items-center justify-between border-t border-slate-200 dark:border-gray-800 pt-2.5">
        <Text className={`text-xs ${statusCfg.text}`}>{hint}</Text>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Text className="text-slate-400 dark:text-gray-600 text-xs">{createdDate}</Text>
          <Ionicons name="chevron-forward" size={14} color="#6b7280" />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdenesProScreen() {
  const router = useRouter();
  const scrollProps = useGlobalTabBarScroll();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyWorkOrders();
      setOrders(data);
    } catch {
      // silently fail on list — no full-screen error needed
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleRefresh() {
    setRefreshing(true);
    loadOrders(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-gray-900 dark:text-white text-3xl font-bold">Mis Órdenes</Text>
        {orders.length > 0 ? (
          <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-semibold">
              {orders.length}
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={orders}
          keyExtractor={(item) => item.id}
          {...scrollProps}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
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
            <WorkOrderCard
              order={item}
              onPress={() => router.push(`/orden/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="briefcase-outline" size={56} color="#374151" />
              <Text className="text-gray-900 dark:text-white text-lg font-bold mt-5 mb-2">
                Sin órdenes aún
              </Text>
              <Text className="text-slate-500 dark:text-gray-400 text-sm text-center leading-5 px-6">
                Cuando un cliente acepte tu propuesta, tu orden de trabajo
                aparecerá acá.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
