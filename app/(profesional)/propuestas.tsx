import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { deleteProposal, getMyProposals } from "../../lib/lib";
import { Proposal, ProposalEstado } from "../../types/types";

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
  CANCELADA: { label: "Cancelada", bg: "bg-gray-800", text: "text-gray-500" },
};

// ─── ProposalListCard ─────────────────────────────────────────────────────────

interface ProposalListCardProps {
  proposal: Proposal;
  onWithdraw: (id: string) => void;
  withdrawingId: string | null;
}

function ProposalListCard({
  proposal,
  onWithdraw,
  withdrawingId,
}: ProposalListCardProps) {
  const router = useRouter();
  const statusCfg = STATUS_CONFIG[proposal.estado] ?? STATUS_CONFIG.PENDIENTE;
  const isWithdrawing = withdrawingId === proposal.id;

  const titulo = proposal.solicitudes_trabajo?.titulo ?? "Solicitud";

  const createdDate = new Date(proposal.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "short", year: "numeric" },
  );

  return (
    <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3">
      {/* Top row: title + status badge */}
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
      {proposal.precio_estimado != null ? (
        <Text className="text-emerald-400 font-bold text-base mb-2">
          ${proposal.precio_estimado.toLocaleString("es-AR")}
        </Text>
      ) : (
        <Text className="text-gray-500 text-sm mb-2">Precio a coordinar</Text>
      )}

      {/* Message */}
      {proposal.mensaje ? (
        <Text
          className="text-gray-400 text-sm italic leading-5 mb-2"
          numberOfLines={2}
        >
          "{proposal.mensaje}"
        </Text>
      ) : null}

      {/* Date */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar-outline" size={13} color="#6b7280" />
        <Text className="text-gray-400 text-xs ml-1.5">{createdDate}</Text>
      </View>

      {/* Actions */}
      {proposal.estado === "PENDIENTE" ? (
        <TouchableOpacity
          onPress={() => onWithdraw(proposal.id)}
          disabled={isWithdrawing}
          className="border border-red-500/30 bg-red-500/10 py-2.5 rounded-xl items-center"
        >
          {isWithdrawing ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <Text className="text-red-400 font-semibold text-sm">Retirar</Text>
          )}
        </TouchableOpacity>
      ) : null}

      {proposal.estado === "ACEPTADA" && proposal.ordenes_trabajo?.[0]?.id ? (
        <TouchableOpacity
          onPress={() =>
            router.push(`/orden/${proposal.ordenes_trabajo![0].id}` as any)
          }
          className="border border-emerald-500/30 bg-emerald-500/10 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
        >
          <Text className="text-emerald-400 font-semibold text-sm">
            Ver orden →
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PropuestasScreen() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [isCancelledExpanded, setIsCancelledExpanded] = useState(false);

  const fetchProposals = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyProposals();
      setProposals(data);
    } catch {
      // silently fail on list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  function handleRefresh() {
    setRefreshing(true);
    fetchProposals(true);
  }

  async function handleWithdraw(id: string) {
    setWithdrawingId(id);
    try {
      await deleteProposal(id);
      Toast.show({ type: "success", text1: "Propuesta retirada" });
      fetchProposals(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo retirar la propuesta.",
      });
    } finally {
      setWithdrawingId(null);
    }
  }

  const activeProposals = proposals.filter((p) => p.estado !== "CANCELADA");
  const cancelledProposals = proposals.filter((p) => p.estado === "CANCELADA");

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-3xl font-bold">Mis Propuestas</Text>
        {proposals.length > 0 ? (
          <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-semibold">
              {proposals.length}
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlashList
          data={activeProposals}
          keyExtractor={(item) => item.id}
          estimatedItemSize={88}
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
            <ProposalListCard
              proposal={item}
              onWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
            />
          )}
          ListFooterComponent={
            cancelledProposals.length > 0 ? (
              <View className="mb-3">
                <TouchableOpacity
                  onPress={() => setIsCancelledExpanded(!isCancelledExpanded)}
                  className="flex-row items-center justify-between py-3 px-1 mb-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-400 font-semibold text-sm">
                    Canceladas ({cancelledProposals.length})
                  </Text>
                  <Ionicons
                    name={isCancelledExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
                {isCancelledExpanded ? (
                  <View style={styles.cancelledSection}>
                    {cancelledProposals.map((proposal) => (
                      <ProposalListCard
                        key={proposal.id}
                        proposal={proposal}
                        onWithdraw={handleWithdraw}
                        withdrawingId={withdrawingId}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={
            cancelledProposals.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="send-outline" size={56} color="#374151" />
                <Text className="text-white text-lg font-bold mt-5 mb-2">
                  Sin propuestas enviadas
                </Text>
                <Text className="text-gray-400 text-sm text-center leading-5 px-6">
                  Explorá el mercado y enviá tu primera propuesta.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cancelledSection: {
    opacity: 0.6,
  },
});
