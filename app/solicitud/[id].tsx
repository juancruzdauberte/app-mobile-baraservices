import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { AVATAR_PLACEHOLDER, IMAGE_CACHE_POLICY, IMAGE_TRANSITION } from "../../constants/image-config";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import {
  acceptProposal,
  cancelJobRequest,
  deleteJobRequest,
  deleteProposal,
  getClientById,
  getJobRequestById,
  getMyProposals,
  getProposalsByJobRequest,
  rejectProposal,
} from "../../lib/lib";
import {
  JobRequest,
  JobRequestEstado,
  Proposal,
  ProposalEstado,
  PublicClient,
  Urgencia,
  WorkOrder,
} from "../../types/types";
import { useAuth } from "../../providers/AuthProvider";

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  Urgencia,
  { label: string; bg: string; text: string; color: string }
> = {
  BAJA: {
    label: "Baja",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    color: "#10b981",
  },
  MEDIA: {
    label: "Media",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    color: "#f59e0b",
  },
  EMERGENCIA: {
    label: "Alta",
    bg: "bg-red-500/20",
    text: "text-red-400",
    color: "#ef4444",
  },
};

const STATUS_CONFIG: Record<
  JobRequestEstado,
  { label: string; bg: string; text: string }
> = {
  ABIERTA: { label: "Abierta", bg: "bg-blue-500/20", text: "text-blue-400" },
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
  COMPLETA: { label: "Completada", bg: "bg-emerald-500/20", text: "text-emerald-400" },
};

