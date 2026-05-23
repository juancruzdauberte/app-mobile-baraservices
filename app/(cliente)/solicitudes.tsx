import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { getMyJobRequests } from "../../lib/lib";
import { JobRequest, JobRequestEstado, Urgencia } from "../../types/types";
import CreateJobRequestModal from "../../components/CreateJobRequestModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  Urgencia,
  { label: string; bg: string; text: string }
> = {
  BAJA: { label: "Baja", bg: "bg-emerald-500/20", text: "text-emerald-400" },
  MEDIA: { label: "Media", bg: "bg-amber-500/20", text: "text-amber-400" },
  ALTA: { label: "Alta", bg: "bg-red-500/20", text: "text-red-400" },
};

const STATUS_CONFIG: Record<
  JobRequestEstado,
  { label: string; bg: string; text: string }
> = {
  ABIERTA: {
    label: "Abierta",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
  },
  ASIGNADA: {
    label: "Asignada",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
  },
  CANCELADA: {
    label: "Cancelada",
    bg: "bg-red-500/20",
    text: "text-red-400",
  },
  EXPIRADA: {
    label: "Expirada",
    bg: "bg-gray-700/40",
    text: "text-gray-400",
  },
};

function getStatusConfig(estado: string) {
  return (
    STATUS_CONFIG[estado] ?? {
      label: estado,
      bg: "bg-gray-700/40",
      text: "text-gray-400",
    }
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({
  bg,
  text,
  label,
}: {
  bg: string;
  text: string;
  label: string;
}) {
  return (
    <View className={`px-2.5 py-1 rounded-full ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}

function JobRequestCard({
  item,
  onPress,
}: {
  item: JobRequest;
  onPress: () => void;
}) {
  const urgency = URGENCY_CONFIG[item.urgencia] ?? URGENCY_CONFIG.BAJA;
  const status = getStatusConfig(item.estado);

  const date = new Date(item.fecha_creacion).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3"
    >
      {/* Title row */}
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className="text-white font-bold text-base flex-1 mr-3"
          numberOfLines={2}
        >
          {item.titulo}
        </Text>
        <Badge bg={urgency.bg} text={urgency.text} label={urgency.label} />
      </View>

      {/* Description */}
      <Text className="text-gray-400 text-sm leading-5 mb-3" numberOfLines={2}>
        {item.descripcion}
      </Text>

      {/* Address */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>
          {item.direccion_formateada}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between border-t border-gray-800 pt-3">
        <Badge bg={status.bg} text={status.text} label={status.label} />
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color="#6b7280" />
          <Text className="text-gray-500 text-xs">{date}</Text>
          <Ionicons name="chevron-forward" size={14} color="#4b5563" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 mt-20">
      <View className="bg-gray-900 p-5 rounded-full mb-5 border border-gray-800">
        <Ionicons name="clipboard-outline" size={40} color="#4b5563" />
      </View>
      <Text className="text-white text-xl font-bold mb-2 text-center">
        Sin solicitudes aún
      </Text>
      <Text className="text-gray-400 text-sm text-center leading-5 mb-6">
        Todavía no creaste ninguna solicitud de trabajo. Tocá el botón para
        publicar tu primera solicitud.
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="bg-emerald-500 px-6 py-3 rounded-full flex-row items-center"
      >
        <Ionicons name="add" size={18} color="#030712" />
        <Text className="text-gray-950 font-bold ml-1">Nueva solicitud</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Solicitudes() {
  const router = useRouter();
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await getMyJobRequests({ limit: 50, page: 1 });
      setRequests(data);
    } catch {
      // silently fail — could show a toast if desired
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleModalSuccess = () => {
    fetchRequests();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-white text-3xl font-bold">Mis Solicitudes</Text>
        {requests.length > 0 && (
          <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-bold">
              {requests.length}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobRequestCard
              item={item}
              onPress={() => router.push(`/solicitud/${item.id}` as any)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 120,
            flexGrow: 1,
          }}
          ListEmptyComponent={<EmptyState onPress={() => setShowModal(true)} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={["#10b981"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      {!loading && requests.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="absolute bottom-28 right-5 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="#030712" />
        </TouchableOpacity>
      )}

      <CreateJobRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </SafeAreaView>
  );
}
