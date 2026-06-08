import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { AVATAR_PLACEHOLDER, IMAGE_CACHE_POLICY, IMAGE_TRANSITION } from "../../constants/image-config";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import {
  cancelWorkOrder,
  completeWorkOrder,
  confirmStartWorkOrder,
  disputeWorkOrder,
  getWorkOrderById,
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
  CANCELADA: {
    label: "Cancelada",
    bg: "bg-red-500/20",
    text: "text-red-400",
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

  const handleConfirmStart = async () => {
    Alert.alert(
      "Confirmar inicio",
      "¿Confirmás que el profesional puede comenzar el trabajo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setLoading(true);
              await confirmStartWorkOrder(id);
              await loadOrder(true);
            } catch (error) {
              Alert.alert("Error", "No se pudo confirmar el inicio");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancelar orden",
      "¿Cancelás esta orden? Esta acción no se puede deshacer.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar orden",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await cancelWorkOrder(id);
              router.replace("/(cliente)/ordenes");
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la orden");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar la orden
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => loadOrder()}
            className="bg-emerald-500 px-6 py-3 rounded-full"
          >
            <Text className="text-gray-950 font-bold">Reintentar</Text>
          </Pressable>
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
          accessibilityLabel="Volver"
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
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
                    placeholder={AVATAR_PLACEHOLDER}
                    transition={IMAGE_TRANSITION}
                    cachePolicy={IMAGE_CACHE_POLICY}
                    contentFit="cover"
                    style={{ width: 48, height: 48, borderRadius: 24 }}
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
                  {order.propuestas?.profesionales?.id ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push(
                          `/profesional/${order.propuestas!.profesionales!.id}` as any,
                        )
                      }
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    >
                      <Text className="text-emerald-500 text-xs mt-1">
                        Ver perfil →
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* Rating + jobs — right */}
                <View className="items-end gap-1">
                  {order.propuestas?.profesionales?.calificacion_promedio ? (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-yellow-400 text-xs">⭐</Text>
                      <Text className="text-gray-300 text-xs font-semibold">
                        {order.propuestas.profesionales.calificacion_promedio.toFixed(
                          1,
                        )}
                      </Text>
                    </View>
                  ) : null}
                  {order.propuestas?.profesionales
                    ?.total_trabajos_realizados ? (
                    <Text className="text-gray-500 text-xs text-right">
                      {order.propuestas.profesionales
                        .total_trabajos_realizados === 1
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
                {order.solicitudes_trabajo?.clientes?.avatar ? (
                  <Image
                    source={{
                      uri: order.solicitudes_trabajo?.clientes?.avatar,
                    }}
                    placeholder={AVATAR_PLACEHOLDER}
                    transition={IMAGE_TRANSITION}
                    cachePolicy={IMAGE_CACHE_POLICY}
                    contentFit="cover"
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="#6b7280"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {order.solicitudes_trabajo?.clientes?.nombre
                      ? `${order.solicitudes_trabajo.clientes.nombre} ${order.solicitudes_trabajo.clientes.apellido ?? ""}`.trim()
                      : "Cliente"}
                  </Text>
                  {order.solicitudes_trabajo?.clientes?.id ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push(
                          `/cliente/${order.solicitudes_trabajo!.clientes!.id}` as any,
                        )
                      }
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    >
                      <Text className="text-emerald-500 text-xs mt-1">
                        Ver perfil →
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </>
          )}
        </View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}

        {/* === CLIENTE === */}

        {isCliente && order.estado === "EN_PROGRESO" ? (
          <View className="mb-4">
            <Pressable
              accessibilityRole="button"
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
            </Pressable>
            <Text className="text-gray-500 text-xs text-center mt-2 leading-4 px-2">
              Si hay un problema, podés disputar el trabajo para que lo revise
              nuestro equipo.
            </Text>
          </View>
        ) : null}

        {isCliente && order.estado === "COMPLETADA" ? (
          (order._count?.resenas ?? 0) === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleLeaveReview}
              className="bg-emerald-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 mb-4"
            >
              <Ionicons name="star-outline" size={18} color="#030712" />
              <Text className="text-gray-950 font-bold">
                Calificar profesional
              </Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center justify-center gap-2 py-3.5 mb-4 bg-gray-800 rounded-2xl">
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text className="text-emerald-400 font-semibold">
                Ya calificaste esta orden
              </Text>
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

        {order.estado === "PROGRAMADA" && isCliente && (
          <View className="gap-3">
            <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-1">
              <Text className="text-gray-400 text-sm mb-1">Precio confirmado por el profesional</Text>
              <Text className="text-white text-2xl font-bold">${order.precio_final?.toLocaleString("es-AR") ?? "—"}</Text>
              <Text className="text-gray-500 text-xs mt-1">Revisá el precio antes de confirmar el inicio</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleConfirmStart}
              className="bg-green-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">Confirmar inicio</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              className="bg-red-500/10 border border-red-500/40 rounded-2xl py-4 items-center"
            >
              <Text className="text-red-400 font-semibold text-base">Cancelar orden</Text>
            </Pressable>
          </View>
        )}

        {order.estado === "CANCELADA" && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
            <Text className="text-red-400 font-semibold text-base mb-1">Orden cancelada</Text>
            <Text className="text-red-300/70 text-sm">Esta orden fue cancelada y no puede ser reactivada.</Text>
          </View>
        )}

        {/* === PROFESIONAL === */}

        {isProfesional && order.estado === "PROGRAMADA" && (
          <View className="gap-3 mb-4">
            <View className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <Text className="text-gray-400 text-sm mb-1">Precio actual</Text>
              <Text className="text-white text-2xl font-bold">${order.precio_final?.toLocaleString("es-AR") ?? "—"}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowPriceModal(true)}
              className="bg-amber-500 rounded-2xl py-4 items-center"
            >
              <Text className="text-gray-950 font-bold text-base">Editar precio</Text>
            </Pressable>
          </View>
        )}

        {isProfesional && order.estado === "EN_PROGRESO" ? (
          <Pressable
            accessibilityRole="button"
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
          </Pressable>
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

            <Pressable
              accessibilityRole="button"
              onPress={handleUpdatePrice}
              disabled={actionLoading === "price"}
              className="bg-emerald-500 py-3 rounded-xl items-center mb-3"
            >
              {actionLoading === "price" ? (
                <ActivityIndicator color="#030712" />
              ) : (
                <Text className="text-gray-950 font-bold">Confirmar</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowPriceModal(false)}
              className="py-3 items-center"
            >
              <Text className="text-gray-400">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