const PROPOSAL_STATUS_CONFIG: Record<
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
  RECHAZADA: {
    label: "Rechazada",
    bg: "bg-red-500/20",
    text: "text-red-400",
  },
  CANCELADA: {
    label: "Cancelada",
    bg: "bg-gray-800",
    text: "text-gray-500",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysRemaining(fechaCreacion: string): number {
  const created = new Date(fechaCreacion);
  const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── MyProposalCard (PROFESIONAL) ─────────────────────────────────────────────

interface MyProposalCardProps {
  proposal: Proposal;
  onWithdraw: () => void;
  actionLoading: string | null;
}

function MyProposalCard({
  proposal,
  onWithdraw,
  actionLoading,
}: MyProposalCardProps) {
  const isWithdrawing = actionLoading === proposal.id;
  const statusCfg =
    PROPOSAL_STATUS_CONFIG[proposal.estado] ?? PROPOSAL_STATUS_CONFIG.PENDIENTE;

  return (
    <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white font-bold text-sm">Tu propuesta</Text>
        <Badge
          bg={statusCfg.bg}
          text={statusCfg.text}
          label={statusCfg.label}
        />
      </View>

      {proposal.precio_estimado != null ? (
        <Text className="text-emerald-400 text-lg font-bold mb-2">
          ${proposal.precio_estimado.toLocaleString("es-AR")}
        </Text>
      ) : (
        <Text className="text-gray-500 text-sm mb-2">Precio a coordinar</Text>
      )}

      {proposal.mensaje ? (
        <Text
          className="text-gray-400 text-sm italic leading-5 mb-3"
          numberOfLines={3}
        >
          "{proposal.mensaje}"
        </Text>
      ) : null}

      {proposal.estado === "PENDIENTE" ? (
        <Pressable
          accessibilityRole="button"
          onPress={onWithdraw}
          disabled={isWithdrawing}
          className="border border-red-500/30 bg-red-500/10 py-2.5 rounded-xl items-center mt-1"
        >
          {isWithdrawing ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <Text className="text-red-400 font-semibold text-sm">
              Retirar propuesta
            </Text>
          )}
        </Pressable>
      ) : null}

      {proposal.estado === "RECHAZADA" ? (
        <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-1">
          <Text className="text-red-400 text-xs text-center">
            El cliente no aceptó esta propuesta.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

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

// ─── ProposalCard ─────────────────────────────────────────────────────────────

interface ProposalCardProps {
  proposal: Proposal;
  index: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  actionLoading: string | null;
}

function ProposalCard({
  proposal,
  index,
  onAccept,
  onReject,
  actionLoading,
}: ProposalCardProps) {
  const statusCfg =
    PROPOSAL_STATUS_CONFIG[proposal.estado] ?? PROPOSAL_STATUS_CONFIG.PENDIENTE;
  const isProcessing = actionLoading === proposal.id;
  const router = useRouter();
  const pro = proposal.profesionales ?? null;

  const date = new Date(proposal.fecha_creacion).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const fullName = pro
    ? `${pro.nombre} ${pro.apellido}`.trim()
    : `Profesional #${index + 1}`;

  return (
    <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-3">
      {/* ── Header: avatar + nombre + badge ── */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center" style={{ gap: 10 }}>
          {/* Avatar */}
          {pro?.avatar ? (
            <Image
              source={{ uri: pro.avatar }}
              placeholder={AVATAR_PLACEHOLDER}
              transition={IMAGE_TRANSITION}
              cachePolicy={IMAGE_CACHE_POLICY}
              contentFit="cover"
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center border border-gray-700">
              <Ionicons name="person" size={20} color="#6b7280" />
            </View>
          )}

          {/* Nombre + "ver perfil" */}
          <View>
            <Text className="text-white font-semibold text-sm">{fullName}</Text>
            {pro && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push(`/profesional/${proposal.profesional_id}` as any)
                }
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                className="flex-row items-center mt-0.5"
                style={{ gap: 3 }}
              >
                <Text className="text-emerald-500 text-sm font-medium">
                  Ver perfil
                </Text>
                <Ionicons name="open-outline" size={13} color="#10b981" />
              </Pressable>
            )}
          </View>
        </View>

        <Badge
          bg={statusCfg.bg}
          text={statusCfg.text}
          label={statusCfg.label}
        />
      </View>

      {/* Rating si existe */}
      {pro?.calificacion_promedio != null && pro.calificacion_promedio > 0 ? (
        <View className="flex-row items-center mb-2" style={{ gap: 4 }}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text className="text-amber-400 text-xs font-semibold">
            {pro.calificacion_promedio.toFixed(1)}
          </Text>
          {pro.total_trabajos_realizados != null && (
            <Text className="text-gray-500 text-xs">
              · {pro.total_trabajos_realizados}{" "}
              {pro.total_trabajos_realizados === 1 ? "trabajo" : "trabajos"}
            </Text>
          )}
        </View>
      ) : null}

      {/* Precio */}
      {proposal.precio_estimado != null ? (
        <Text className="text-emerald-400 text-lg font-bold mb-2">
          ${proposal.precio_estimado.toLocaleString("es-AR")}
        </Text>
      ) : (
        <Text className="text-gray-500 text-sm mb-2">Precio a coordinar</Text>
      )}

      {/* Mensaje */}
      {proposal.mensaje ? (
        <View className="bg-gray-800/60 rounded-xl px-3 py-2.5 mb-3">
          <Text
            className="text-gray-300 text-sm leading-5 italic"
            numberOfLines={3}
          >
            "{proposal.mensaje}"
          </Text>
        </View>
      ) : null}

      {/* Fecha */}
      <View className="flex-row items-center mb-3" style={{ gap: 4 }}>
        <Ionicons name="calendar-outline" size={12} color="#6b7280" />
        <Text className="text-gray-500 text-xs">{date}</Text>
      </View>

      {/* Botones PENDIENTE */}
      {proposal.estado === "PENDIENTE" ? (
        <View
          className="flex-row border-t border-gray-800 pt-3"
          style={{ gap: 8 }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => onReject(proposal.id)}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 items-center justify-center"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#f87171" />
            ) : (
              <Text className="text-red-400 font-semibold text-sm">
                Rechazar
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => onAccept(proposal.id)}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 items-center justify-center"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#030712" />
            ) : (
              <Text className="text-gray-950 font-bold text-sm">Aceptar</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SolicitudDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const isPro = profile?.rol === "PROFESIONAL";

  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [clientProfile, setClientProfile] = useState<PublicClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setLoadError(false);
      try {
        if (isPro) {
          const [jobReq, myProposals] = await Promise.all([
            getJobRequestById(id),
            getMyProposals(),
          ]);
          setJobRequest(jobReq);
          const existing =
            myProposals.find((p) => p.solicitud_trabajo_id === id) ?? null;
          setMyProposal(existing);
          setProposals([]);
          // Fetch client profile silently — no rompe si falla
          getClientById(jobReq.cliente_id)
            .then(setClientProfile)
            .catch(() => setClientProfile(null));
        } else {
          const [jobReq, fetchedProposals] = await Promise.all([
            getJobRequestById(id),
            getProposalsByJobRequest(id),
          ]);
          setJobRequest(jobReq);
          setProposals(fetchedProposals);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, isPro],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleAccept(proposalId: string) {
    setActionLoading(proposalId);
    try {
      const workOrder: WorkOrder = await acceptProposal(proposalId);
      Toast.show({
        type: "success",
        text1: "Propuesta aceptada",
        text2: "La orden de trabajo fue creada exitosamente.",
      });
      router.push(`/orden/${workOrder.id}` as any);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo aceptar la propuesta. Intentá de nuevo.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(proposalId: string) {
    setActionLoading(proposalId);
    try {
      await rejectProposal(proposalId);
      Toast.show({
        type: "success",
        text1: "Propuesta rechazada",
      });
      await loadData(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo rechazar la propuesta. Intentá de nuevo.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    setActionLoading("cancel");
    try {
      const updated = await cancelJobRequest(id);
      setJobRequest(updated);
      Toast.show({
        type: "success",
        text1: "Solicitud cancelada",
      });
      router.back();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cancelar la solicitud. Intentá de nuevo.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleWithdraw() {
    if (!myProposal) return;
    setActionLoading(myProposal.id);
    try {
      await deleteProposal(myProposal.id);
      Toast.show({ type: "success", text1: "Propuesta retirada" });
      await loadData(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo retirar la propuesta.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteJobRequest() {
    setActionLoading("delete");
    try {
      await deleteJobRequest(jobRequest?.id!);
      Toast.show({ type: "success", text1: "Solicitud eliminada" });
      router.back();
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo eliminar la solicitud.",
      });
    } finally {
      setActionLoading(null);
    }
  }
  // ─── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || jobRequest === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        {/* Back */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar la solicitud
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => loadData()}
            className="bg-emerald-500 px-6 py-3 rounded-full"
          >
            <Text className="text-gray-950 font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Derived data ────────────────────────────────────────────────────────────

  const urgency = jobRequest.urgencia
    ? (URGENCY_CONFIG[jobRequest.urgencia] ?? URGENCY_CONFIG.BAJA)
    : URGENCY_CONFIG.BAJA;
  const status = STATUS_CONFIG[jobRequest.estado] ?? { label: "Desconocido", bg: "bg-gray-500/20", text: "text-gray-400" };

  const createdDate = new Date(jobRequest.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  const daysRemaining =
    jobRequest.estado === "ABIERTA"
      ? getDaysRemaining(jobRequest.fecha_creacion)
      : null;

  const showProposals =
    jobRequest.estado === "ABIERTA" || jobRequest.estado === "ASIGNADA";

  const isCancelProcessing = actionLoading === "cancel";
  const isDeletingProcessing = actionLoading === "delete";

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="flex-row items-center pt-4 pb-5">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-lg font-bold flex-1">
            Detalle de Solicitud
          </Text>
          {!isPro && jobRequest.estado === "ABIERTA" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  "Eliminar solicitud",
                  "¿Estás seguro que querés eliminar esta solicitud? Esta acción no se puede deshacer.",
                  [
                    { text: "No, volver", style: "cancel" },
                    {
                      text: "Sí, eliminar",
                      style: "destructive",
                      onPress: handleDeleteJobRequest,
                    },
                  ],
                )
              }
              disabled={isDeletingProcessing}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 "
            >
              {isDeletingProcessing ? (
                <ActivityIndicator size="small" color="#f87171" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#f87171" />
              )}
            </Pressable>
          ) : null}
        </View>

        {/* ── Info card ──────────────────────────────────────────────────── */}
        <View className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
          {/* Title */}
          <Text className="text-white text-xl font-bold mb-3">
            {jobRequest.titulo}
          </Text>

          {/* Badges row */}
          <View className="flex-row gap-2 mb-4">
            {jobRequest.urgencia ? (
              <Badge
                bg={urgency.bg}
                text={urgency.text}
                label={urgency.label}
              />
            ) : null}
            <Badge bg={status.bg} text={status.text} label={status.label} />
          </View>

          {/* Description */}
          <Text className="text-gray-400 text-sm leading-5 mb-4">
            {jobRequest.descripcion}
          </Text>

          {/* Address */}
          {jobRequest.direccion_formateada ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const url = jobRequest.google_place_id
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jobRequest.direccion_formateada!)}&query_place_id=${jobRequest.google_place_id}`
                  : `https://maps.google.com/maps?q=${jobRequest.latitud},${jobRequest.longitud}`;
                Linking.openURL(url);
              }}
              className="flex-row items-start mb-3"
            >
              <Ionicons
                name="location-outline"
                size={15}
                color="#10b981"
                style={{ marginTop: 1 }}
              />
              <Text className="text-emerald-400 text-sm ml-1.5 flex-1 underline">
                {jobRequest.direccion_formateada}
              </Text>
            </Pressable>
          ) : null}

          {/* Date */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={15} color="#6b7280" />
            <Text className="text-gray-400 text-sm ml-1.5">{createdDate}</Text>
          </View>

          {/* Expiry countdown */}
          {daysRemaining !== null ? (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={15} color={urgency.color} />
              <Text
                className="text-sm ml-1.5 font-medium"
                style={{ color: urgency.color }}
              >
                {daysRemaining === 0
                  ? "Expira hoy"
                  : `Expira en ${daysRemaining} ${daysRemaining === 1 ? "día" : "días"}`}
              </Text>
            </View>
          ) : null}
        </View>

        {isPro ? (
          /* ── Sección PROFESIONAL ─────────────────────────────────────────── */
          <>
            {/* Card del cliente que publicó la solicitud */}
            <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Publicado por
              </Text>
              <View className="flex-row items-center" style={{ gap: 12 }}>
                {/* Avatar */}
                {clientProfile?.avatar ? (
                  <Image
                    source={{ uri: clientProfile.avatar }}
                    placeholder={AVATAR_PLACEHOLDER}
                    transition={IMAGE_TRANSITION}
                    cachePolicy={IMAGE_CACHE_POLICY}
                    contentFit="cover"
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                ) : (
                  <View
                    className="bg-gray-800 border border-gray-700 items-center justify-center"
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  >
                    <Ionicons name="person" size={22} color="#6b7280" />
                  </View>
                )}
                {/* Nombre */}
                <View className="flex-1">
                  {clientProfile ? (
                    <Text className="text-white font-semibold text-base">
                      {clientProfile.nombre} {clientProfile.apellido}
                    </Text>
                  ) : (
                    <Text className="text-gray-500 text-sm">Cliente</Text>
                  )}
                  <Text className="text-gray-500 text-xs mt-0.5">Cliente</Text>
                </View>
              </View>
            </View>

            {/* Solo mostrar acciones si la solicitud sigue ABIERTA */}
            {jobRequest.estado === "ABIERTA" ? (
              myProposal ? (
                /* Ya envió propuesta → mostrar su propuesta */
                <MyProposalCard
                  proposal={myProposal}
                  onWithdraw={handleWithdraw}
                  actionLoading={actionLoading}
                />
              ) : (
                /* No envió propuesta → botón enviar */
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/enviar-propuesta/${id}` as any)}
                  className="bg-emerald-500 py-4 rounded-2xl items-center mb-4 flex-row justify-center gap-2"
                >
                  <Ionicons name="send-outline" size={18} color="#030712" />
                  <Text className="text-gray-950 font-bold text-base">
                    Enviar propuesta
                  </Text>
                </Pressable>
              )
            ) : null}

            {/* Si ASIGNADA y ES la propuesta aceptada del pro */}
            {jobRequest.estado === "ASIGNADA" &&
            myProposal?.estado === "ACEPTADA" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(profesional)/ordenes" as any)}
                className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-4 mt-2"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#10b981"
                    />
                    <Text className="text-emerald-400 font-semibold text-sm">
                      Tu propuesta fue aceptada
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </View>
                <Text className="text-gray-400 text-xs mt-1.5">
                  Tocá para ver la orden de trabajo
                </Text>
              </Pressable>
            ) : null}

            {jobRequest.estado === "COMPLETA" ? (
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4">
                <Text className="text-emerald-400 font-semibold text-sm mb-1">
                  Trabajo completado
                </Text>
                <Text className="text-gray-400 text-xs mb-3">
                  El cliente finalizó la orden exitosamente.
                </Text>
                {jobRequest.ordenes_trabajo?.[0]?.id ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(
                        `/orden/${jobRequest.ordenes_trabajo![0].id}` as any,
                      )
                    }
                    className="border border-emerald-500/30 bg-emerald-500/10 py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-emerald-400 font-semibold text-sm">
                      Ver orden →
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </>
        ) : (
          /* ── Sección CLIENTE ─────────────────────────────────────────────── */
          <>
            {/* ── Cancel button — only when ABIERTA ──────────────────────────── */}
            {jobRequest.estado === "ABIERTA" ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleCancel}
                disabled={isCancelProcessing}
                className="border border-red-500/40 bg-red-500/10 py-3 rounded-2xl items-center mb-5"
              >
                {isCancelProcessing ? (
                  <ActivityIndicator size="small" color="#f87171" />
                ) : (
                  <Text className="text-red-400 font-semibold">
                    Cancelar solicitud
                  </Text>
                )}
              </Pressable>
            ) : null}

            {/* ── Proposals section ──────────────────────────────────────────── */}
            {showProposals ? (
              <View>
                {/* Section title */}
                <Text className="text-white font-bold text-base mb-3">
                  Propuestas recibidas ({proposals.length})
                </Text>

                {/* Loading state */}
                {refreshing ? (
                  <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#10b981" />
                  </View>
                ) : proposals.length === 0 ? (
                  /* Empty state */
                  <View className="bg-gray-900 border border-gray-800 rounded-2xl p-5 items-center">
                    <Ionicons
                      name="people-outline"
                      size={36}
                      color="#4b5563"
                      style={{ marginBottom: 12 }}
                    />
                    <Text className="text-gray-400 text-sm text-center leading-5">
                      Aún no recibiste propuestas. Los profesionales podrán ver
                      tu solicitud y enviar propuestas.
                    </Text>
                  </View>
                ) : (
                  /* Proposal list */
                  proposals.map((proposal, index) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      index={index}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      actionLoading={actionLoading}
                    />
                  ))
                )}
              </View>
            ) : null}

            {/* ── Assigned work order card ───────────────────────────────────── */}
            {jobRequest.estado === "ASIGNADA" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(cliente)/ordenes" as any)}
                className="bg-gray-900 border border-amber-500/30 rounded-2xl p-4 mt-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#f59e0b"
                    />
                    <Text className="text-amber-400 font-semibold text-sm">
                      Trabajo asignado
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </View>
                <Text className="text-gray-400 text-xs mt-1.5">
                  Tocá para ver la orden de trabajo
                </Text>
              </Pressable>
            ) : null}

            {jobRequest.estado === "COMPLETA" ? (
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mt-4">
                <Text className="text-emerald-400 font-semibold text-sm mb-1">
                  Trabajo completado
                </Text>
                <Text className="text-gray-400 text-xs mb-3">
                  El trabajo fue finalizado exitosamente.
                </Text>
                {jobRequest.ordenes_trabajo?.[0]?.id ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(
                        `/orden/${jobRequest.ordenes_trabajo![0].id}` as any,
                      )
                    }
                    className="border border-emerald-500/30 py-2.5 rounded-xl items-center mb-2"
                  >
                    <Text className="text-emerald-400 font-semibold text-sm">
                      Ver orden →
                    </Text>
                  </Pressable>
                ) : null}
                {jobRequest.ordenes_trabajo?.[0]?.id &&
                (jobRequest.ordenes_trabajo?.[0]?._count?.resenas ?? 0) === 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(
                        `/resena/${jobRequest.ordenes_trabajo![0].id}` as any,
                      )
                    }
                    className="bg-emerald-500 py-2.5 rounded-xl items-center"
                  >
                    <Text className="text-gray-950 font-bold text-sm">
                      Calificar profesional
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </>
        )}

        {/* ── Read-only banner for CANCELADA / EXPIRADA ─────────────────── */}
        {jobRequest.estado === "CANCELADA" ||
        jobRequest.estado === "EXPIRADA" ? (
          <View className="bg-gray-800 rounded-xl p-4 mt-2">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons
                name={
                  jobRequest.estado === "CANCELADA"
                    ? "close-circle-outline"
                    : "hourglass-outline"
                }
                size={18}
                color={
                  jobRequest.estado === "CANCELADA" ? "#f87171" : "#9ca3af"
                }
              />
              <Text
                className={`font-semibold text-sm ${
                  jobRequest.estado === "CANCELADA"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {jobRequest.estado === "CANCELADA"
                  ? "Solicitud cancelada"
                  : "Solicitud expirada"}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm leading-5">
              {jobRequest.estado === "CANCELADA"
                ? "Esta solicitud fue cancelada. Podés crear una nueva solicitud cuando quieras."
                : "Esta solicitud expiró después de 7 días sin recibir una propuesta aceptada."}
            </Text>
          </View>
        ) : null}

        {/* ── Read-only banner for COMPLETA ─────────────────────────────── */}
        {jobRequest.estado === "COMPLETA" ? (
          <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mt-2">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#10b981"
              />
              <Text className="text-emerald-400 font-semibold text-sm">
                Trabajo completado
              </Text>
            </View>
            <Text className="text-gray-500 text-sm leading-5">
              El trabajo fue completado exitosamente.
            </Text>
          </View>
        ) : null}

        {/* Spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
