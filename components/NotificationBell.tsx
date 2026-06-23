import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { getMyNotifications } from "../lib/lib";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    const notifications = await getMyNotifications();
    return notifications.filter((item) => !item.leida).length;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      loadUnreadCount()
        .then((count) => {
          if (isActive) {
            setUnreadCount(count);
          }
        })
        .catch((error) => {
          console.log("[NOTIFICATIONS] unread count error:", error);
        });

      return () => {
        isActive = false;
      };
    }, [loadUnreadCount]),
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      loadUnreadCount()
        .then(setUnreadCount)
        .catch((error) => {
          console.log("[NOTIFICATIONS] unread count error:", error);
        });
    });

    return () => {
      subscription.remove();
    };
  }, [loadUnreadCount]);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `${unreadCount} notificaciones no leídas`
          : "Notificaciones"
      }
      onPress={() => router.push("/notificaciones")}
      className="relative rounded-full border border-slate-200 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <Ionicons name="notifications-outline" size={20} color="#10b981" />

      {unreadCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5">
          <Text className="text-center text-[10px] font-bold text-white">
            {badgeLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
