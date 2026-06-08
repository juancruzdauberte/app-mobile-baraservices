import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { JobRequest, JobRequestEstado, Urgencia } from "../types/types";

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
  COMPLETA: {
    label: "Completada",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
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

// ─── Component ────────────────────────────────────────────────────────────────

interface RequestListItemProps {
  request: JobRequest;
  onPress: (requestId: string) => void;
}

function RequestListItemComponent({ request, onPress }: RequestListItemProps) {
  const urgency = URGENCY_CONFIG[request.urgencia] ?? URGENCY_CONFIG.BAJA;
  const status = getStatusConfig(request.estado);

  const date = new Date(request.fecha_creacion).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={() => onPress(request.id)}
      className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`Solicitud: ${request.titulo}`}
      accessibilityHint="Toca para ver detalles de la solicitud"
    >
      {/* Title row */}
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className="text-white font-bold text-base flex-1 mr-3"
          numberOfLines={2}
        >
          {request.titulo}
        </Text>
        <Badge bg={urgency.bg} text={urgency.text} label={urgency.label} />
      </View>

      {/* Description */}
      <Text className="text-gray-400 text-sm leading-5 mb-3" numberOfLines={2}>
        {request.descripcion}
      </Text>

      {/* Address */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>
          {request.direccion_formateada}
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
    </Pressable>
  );
}

// ─── Memoization ──────────────────────────────────────────────────────────────

/**
 * Custom comparator to prevent unnecessary re-renders
 * Only re-render if request id, estado, or urgencia changes
 */
const arePropsEqual = (
  prev: RequestListItemProps,
  next: RequestListItemProps
): boolean => {
  return (
    prev.request.id === next.request.id &&
    prev.request.estado === next.request.estado &&
    prev.request.urgencia === next.request.urgencia
  );
};

export const RequestListItem = memo(RequestListItemComponent, arePropsEqual);
