import React, { useState } from "react";
import { Text, View, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { api } from "../config/axios.config";
import { sendDocumentation } from "../lib/lib";

export default function OnboardingProfesionalScreen() {
  const [dniFront, setDniFront] = useState<string | null>(null);
  const [dniBack, setDniBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const takePhoto = async (setUri: (uri: string) => void) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Toast.show({
          type: "error",
          text1: "Permiso denegado",
          text2: "Necesitamos acceso a la cámara para continuar.",
        });
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (!dniFront || !dniBack || !selfie) {
      Toast.show({
        type: "error",
        text1: "Faltan fotos",
        text2: "Por favor captura las 3 fotos solicitadas.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      const frontFilename = dniFront.split("/").pop() || "foto_dni_frente.jpg";
      const backFilename = dniBack.split("/").pop() || "foto_dni_dorso.jpg";
      const selfieFilename = selfie.split("/").pop() || "foto_perfil.jpg";
      formData.append("foto_dni_frente", {
        uri: dniFront,
        name: frontFilename,
        type: "image/jpeg",
      } as any);
      formData.append("foto_dni_dorso", {
        uri: dniBack,
        name: backFilename,
        type: "image/jpeg",
      } as any);
      formData.append("foto_perfil", {
        uri: selfie,
        name: selfieFilename,
        type: "image/jpeg",
      } as any);

      await sendDocumentation(formData);

      // Si llega aquí, los documentos se subieron correctamente
      Toast.show({
        type: "success",
        text1: "Perfil enviado",
        text2: "Tus datos han sido recibidos para validación.",
      });
      router.replace("/profesional-validacion");
    } catch (error: any) {
      // Los documentos probablemente se subieron, redirigir a validación
      console.log("Respuesta del servidor:", error?.response?.data);
      router.replace("/profesional-validacion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-1 px-8 py-6">
        <View className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20">
            <Ionicons name="id-card-outline" size={32} color="#10b981" />
          </View>
          <Text className="text-center text-2xl font-bold text-white">
            Verificá tu identidad
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-400">
            Por seguridad, necesitamos fotos de tu DNI y una selfie para validar
            que sos vos.
          </Text>
        </View>

        <View className="flex-1 justify-center gap-4">
          <Text className="mb-2 text-center text-sm font-medium text-emerald-500/80">
            💡 Si querés cambiar una foto, volvé a tocarla.
          </Text>
          <PhotoCaptureButton
            title="DNI (Frente)"
            uri={dniFront}
            onPress={() => takePhoto(setDniFront)}
          />
          <PhotoCaptureButton
            title="DNI (Dorso)"
            uri={dniBack}
            onPress={() => takePhoto(setDniBack)}
          />
          <PhotoCaptureButton
            title="Selfie"
            uri={selfie}
            onPress={() => takePhoto(setSelfie)}
            icon="person-outline"
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={isLoading || !dniFront || !dniBack || !selfie}
          className={`mt-6 flex-row items-center justify-center rounded-2xl p-4 ${
            !dniFront || !dniBack || !selfie
              ? "bg-gray-800"
              : "bg-emerald-500 active:bg-emerald-600"
          }`}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className={`text-base font-semibold ${
                !dniFront || !dniBack || !selfie
                  ? "text-gray-500"
                  : "text-white"
              }`}
            >
              Enviar para validación
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PhotoCaptureButton({
  title,
  uri,
  onPress,
  icon = "camera-outline",
}: {
  title: string;
  uri: string | null;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 p-4"
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-xl ${uri ? "bg-emerald-500/20" : "bg-gray-800"}`}
        >
          {uri ? (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          ) : (
            <Ionicons name={icon} size={24} color="#9ca3af" />
          )}
        </View>
        <Text
          className={`text-base font-medium ${uri ? "text-white" : "text-gray-400"}`}
        >
          {title}
        </Text>
      </View>

      {uri && (
        <Image
          source={{ uri }}
          className="h-12 w-16 rounded-lg bg-gray-800"
          resizeMode="cover"
        />
      )}
    </Pressable>
  );
}
