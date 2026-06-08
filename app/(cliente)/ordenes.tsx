import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { getMyWorkOrders } from "../../lib/lib";
import { WorkOrder } from "../../types/types";
import { OrderListItem } from "../../components/OrderListItem";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdenesScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyWorkOrders();
      setOrders(data);
    } catch {
      Toast.show({
        type: "error",
        text1: "Error al cargar órdenes",
        text2: "Verificá tu conexión e intentá de nuevo.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleRefresh() {
    setRefreshing(true);
    loadOrders(true);
  }

  const handleOrderPress = useCallback(
    (orderId: string) => {
      router.push(`/orden/${orderId}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkOrder }) => (
      <OrderListItem order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-3xl font-bold">Mis Órdenes</Text>
        {orders.length > 0 ? (
          <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-semibold">
              {orders.length}
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
          data={orders}
          keyExtractor={(item) => item.id}
          estimatedItemSize={84}
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
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="briefcase-outline" size={56} color="#374151" />
              <Text className="text-white text-lg font-bold mt-5 mb-2">
                Sin órdenes aún
              </Text>
              <Text className="text-gray-400 text-sm text-center leading-5 px-6">
                Cuando aceptes una propuesta, tu orden de trabajo aparecerá acá.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
