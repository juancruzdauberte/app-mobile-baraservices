import { useCallback, useEffect, useState } from "react";
import {
  Pressable, ScrollView, Text, View, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";
import { useAuth } from "../../providers/AuthProvider";
import { getMyJobRequests, getMyWorkOrders, getProposalsByJobRequest } from "../../lib/lib";
import { JobRequest, WorkOrder, WorkOrderEstado } from "../../types/types";
import CreateJobRequestModal from "../../components/CreateJobRequestModal";
import { useTheme } from '@/hooks/useTheme';
import { NotificationBell } from "../../components/NotificationBell";

// ─── Local types ──────────────────────────────────────────────────────────────

type RequestWithProposalCount = {
  request: JobRequest;
  proposalCount: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<WorkOrderEstado, { dot: string; text: string; label: string }> = {
  PROGRAMADA:  { dot: "bg-blue-400",    text: "text-blue-400",    label: "Programada" },
  EN_PROGRESO: { dot: "bg-amber-400",   text: "text-amber-400",   label: "En progreso" },
  EN_DISPUTA:  { dot: "bg-orange-400",  text: "text-orange-400",  label: "En disputa" },
  COMPLETADA:  { dot: "bg-emerald-400", text: "text-emerald-400", label: "Completada" },
  CANCELADA:   { dot: "bg-red-400",     text: "text-red-400",     label: "Cancelada" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AttentionBanner({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex-row items-center"
    >
      <View className="bg-emerald-500/20 p-2.5 rounded-full mr-3">
        <Ionicons name="bulb-outline" size={20} color="#10b981" />
      </View>
      <View className="flex-1">
        <Text className="text-emerald-400 font-bold text-sm">
          ¡Tenés propuestas esperando!
        </Text>
        <Text className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
          {count === 1
            ? "1 solicitud tiene propuestas pendientes"
            : `${count} solicitudes tienen propuestas pendientes`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#10b981" />
    </Pressable>
  );
}

function ActiveRequestCard({
  item,
  onPress,
}: {
  item: RequestWithProposalCount;
  onPress: () => void;
}) {
  const { request, proposalCount } = item;

  const proposalLabel =
    proposalCount > 9
      ? "9+ propuestas"
      : proposalCount > 0
      ? `${proposalCount} ${proposalCount === 1 ? "propuesta" : "propuestas"}`
      : request.estado === "ASIGNADA"
      ? "Asignada"
      : "Sin propuestas aún";

  const chipBg =
    proposalCount > 0
      ? "bg-emerald-500/20"
      : request.estado === "ASIGNADA"
      ? "bg-amber-500/20"
      : "bg-slate-200 dark:bg-gray-800";

  const chipText =
    proposalCount > 0
      ? "text-emerald-400"
      : request.estado === "ASIGNADA"
      ? "text-amber-400"
      : "text-slate-400 dark:text-gray-500";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-gray-900 dark:text-white font-semibold text-sm"
          numberOfLines={1}
        >
          {request.titulo}
        </Text>
        <View className={`self-start mt-2 px-2.5 py-1 rounded-full ${chipBg}`}>
          <Text className={`text-xs font-semibold ${chipText}`}>
            {proposalLabel}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#4b5563" />
    </Pressable>
  );
}

function RecentOrderCard({ order, onPress }: { order: WorkOrder; onPress: () => void }) {
  const s = ORDER_STATUS_COLORS[order.estado] ?? ORDER_STATUS_COLORS.PROGRAMADA;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
    >
      <View className="flex-1 mr-3">
        <Text className="text-gray-900 dark:text-white font-semibold text-sm" numberOfLines={1}>
          {order.solicitudes_trabajo?.titulo ?? "Orden de trabajo"}
        </Text>
        <View className="flex-row items-center mt-1" style={{ gap: 6 }}>
          <View className={`w-2 h-2 rounded-full ${s.dot}`} />
          <Text className={`text-xs ${s.text}`}>{s.label}</Text>
        </View>
      </View>
      <Text className="text-emerald-400 font-bold text-sm mr-2">
        ${order.precio_final.toLocaleString("es-AR")}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#4b5563" />
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const scrollProps = useGlobalTabBarScroll();
  const { profile } = useAuth();
  const router = useRouter();
  const { colorScheme } = useTheme();

  const [showModal, setShowModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeRequests, setActiveRequests] = useState<RequestWithProposalCount[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, orders] = await Promise.all([
        getMyJobRequests({ limit: 50 }),
        getMyWorkOrders(),
      ]);

      const active = jobsRes.data.filter(
        (r) => r.estado === "ABIERTA" || r.estado === "ASIGNADA"
      );

      // Fetch proposal counts only for ABIERTA requests
      const abiertas = active.filter((r) => r.estado === "ABIERTA");
      const proposalResults = await Promise.allSettled(
        abiertas.map((r) => getProposalsByJobRequest(r.id))
      );

      const countMap = new Map<string, number>();
      abiertas.forEach((r, i) => {
        const result = proposalResults[i];
        if (result.status === "fulfilled") {
          const pending = result.value.filter((p) => p.estado === "PENDIENTE");
          countMap.set(r.id, pending.length);
        } else {
          countMap.set(r.id, 0);
        }
      });

      const enriched: RequestWithProposalCount[] = active.map((r) => ({
        request: r,
        proposalCount: countMap.get(r.id) ?? 0,
      }));

      // Sort: requests with proposals first
      enriched.sort((a, b) => b.proposalCount - a.proposalCount);

      setActiveRequests(enriched);
      setWorkOrders(orders);
    } catch {
      // silent
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const requestsWithProposals = activeRequests.filter((r) => r.proposalCount > 0);
  const visibleRequests = activeRequests.slice(0, 3);
  const ordenesEnCurso = workOrders.filter(
    (o) => o.estado === "PROGRAMADA" || o.estado === "EN_PROGRESO"
  );
  const ordenesCompletadas = workOrders.filter((o) => o.estado === "COMPLETADA");
  const recentOrders = workOrders.slice(0, 2);
  const hasActivity = activeRequests.length > 0 || workOrders.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={["top"]}>
      <ScrollView {...scrollProps} className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-500 dark:text-gray-400 text-sm font-medium">Bienvenido de vuelta,</Text>
            <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
              {profile?.nombre} {profile?.apellido}
            </Text>
          </View>
          <NotificationBell />
        </View>

        {/* Stats Row */}
        {loadingStats ? (
          <View className="items-center justify-center py-6 mb-8">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : (
          <View className="flex-row mb-8" style={{ gap: 12 }}>
            {/* Solicitudes activas */}
            <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="clipboard-outline" size={22} color="#10b981" style={{ marginBottom: 8 }} />
              <Text className="text-gray-900 dark:text-white text-2xl font-bold">{activeRequests.length}</Text>
              <Text className="text-slate-500 dark:text-gray-400 text-xs mt-1">Activas</Text>
            </View>
            {/* Órdenes en curso */}
            <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="briefcase-outline" size={22} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Text className="text-gray-900 dark:text-white text-2xl font-bold">{ordenesEnCurso.length}</Text>
              <Text className="text-slate-500 dark:text-gray-400 text-xs mt-1">En curso</Text>
            </View>
            {/* Completadas */}
            <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" style={{ marginBottom: 8 }} />
              <Text className="text-gray-900 dark:text-white text-2xl font-bold">{ordenesCompletadas.length}</Text>
              <Text className="text-slate-500 dark:text-gray-400 text-xs mt-1">Completadas</Text>
            </View>
          </View>
        )}

        {/* Attention Banner — propuestas esperando */}
        {!loadingStats && requestsWithProposals.length > 0 && (
          <AttentionBanner
            count={requestsWithProposals.length}
            onPress={() => router.push("/(cliente)/solicitudes" as any)}
          />
        )}

        {/* Solicitudes activas */}
        {!loadingStats && activeRequests.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text className="text-gray-900 dark:text-white text-lg font-bold">Tus solicitudes</Text>
                <View className="bg-slate-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  <Text className="text-slate-600 dark:text-gray-400 text-xs font-semibold">
                    {activeRequests.length}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(cliente)/solicitudes" as any)}
              >
                <Text className="text-emerald-500 font-medium">Ver todas</Text>
              </Pressable>
            </View>
            {visibleRequests.map((item) => (
              <ActiveRequestCard
                key={item.request.id}
                item={item}
                onPress={() => router.push(`/solicitud/${item.request.id}` as any)}
              />
            ))}
          </View>
        )}

        {/* Órdenes recientes */}
        {!loadingStats && recentOrders.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 dark:text-white text-lg font-bold">Órdenes recientes</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(cliente)/ordenes" as any)}
              >
                <Text className="text-emerald-500 font-medium">Ver todas</Text>
              </Pressable>
            </View>
            {recentOrders.map((order) => (
              <RecentOrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/orden/${order.id}` as any)}
              />
            ))}
          </View>
        )}

        {/* Empty state — primer uso */}
        {!loadingStats && !hasActivity && (
          <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-8">
            <Text className="text-emerald-400 font-bold text-base mb-1">
              ¡Empezá a usar BaraServices!
            </Text>
            <Text className="text-slate-600 dark:text-gray-300 text-sm leading-5">
              Creá tu primera solicitud y recibí propuestas de profesionales cerca tuyo.
            </Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* FAB */}
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowModal(true)}
        className="absolute bottom-28 right-5 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color={colorScheme === 'dark' ? '#F8FAFC' : '#0F172A'} />
      </Pressable>

      <CreateJobRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
}
