import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { getClientById } from "../../lib/lib";
import { PublicClient } from "../../types/types";

export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<PublicClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    setLoadError(false);
    getClientById(id)
      .then(setClient)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (loadError || client == null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center px-5 pt-4 pb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>

        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#4b5563" />
          <Text className="text-white text-lg font-bold mt-4 mb-2 text-center">
            No se pudo cargar el perfil
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Verificá tu conexión e intentá de nuevo.
          </Text>
          <Pressable
            onPress={load}
            className="bg-emerald-500 px-6 py-3 rounded-full"
          >
            <Text className="text-gray-950 font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View className="flex-row items-center pt-4 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Perfil del cliente</Text>
        </View>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4 items-center">
          {client.avatar ? (
            <Image
              source={{ uri: client.avatar }}
              placeholder={AVATAR_PLACEHOLDER}
              transition={IMAGE_TRANSITION}
              cachePolicy={IMAGE_CACHE_POLICY}
              contentFit="cover"
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <View
              className="bg-gray-800 border border-gray-700 items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: 40 }}
            >
              <Ionicons name="person" size={36} color="#6b7280" />
            </View>
          )}

          <Text className="text-white text-xl font-bold mt-3 text-center">
            {client.nombre} {client.apellido}
          </Text>

          <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
            <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-sm">Cliente</Text>
          </View>
        </View>

        {/* ── Contacto ──────────────────────────────────────────────────── */}
        {(client.telefono || client.email) ? (
          <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Contacto
            </Text>

            {client.telefono ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${client.telefono}`)}
                className="flex-row items-center py-3 border-b border-gray-800"
                style={{ gap: 12 }}
              >
                <View className="w-9 h-9 rounded-full bg-emerald-500/15 items-center justify-center">
                  <Ionicons name="call-outline" size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-0.5">Teléfono</Text>
                  <Text className="text-white text-sm font-medium">
                    {client.telefono}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </Pressable>
            ) : null}

            {client.email ? (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${client.email}`)}
                className="flex-row items-center pt-3"
                style={{ gap: 12 }}
              >
                <View className="w-9 h-9 rounded-full bg-blue-500/15 items-center justify-center">
                  <Ionicons name="mail-outline" size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-0.5">Email</Text>
                  <Text className="text-white text-sm font-medium">
                    {client.email}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
