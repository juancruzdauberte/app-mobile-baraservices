import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<
    string | null
> {
    if (!Device.isDevice) {
        console.log("[NOTIFICATIONS] Push notifications require a physical device");
        return null;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Notificaciones",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#2563EB",
        });
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("[NOTIFICATIONS] Permission not granted");
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        console.log("[NOTIFICATIONS] EAS projectId not found");
        return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
        projectId,
    });

    console.log("[NOTIFICATIONS] Expo push token:", token.data);

    return token.data;
}

export function getNotificationRouteFromData(
    data: Record<string, unknown>,
): string | null {
    const payload = data.payload as
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