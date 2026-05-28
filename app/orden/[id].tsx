import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import {
  completeWorkOrder,
  disputeWorkOrder,
  getWorkOrderById,
  startWorkOrder,
  updateWorkOrderPrice,
} from "../../lib/lib";
import { WorkOrder, WorkOrderEstado } from "../../types/types";
import { useAuth } from "../../providers/AuthProvider";

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
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdenDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setLoadError(false);
      try {
        const data = await getWorkOrderById(id);
        setOrder(data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function handleStart() {
    setActionLoading("start");
    try {
      await startWorkOrder(id);
      Toast.show({
        type: "success",
        text1: "¡Trabajo iniciado!",
        text2: "El estado se actualizó a En progreso.",
      });
      await loadOrder(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo iniciar el trabajo.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function handleComplete() {
    Alert.alert("¿Confirmás?", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setActionLoading("complete");
          try {
            await completeWorkOrder(id);
            Toast.show({
              type: "success",
              text1: "Trabajo completado",
              text2: "La orden fue marcada como completada.",
            });
            await loadOrder(true);
          } catch {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "No se pudo completar el trabajo.",
            });
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }

  function handleDispute() {
    Alert.alert("¿Confirmás?", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setActionLoading("dispute");
          try {
            await disputeWorkOrder(id);
            Toast.show({
              type: "success",
              text1: "Disputa enviada",
              text2: "Nuestro equipo revisará la situación.",
            });
            await loadOrder(true);
          } catch {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "No se pudo disputar la orden.",
            });
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }

  async function handleUpdatePrice() {
    const parsed = parseFloat(newPrice);
    if (isNaN(parsed) || parsed <= 0) {
      Toast.show({
        type: "error",
        text1: "Precio inválido",
        text2: "Ingresá un número mayor a 0.",
      });
      return;
    }
    setActionLoading("price");
    try {
      await updateWorkOrderPrice(id, { precio_final: parsed });
      Toast.show({ type: "success", text1: "Precio actualizado" });
      setShowPriceModal(false);
      setNewPrice("");
      await loadOrder(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el precio.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function handleLeaveReview() {
    router.push(`/resena/${id}` as any);
  }

  // ─── Render states ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || order === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar la orden
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <TouchableOpacity
            onPress={() => loadOrder()}
            className="bg-emerald-500 px-6 py-3 rounded-full"
          >
            <Text className="text-gray-950 font-bold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[order.estado] ?? STATUS_CONFIG.PROGRAMADA;
  const isCliente = profile?.rol === "CLIENTE";
  const isProfesional = profile?.rol === "PROFESIONAL";

  const createdDate = new Date(order.fecha_creacion).toLocaleDateString(
    "es-AR",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View className="flex-row items-center pt-4 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold flex-1">
            Detalle de Orden
          </Text>
        </View>

        {/* ── Info card ───────────────────────────────────────────────────── */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
          {/* Title */}
          <Text className="text-white text-xl font-bold mb-3">
            {order.solicitudes_trabajo?.titulo ?? "Orden de trabajo"}
          </Text>

          {/* Status badge — large & prominent */}
          <View className="mb-4">
            <View
              className={`self-start px-3 py-1.5 rounded-full ${statusCfg.bg}`}
            >
              <Text className={`text-sm font-semibold ${statusCfg.text}`}>
                {statusCfg.label}
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text className="text-emerald-400 text-2xl font-bold mb-1">
            ${order.precio_final.toLocaleString("es-AR")}
          </Text>
          <Text className="text-gray-500 text-xs mb-4">
            {order.estado === "PROGRAMADA"
              ? "Precio estimado (puede variar)"
              : "Precio final acordado"}
          </Text>

          {/* Separator */}
          <View className="border-t border-gray-800 my-4" />

          {/* Description */}
          {order.solicitudes_trabajo?.descripcion ? (
            <View className="mb-4">
              <Text className="text-gray-300 text-xs font-semibold uppercase tracking-wide mb-2">
                Descripción del trabajo
              </Text>
              <Text className="text-gray-400 text-sm leading-5">
                {order.solicitudes_trabajo.descripcion}
              </Text>
            </View>
          ) : null}

          {/* Date */}
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text className="text-gray-400 text-sm ml-1.5">{createdDate}</Text>
          </View>
        </View>

        {/* ── Participant card ─────────────────────────────────────────────── */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          {isCliente ? (
            <>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Profesional asignado
              </Text>
              <View className="flex-row items-center gap-3">
                {order.propuestas?.profesionales?.avatar ? (
                  <Image
                    source={{ uri: order.propuestas.profesionales.avatar }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="#6b7280"
                  />
                )}

                {/* Name + message — left */}
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {order.propuestas?.profesionales?.nombre
                      ? `${order.propuestas.profesionales.nombre} ${order.propuestas.profesionales.apellido ?? ""}`.trim()
                      : "Profesional asignado"}
                  </Text>
                  {order.propuestas?.mensaje ? (
                    <Text
                      className="text-gray-500 text-xs italic mt-1 leading-4"
                      numberOfLines={2}
                    >
                      "{order.propuestas.mensaje}"
                    </Text>
                  ) : null}
                </View>

                {/* Rating + jobs — right */}
                <View className="items-end gap-1">
                  {order.propuestas?.profesionales?.calificacion_promedio ? (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-yellow-400 text-xs">⭐</Text>
                      <Text className="text-gray-300 text-xs font-semibold">
                        {order.propuestas.profesionales.calificacion_promedio.toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                  {order.propuestas?.profesionales?.total_trabajos_realizados ? (
                    <Text className="text-gray-500 text-xs text-right">
                      {order.propuestas.profesionales.total_trabajos_realizados === 1
                        ? "1 trabajo"
                        : `${order.propuestas.profesionales.total_trabajos_realizados} trabajos`}
                    </Text>
                  ) : null}
                </View>
              </View>
            </>
          ) : (
            <>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                Cliente
              </Text>
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color="#6b7280"
                />
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {order.solicitudes_trabajo?.clientes?.nombre
                      ? `${order.solicitudes_trabajo.clientes.nombre} ${order.solicitudes_trabajo.clientes.apellido ?? ""}`.trim()
                      : "Cliente"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}

        {/* === CLIENTE === */}

        {isCliente && order.estado === "EN_PROGRESO" ? (
          <View className="mb-4">
            <TouchableOpacity
              onPress={handleDispute}
              disabled={actionLoading === "dispute"}
              className="bg-orange-500/10 border border-orange-500/30 py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
            >
              {actionLoading === "dispute" ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <>
                  <Ionicons name="warning-outline" size={18} color="#fb923c" />
                  <Text className="text-orange-400 font-semibold">
                    Disputar trabajo
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs text-center mt-2 leading-4 px-2">
              Si hay un problema, podés disputar el trabajo para que lo revise
              nuestro equipo.
            </Text>
          </View>
        ) : null}

        {isCliente && order.estado === "COMPLETADA" ? (
          (order._count?.resenas ?? 0) === 0 ? (
            <TouchableOpacity
              onPress={handleLeaveReview}
              className="bg-emerald-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 mb-4"
            >
              <Ionicons name="star-outline" size={18} color="#030712" />
              <Text className="text-gray-950 font-bold">
                Calificar profesional
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-center gap-2 py-3.5 mb-4 bg-gray-800 rounded-2xl">
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text className="text-emerald-400 font-semibold">Ya calificaste esta orden</Text>
            </View>
          )
        ) : null}


        {isCliente && order.estado === "EN_DISPUTA" ? (
          <View className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-4">
            <Text className="text-orange-400 font-bold mb-1.5">
              En revisión
            </Text>
            <Text className="text-gray-400 text-sm leading-5">
              Nuestro equipo está analizando la situación. Te notificaremos
              cuando haya una resolución.
            </Text>
          </View>
        ) : null}

        {/* === PROFESIONAL === */}

        {isProfesional && order.estado === "PROGRAMADA" ? (
          <View className="mb-4">
            <TouchableOpacity
              onPress={handleStart}
              disabled={actionLoading === "start"}
              className="bg-emerald-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 w-full"
            >
              {actionLoading === "start" ? (
                <ActivityIndicator size="small" color="#030712" />
              ) : (
                <>
                  <Ionicons name="play-outline" size={18} color="#030712" />
                  <Text className="text-gray-950 font-bold">
                    Iniciar trabajo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPriceModal(true)}
              className="bg-gray-800 border border-gray-700 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 w-full mt-3"
            >
              <Ionicons name="pencil-outline" size={16} color="#d1d5db" />
              <Text className="text-gray-300">Actualizar precio</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isProfesional && order.estado === "EN_PROGRESO" ? (
          <TouchableOpacity
            onPress={handleComplete}
            disabled={actionLoading === "complete"}
            className="bg-emerald-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 w-full mb-4"
          >
            {actionLoading === "complete" ? (
              <ActivityIndicator size="small" color="#030712" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#030712"
                />
                <Text className="text-gray-950 font-bold">
                  Marcar como completada
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {isProfesional && order.estado === "EN_DISPUTA" ? (
          <View className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-4">
            <Text className="text-orange-400 font-bold mb-1.5">
              En revisión
            </Text>
            <Text className="text-gray-400 text-sm leading-5">
              Nuestro equipo está analizando la situación. Te notificaremos
              cuando haya una resolución.
            </Text>
          </View>
        ) : null}

        {/* Spacer */}
        <View className="h-10" />
      </ScrollView>

      {/* ── Price Modal ──────────────────────────────────────────────────── */}
      <Modal visible={showPriceModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800">
            <Text className="text-white text-lg font-bold mb-4">
              Actualizar precio
            </Text>

            <TextInput
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              placeholder="Nuevo precio (ej: 6000)"
              placeholderTextColor="#6b7280"
              className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 mb-4 text-base"
            />

            <TouchableOpacity
              onPress={handleUpdatePrice}
              disabled={actionLoading === "price"}
              className="bg-emerald-500 py-3 rounded-xl items-center mb-3"
            >
              {actionLoading === "price" ? (
                <ActivityIndicator color="#030712" />
              ) : (
                <Text className="text-gray-950 font-bold">Confirmar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPriceModal(false)}
              className="py-3 items-center"
            >
              <Text className="text-gray-400">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
