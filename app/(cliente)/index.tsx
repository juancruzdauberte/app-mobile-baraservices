import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";
import { useAuth } from "../../providers/AuthProvider";
import { useCategoriesStore } from "../../store/categorys.store";
import { getCategories, getMyJobRequests, getMyWorkOrders } from "../../lib/lib";
import { Category, WorkOrder, WorkOrderEstado } from "../../types/types";
import CreateJobRequestModal from "../../components/CreateJobRequestModal";

const CATEGORY_ICONS: Record<string, string> = {
  albañilería: "hammer-outline",
  cerrajería: "key-outline",
  jardinería: "leaf-outline",
  electricidad: "flash-outline",
  plomería: "water-outline",
  gasista: "flame-outline",
  pintura: "brush-outline",
  "fletes y mudanza": "cube-outline",
  climatización: "snow-outline",
};

function getCategoryIcon(nombre: string): string {
  return CATEGORY_ICONS[nombre.toLowerCase().trim()] ?? "construct-outline";
}

const ORDER_STATUS_COLORS: Record<WorkOrderEstado, { dot: string; text: string; label: string }> = {
  PROGRAMADA:  { dot: "bg-blue-400",    text: "text-blue-400",    label: "Programada" },
  EN_PROGRESO: { dot: "bg-amber-400",   text: "text-amber-400",   label: "En progreso" },
  EN_DISPUTA:  { dot: "bg-orange-400",  text: "text-orange-400",  label: "En disputa" },
  COMPLETADA:  { dot: "bg-emerald-400", text: "text-emerald-400", label: "Completada" },
  CANCELADA:   { dot: "bg-red-400",     text: "text-red-400",     label: "Cancelada" },
};

function RecentOrderCard({ order, onPress }: { order: WorkOrder; onPress: () => void }) {
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

export default function Home() {
  const scrollProps = useGlobalTabBarScroll();
  const { profile } = useAuth();
  const router = useRouter();
  const { categories, setCategories } = useCategoriesStore();

  const [showModal, setShowModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [solicitudesActivas, setSolicitudesActivas] = useState(0);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, orders, cats] = await Promise.all([
        getMyJobRequests({ limit: 50 }),
        getMyWorkOrders(),
        getCategories(),
      ]);
      const activas = jobsRes.data.filter(
        (r) => r.estado === "ABIERTA" || r.estado === "ASIGNADA"
      ).length;
      setSolicitudesActivas(activas);
      setWorkOrders(orders);
      setCategories(cats);
    } catch {
      // silent
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ordenesEnCurso = workOrders.filter(
    (o) => o.estado === "PROGRAMADA" || o.estado === "EN_PROGRESO"
  );
  const ordenesCompletadas = workOrders.filter((o) => o.estado === "COMPLETADA");
  const recentOrders = workOrders.slice(0, 2);
  const hasActivity = solicitudesActivas > 0 || workOrders.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView {...scrollProps} className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Bienvenido de vuelta,</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {profile?.nombre} {profile?.apellido}
            </Text>
          </View>
          <TouchableOpacity className="bg-gray-900 p-3 rounded-full border border-gray-800">
            <Ionicons name="notifications-outline" size={20} color="#f3f4f6" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-900 rounded-2xl px-4 py-3 mb-6 border border-gray-800">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="¿Qué servicio necesitás hoy?"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-white text-base font-medium"
          />
        </View>

        {/* Stats Row */}
        {loadingStats ? (
          <View className="items-center justify-center py-6 mb-8">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : (
          <View className="flex-row mb-8" style={{ gap: 12 }}>
            {/* Solicitudes activas */}
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="clipboard-outline" size={22} color="#10b981" style={{ marginBottom: 8 }} />
              <Text className="text-white text-2xl font-bold">{solicitudesActivas}</Text>
              <Text className="text-gray-400 text-xs mt-1">Activas</Text>
            </View>
            {/* Órdenes en curso */}
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="briefcase-outline" size={22} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Text className="text-white text-2xl font-bold">{ordenesEnCurso.length}</Text>
              <Text className="text-gray-400 text-xs mt-1">En curso</Text>
            </View>
            {/* Completadas */}
            <View className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 p-4">
              <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" style={{ marginBottom: 8 }} />
              <Text className="text-white text-2xl font-bold">{ordenesCompletadas.length}</Text>
              <Text className="text-gray-400 text-xs mt-1">Completadas</Text>
            </View>
          </View>
        )}

        {/* Categories */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">Categorías</Text>
            <TouchableOpacity>
              <Text className="text-emerald-500 font-medium">Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
            {categories?.map((cat: Category) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center bg-gray-900 py-4 px-2 rounded-2xl border border-gray-800 active:bg-gray-800"
                style={{ width: "31%" }}
              >
                <View className="bg-gray-800 p-3 rounded-full mb-2">
                  <Ionicons name={getCategoryIcon(cat.nombre) as any} size={24} color="#10b981" />
                </View>
                <Text className="text-gray-300 text-xs font-medium text-center">{cat.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Órdenes recientes */}
        {!loadingStats && recentOrders.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">Órdenes recientes</Text>
              <TouchableOpacity onPress={() => router.push("/(cliente)/ordenes" as any)}>
                <Text className="text-emerald-500 font-medium">Ver todas</Text>
              </TouchableOpacity>
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
            <Text className="text-gray-300 text-sm leading-5">
              Creá tu primera solicitud y recibí propuestas de profesionales cerca tuyo.
            </Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-28 right-5 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#030712" />
      </TouchableOpacity>

      <CreateJobRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
}
