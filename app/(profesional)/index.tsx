import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";
import { useAuth } from "../../providers/AuthProvider";
import { getMyProposals, getMyWorkOrders } from "../../lib/lib";
import {
  Proposal,
  ProposalEstado,
  WorkOrder,
  WorkOrderEstado,
} from "../../types/types";

const ORDER_STATUS_COLORS: Record<
  WorkOrderEstado,
  { dot: string; text: string; label: string }
> = {
  PROGRAMADA: {
    dot: "bg-blue-400",
    text: "text-blue-400",
    label: "Programada",
  },
  EN_PROGRESO: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    label: "En progreso",
  },
  EN_DISPUTA: {
    dot: "bg-orange-400",
    text: "text-orange-400",
    label: "En disputa",
  },
  COMPLETADA: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    label: "Completada",
  },
  CANCELADA: { dot: "bg-red-400", text: "text-red-400", label: "Cancelada" },
};

const PROPOSAL_STATUS_COLORS: Record<
  ProposalEstado,
  { dot: string; text: string; label: string }
> = {
  PENDIENTE: { dot: "bg-blue-400", text: "text-blue-400", label: "Pendiente" },
  ACEPTADA: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    label: "Aceptada",
  },
  CANCELADA: { dot: "bg-red-400", text: "text-red-400", label: "Cancelada" },
  RECHAZADA: { dot: "bg-red-400", text: "text-red-400", label: "Rechazada" },
};

function RecentOrderCard({
  order,
  onPress,
}: {
  order: WorkOrder;
  onPress: () => void;
}) {
  const s = ORDER_STATUS_COLORS[order.estado] ?? ORDER_STATUS_COLORS.PROGRAMADA;
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
    >
      <View className="flex-1 mr-3">
        <Text className="text-white font-semibold text-sm" numberOfLines={1}>
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
    </TouchableOpacity>
  );
}

function RecentProposalCard({ proposal }: { proposal: Proposal }) {
  const s =
    PROPOSAL_STATUS_COLORS[proposal.estado] ?? PROPOSAL_STATUS_COLORS.PENDIENTE;
  return (
    <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center justify-between">
        <Text
          className="text-white font-semibold text-sm flex-1 mr-3"
          numberOfLines={1}
        >
          {proposal.solicitudes_trabajo?.titulo ?? "Solicitud"}
        </Text>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View className={`w-2 h-2 rounded-full ${s.dot}`} />
          <Text className={`text-xs ${s.text}`}>{s.label}</Text>
        </View>
      </View>
      {proposal.precio_estimado != null ? (
        <Text className="text-emerald-400 text-sm font-bold mt-1">
          ${proposal.precio_estimado.toLocaleString("es-AR")}
        </Text>
      ) : (
        <Text className="text-gray-500 text-sm mt-1">A coordinar</Text>
      )}
    </View>
  );
}

export default function DashboardPro() {
  const scrollProps = useGlobalTabBarScroll();
  const { profile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [proposalsData, ordersData] = await Promise.all([
        getMyProposals(),
        getMyWorkOrders(),
      ]);
      setProposals(proposalsData);
      setWorkOrders(ordersData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingProposals = proposals.filter((p) => p.estado === "PENDIENTE");
  const activeOrders = workOrders.filter(
    (o) => o.estado === "PROGRAMADA" || o.estado === "EN_PROGRESO",
  );
  const completedOrders = workOrders.filter((o) => o.estado === "COMPLETADA");
  const recentProposals = proposals.slice(0, 3);
  const recentOrders = activeOrders.slice(0, 2);
  const hasActivity = proposals.length > 0 || workOrders.length > 0;
  const rating = profile?.calificacion_promedio;

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView {...scrollProps} className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-sm font-medium">
              Hola de nuevo,
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {profile?.nombre}
            </Text>
          </View>
          {rating != null && rating > 0 && (
            <View
              className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full flex-row items-center"
              style={{ gap: 4 }}
            >
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-amber-400 font-bold text-sm">
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        {loading ? (
          <View className="items-center justify-center py-6 mb-8">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : (
          <View className="flex-row mb-8" style={{ gap: 12 }}>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons
                name="send-outline"
                size={22}
                color="#10b981"
                style={{ marginBottom: 8 }}
              />
              <Text className="text-white text-2xl font-bold">
                {pendingProposals.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Pendientes</Text>
            </View>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#f59e0b"
                style={{ marginBottom: 8 }}
              />
              <Text className="text-white text-2xl font-bold">
                {activeOrders.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Activos</Text>
            </View>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#10b981"
                style={{ marginBottom: 8 }}
              />
              <Text className="text-white text-2xl font-bold">
                {completedOrders.length}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Completados</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row mb-8" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/(profesional)/mercado" as any)}
            className="bg-emerald-500 flex-1 rounded-2xl items-center justify-center flex-row py-3.5"
            style={{ gap: 8 }}
          >
            <Ionicons name="search-outline" size={18} color="#030712" />
            <Text className="text-gray-950 font-bold text-sm">Ver mercado</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(profesional)/propuestas" as any)}
            className="bg-gray-900 border border-gray-800 flex-1 rounded-2xl items-center justify-center flex-row py-3.5"
            style={{ gap: 8 }}
          >
            <Ionicons name="document-text-outline" size={18} color="#10b981" />
            <Text className="text-emerald-400 font-bold text-sm">
              Mis propuestas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Propuestas recientes */}
        {!loading && recentProposals.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">
                Propuestas recientes
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(profesional)/propuestas" as any)}
              >
                <Text className="text-emerald-500 font-medium">Ver todas</Text>
              </TouchableOpacity>
            </View>
            {recentProposals.map((p) => (
              <RecentProposalCard key={p.id} proposal={p} />
            ))}
          </View>
        )}

        {/* Órdenes activas */}
        {!loading && recentOrders.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">
                Órdenes activas
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(profesional)/ordenes" as any)}
              >
                <Text className="text-emerald-500 font-medium">Ver todas</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((o) => (
              <RecentOrderCard
                key={o.id}
                order={o}
                onPress={() => router.push(`/orden/${o.id}` as any)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!loading && !hasActivity && (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-6 items-center mb-8">
            <Ionicons
              name="rocket-outline"
              size={40}
              color="#4b5563"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-white font-bold text-base mb-2 text-center">
              ¡Todo listo para trabajar!
            </Text>
            <Text className="text-gray-400 text-sm text-center leading-5 mb-4">
              Explorá el mercado y enviá propuestas para empezar a recibir
              órdenes.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(profesional)/mercado" as any)}
              className="bg-emerald-500 px-6 py-3 rounded-full"
            >
              <Text className="text-gray-950 font-bold">Ver oportunidades</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
