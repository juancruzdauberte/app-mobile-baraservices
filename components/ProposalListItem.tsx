import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Proposal, ProposalEstado } from "../types/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalEstado,
  { label: string; bg: string; text: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
  },
  ACEPTADA: {
    label: "Aceptada",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
  },
  RECHAZADA: { label: "Rechazada", bg: "bg-red-500/20", text: "text-red-400" },
  CANCELADA: { label: "Cancelada", bg: "bg-slate-100 dark:bg-gray-800", text: "text-slate-500 dark:text-gray-500" },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ProposalListItemProps {
  proposal: Proposal;
  onWithdraw: (proposalId: string) => void;
  withdrawingId: string | null;
}

function ProposalListItemComponent({
  proposal,
  onWithdraw,
  withdrawingId,
}: ProposalListItemProps) {
  const router = useRouter();
  const statusCfg = STATUS_CONFIG[proposal.estado] ?? STATUS_CONFIG.PENDIENTE;
  const isWithdrawing = withdrawingId === proposal.id;

  const titulo = proposal.solicitudes_trabajo?.titulo ?? "Solicitud";

  const createdDate = new Date(proposal.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  return (
    <View className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 mb-3">
      {/* Top row: title + status badge */}
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
      {proposal.precio_estimado != null ? (
        <Text className="text-emerald-400 font-bold text-base mb-2">
          ${proposal.precio_estimado.toLocaleString("es-AR")}
        </Text>
      ) : (
        <Text className="text-slate-500 dark:text-gray-500 text-sm mb-2">Precio a coordinar</Text>
      )}

      {/* Message */}
      {proposal.mensaje ? (
        <Text
          className="text-slate-600 dark:text-gray-400 text-sm italic leading-5 mb-2"
          numberOfLines={2}
        >
          "{proposal.mensaje}"
        </Text>
      ) : null}

      {/* Date */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar-outline" size={13} color="#6b7280" />
        <Text className="text-slate-500 dark:text-gray-400 text-xs ml-1.5">{createdDate}</Text>
      </View>

      {/* Actions */}
      {proposal.estado === "PENDIENTE" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onWithdraw(proposal.id)}
          disabled={isWithdrawing}
          className="border border-red-500/30 bg-red-500/10 py-2.5 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Retirar propuesta"
        >
          {isWithdrawing ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <Text className="text-red-400 font-semibold text-sm">Retirar</Text>
          )}
        </Pressable>
      ) : null}

      {proposal.estado === "ACEPTADA" && proposal.ordenes_trabajo?.[0]?.id ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(`/orden/${proposal.ordenes_trabajo![0].id}` as any)
          }
          className="border border-emerald-500/30 bg-emerald-500/10 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
          accessibilityRole="button"
          accessibilityLabel="Ver orden de trabajo"
        >
          <Text className="text-emerald-400 font-semibold text-sm">
            Ver orden →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Memoization ──────────────────────────────────────────────────────────────

/**
 * Custom comparator to prevent unnecessary re-renders
 * Only re-render if proposal id, estado, or withdrawing state changes
 */
const arePropsEqual = (
  prev: ProposalListItemProps,
  next: ProposalListItemProps
): boolean => {
  return (
    prev.proposal.id === next.proposal.id &&
    prev.proposal.estado === next.proposal.estado &&
    prev.withdrawingId === next.withdrawingId
  );
};

export const ProposalListItem = memo(ProposalListItemComponent, arePropsEqual);
