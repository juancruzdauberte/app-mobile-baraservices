import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../providers/AuthProvider";
import {
    AppNotification,
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../lib/lib";

function getNotificationTarget(notification: AppNotification): string | null {
    const payload = notification.payload as
        | {
            ordenId?: string;
            solicitudId?: string;
            propuestaId?: string;
        }
        | null
        | undefined;

    if (payload?.ordenId) {
        return `/orden/${payload.ordenId}`;
    }

    if (payload?.solicitudId) {
        return `/solicitud/${payload.solicitudId}`;
    }

    return null;
}

function formatDate(value: string) {
    const date = new Date(value);

    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function NotificationsScreen() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        const data = await getMyNotifications();
        setNotifications(data);
    }, []);

    useEffect(() => {
        loadNotifications()
            .catch((error) => console.log("[NOTIFICATIONS] load error:", error))
            .finally(() => setLoading(false));
    }, [loadNotifications]);

    useFocusEffect(
        useCallback(() => {
            loadNotifications().catch((error) =>
                console.log("[NOTIFICATIONS] focus load error:", error),
            );
        }, [loadNotifications]),
    );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadNotifications();
        } finally {
            setRefreshing(false);
        }
    };

    const onPressNotification = async (notification: AppNotification) => {
        if (!notification.leida) {
            await onMarkNotificationAsRead(notification.id);
        }

        const target = getNotificationTarget(notification);

        if (target) {
            router.push(target as any);
        }
    };

    const onMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();

        setNotifications((current) =>
            current.map((item) => ({
                ...item,
                leida: true,
            })),
        );
    };

    const onMarkNotificationAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId);

        setNotifications((current) =>
            current.map((item) =>
                item.id === notificationId ? { ...item, leida: true } : item,
            ),
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white px-4 pt-14 dark:bg-neutral-950">
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Pressable
                        onPress={() => router.replace(
                            (profile?.rol === "PROFESIONAL" ? "/(profesional)" : "/(cliente)") as any
                        )}
                        accessibilityRole="button"
                        accessibilityLabel="Ir al inicio"
                        className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
                    >
                        <Ionicons name="chevron-back" size={22} color="#6b7280" />
                    </Pressable>
                    <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Notificaciones
                    </Text>
                </View>

                {notifications.some((item) => !item.leida) ? (
                    <Pressable
                        onPress={onMarkAllAsRead}
                        className="flex-row items-center rounded-full bg-emerald-500 px-3 py-2"
                        style={{ gap: 6 }}
                    >
                        <Ionicons name="checkmark-done" size={16} color="#0f172a" />
                        <Text className="font-semibold text-slate-950">
                            Todas
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-base text-neutral-500 dark:text-neutral-400">
                            No tenés notificaciones todavía.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => onPressNotification(item)}
                        className={`mb-3 rounded-xl border p-4 ${item.leida
                                ? "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                                : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
                            }`}
                    >
                        <View className="mb-1 flex-row items-start justify-between gap-3">
                            <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white">
                                {item.titulo}
                            </Text>

                            {!item.leida ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Marcar como leída"
                                    onPress={() => onMarkNotificationAsRead(item.id)}
                                    className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={18}
                                        color="#0f172a"
                                    />
                                </Pressable>
                            ) : null}
                        </View>

                        <Text className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">
                            {item.mensaje}
                        </Text>

                        <Text className="text-xs text-neutral-400">
                            {formatDate(item.fecha_creacion)}
                        </Text>
                    </Pressable>
                )}
            />
        </View>
    );
}
