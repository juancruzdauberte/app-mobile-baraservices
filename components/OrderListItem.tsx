import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { WorkOrder, WorkOrderEstado } from "../types/types";

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

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderListItemProps {
  order: WorkOrder;
  onPress: (orderId: string) => void;
}

function OrderListItemComponent({ order, onPress }: OrderListItemProps) {
  const statusCfg = STATUS_CONFIG[order.estado] ?? STATUS_CONFIG.PROGRAMADA;
  const hint = STATUS_HINT[order.estado];

  const titulo = order.solicitudes_trabajo?.titulo ?? "Orden de trabajo";

  const proNombre = order.propuestas?.profesionales
    ? `Prof. ${order.propuestas.profesionales.nombre ?? ""} ${order.propuestas.profesionales.apellido ?? ""}`.trim()
    : "Profesional asignado";

  const createdDate = new Date(order.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(order.id)}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`Orden: ${titulo}`}
      accessibilityHint="Toca para ver detalles de la orden"
    >
      {/* Top row: title + badge */}
      <View className="flex-row items-start justify-between mb-2">
        <Text
          className="text-white font-semibold text-sm flex-1 mr-2"
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
        <Text className="text-gray-400 text-xs ml-1.5">{proNombre}</Text>
      </View>

      {/* Date */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar-outline" size={13} color="#6b7280" />
        <Text className="text-gray-400 text-xs ml-1.5">{createdDate}</Text>
      </View>

      {/* Footer: hint + chevron */}
      <View className="flex-row items-center justify-between border-t border-gray-800 pt-2.5">
        <Text className={`text-xs ${statusCfg.text}`}>{hint}</Text>
        <Ionicons name="chevron-forward" size={14} color="#6b7280" />
      </View>
    </Pressable>
  );
}

// ─── Memoization ──────────────────────────────────────────────────────────────

/**
 * Custom comparator to prevent unnecessary re-renders
 * Only re-render if order id, estado, or updatedAt changes
 */
const arePropsEqual = (
  prev: OrderListItemProps,
  next: OrderListItemProps
): boolean => {
  return (
    prev.order.id === next.order.id &&
    prev.order.estado === next.order.estado &&
    prev.order.fecha_actualizacion === next.order.fecha_actualizacion
  );
};

export const OrderListItem = memo(OrderListItemComponent, arePropsEqual);
