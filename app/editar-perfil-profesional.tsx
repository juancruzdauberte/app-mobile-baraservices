import { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import PhoneInput, { CountryCode } from "react-native-phone-number-input";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import {
  getMyProfessionalJobs,
  getProfessionalProfile,
  getCategories,
  uploadUserAvatar,
  updateMyProfessionalProfile,
} from "../lib/lib";
import { useAuth } from "../providers/AuthProvider";
import { Category, MyProfessionalJob } from "../types/types";

// ─── Phone parsing ────────────────────────────────────────────────────────────

const PHONE_PREFIXES: [string, CountryCode][] = [
  ["598", "UY"], ["595", "PY"], ["593", "EC"], ["592", "GY"],
  ["591", "BO"], ["506", "CR"], ["505", "NI"], ["503", "SV"],
  ["502", "GT"], ["501", "BZ"],
  ["56", "CL"], ["57", "CO"], ["58", "VE"], ["55", "BR"],
  ["54", "AR"], ["53", "CU"], ["52", "MX"], ["51", "PE"],
];

function parseStoredPhone(stored: string): { country: CountryCode; local: string } {
  const digits = (stored ?? "").replace(/\D/g, "");
  if (!digits) return { country: "AR", local: "" };
  for (const [prefix, country] of PHONE_PREFIXES) {
    if (digits.startsWith(prefix)) {
      return { country, local: digits.substring(prefix.length) };
    }
  }
  return { country: "AR", local: digits };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  biografia: string;
};

type SelectedJob = {
  categoria_id: string;
  precio_base_por_hora?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditarPerfilProfesional() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const phoneInput = useRef<PhoneInput>(null);

  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    telefono: "",
    dni: "",
    biografia: "",
  });

  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [localAvatarMime, setLocalAvatarMime] = useState("image/jpeg");
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("AR");

  // ── Load initial data ─────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [proProfile, myJobs, cats] = await Promise.all([
          getProfessionalProfile(),
          getMyProfessionalJobs(),
          getCategories(),
        ]);

        const parsedPhone = parseStoredPhone(proProfile.telefono ?? "");
        setPhoneCountry(parsedPhone.country);
        setForm({
          nombre: proProfile.nombre ?? "",
          apellido: proProfile.apellido ?? "",
          telefono: parsedPhone.local,
          dni: proProfile.dni ?? "",
          biografia: proProfile.biografia ?? "",
        });

        setCurrentAvatar(profile?.avatar ?? null);

        setSelectedJobs(
          myJobs.map((j: MyProfessionalJob) => ({
            categoria_id: j.categoria_id,
            precio_base_por_hora: j.precio_base_por_hora ?? undefined,
          })),
        );

        setCategories(cats);
      } catch (e: any) {
        console.error("[EditarPerfilPro] load error:", e?.response?.status, JSON.stringify(e?.response?.data ?? e?.message));
        Toast.show({ type: "error", text1: "Error al cargar el perfil" });
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const displayAvatar = localAvatarUri ?? currentAvatar;

  function toggleJob(categoriaId: string) {
    const isSelected = selectedJobs.some((j) => j.categoria_id === categoriaId);
    if (isSelected) {
      setSelectedJobs((prev) => prev.filter((j) => j.categoria_id !== categoriaId));
    } else {
      setSelectedJobs((prev) => [...prev, { categoria_id: categoriaId }]);
    }
  }

  function updatePrice(categoriaId: string, price: string) {
    const num = parseFloat(price);
    setSelectedJobs((prev) =>
      prev.map((j) =>
        j.categoria_id === categoriaId
          ? { ...j, precio_base_por_hora: isNaN(num) ? undefined : num }
          : j,
      ),
    );
  }

  function isJobSelected(categoriaId: string) {
    return selectedJobs.some((j) => j.categoria_id === categoriaId);
  }

  function getJobPrice(categoriaId: string) {
    return (
      selectedJobs.find((j) => j.categoria_id === categoriaId)
        ?.precio_base_por_hora?.toString() ?? ""
    );
  }

  // ── Image picker ──────────────────────────────────────────────────────────

  async function pickFromCamera() {
    setShowPicker(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso denegado", "Necesitás autorizar el acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalAvatarUri(result.assets[0].uri);
      setLocalAvatarMime(result.assets[0].mimeType ?? "image/jpeg");
    }
  }

  async function pickFromGallery() {
    setShowPicker(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso denegado", "Necesitás autorizar el acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalAvatarUri(result.assets[0].uri);
      setLocalAvatarMime(result.assets[0].mimeType ?? "image/jpeg");
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      let avatarUrl: string | undefined;

      if (localAvatarUri) {
        setUploading(true);
        avatarUrl = await uploadUserAvatar(localAvatarUri, localAvatarMime);
        setUploading(false);
      }

      // Format phone number with country code
      let telefonoFormateado: string | undefined;
      if (form.telefono.trim()) {
        const callingCode = phoneInput.current?.getCallingCode();
        if (callingCode) {
          let numero = form.telefono.trim();
          if (numero.startsWith("0")) numero = numero.substring(1);
          telefonoFormateado = callingCode + numero;
        } else {
          telefonoFormateado = form.telefono.trim();
        }
      }

      await updateMyProfessionalProfile({
        nombre: form.nombre.trim() || undefined,
        apellido: form.apellido.trim() || undefined,
        telefono: telefonoFormateado,
        dni: form.dni.trim() || undefined,
        biografia: form.biografia.trim() || undefined,
        avatar: avatarUrl,
        categorias: selectedJobs,
      });

      await refreshProfile();

      Toast.show({ type: "success", text1: "Perfil actualizado" });
      router.back();
    } catch (e: any) {
      setUploading(false);
      const msg =
        e?.response?.data?.message?.[0] ??
        e?.response?.data?.message ??
        "Intentá de nuevo.";
      Toast.show({ type: "error", text1: "Error al guardar", text2: msg });
    } finally {
      setSaving(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-gray-800">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold flex-1">
            Editar perfil
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Avatar ──────────────────────────────────────────────────── */}
          <View className="items-center py-6">
            <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.8}>
              <View className="relative">
                {displayAvatar ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                  />
                ) : (
                  <View
                    className="bg-gray-800 border border-gray-700 items-center justify-center"
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                  >
                    <Ionicons name="person" size={40} color="#6b7280" />
                  </View>
                )}
                <View
                  className="absolute bottom-0 right-0 bg-emerald-500 rounded-full items-center justify-center border-2 border-gray-950"
                  style={{ width: 28, height: 28 }}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#030712" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#030712" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs mt-3">
              Tocá para cambiar la foto
            </Text>
          </View>

          {/* ── Form fields ─────────────────────────────────────────────── */}
          <View className="gap-4">
            {/* Nombre */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Nombre
              </Text>
              <TextInput
                value={form.nombre}
                onChangeText={(v) => updateField("nombre", v)}
                placeholder="Tu nombre"
                placeholderTextColor="#6b7280"
                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white text-base"
              />
            </View>

            {/* Apellido */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Apellido
              </Text>
              <TextInput
                value={form.apellido}
                onChangeText={(v) => updateField("apellido", v)}
                placeholder="Tu apellido"
                placeholderTextColor="#6b7280"
                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white text-base"
              />
            </View>

            {/* Teléfono */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Teléfono
              </Text>
              <View className="w-full rounded-2xl bg-gray-900 border border-gray-800 px-2 py-2">
                <PhoneInput
                  ref={phoneInput}
                  defaultCode={phoneCountry}
                  layout="first"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D/g, "");
                    if (digitsOnly.length <= 10) updateField("telefono", text);
                  }}
                  withShadow={false}
                  autoFocus={false}
                  textInputProps={{ maxLength: 10, keyboardType: "phone-pad" }}
                  flagButtonStyle={{
                    backgroundColor: "transparent",
                    width: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  containerStyle={{
                    width: "100%",
                    backgroundColor: "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  textContainerStyle={{
                    backgroundColor: "transparent",
                    paddingHorizontal: 0,
                    justifyContent: "center",
                  }}
                  codeTextStyle={{ color: "white", fontSize: 16, fontWeight: "600" }}
                  textInputStyle={{ color: "white", fontSize: 16, paddingLeft: 8 }}
                  renderDropdownImage={
                    <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                  }
                />
              </View>
              <Text className="mt-1 text-xs text-gray-500">
                Ingresá el número sin el 15 ni el 0
              </Text>
            </View>

            {/* DNI */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                DNI
              </Text>
              <TextInput
                value={form.dni}
                onChangeText={(v) => {
                  if (v.replace(/\D/g, "").length <= 8) updateField("dni", v);
                }}
                placeholder="12345678"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                maxLength={8}
                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white text-base"
              />
            </View>

            {/* Biografía */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Biografía
              </Text>
              <TextInput
                value={form.biografia}
                onChangeText={(v) => updateField("biografia", v)}
                placeholder="Contá un poco sobre vos y tu experiencia..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white text-base h-28"
              />
            </View>

            {/* Categorías */}
            <View>
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                Categorías de trabajo
              </Text>
              <Text className="text-gray-500 text-xs mb-3">
                Seleccioná los servicios que ofrecés y tu precio base por hora.
              </Text>
              <View className="gap-3">
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    className={`rounded-2xl border p-4 ${
                      isJobSelected(cat.id)
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-gray-800 bg-gray-900"
                    }`}
                  >
                    <Pressable
                      onPress={() => toggleJob(cat.id)}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-xl ${
                            isJobSelected(cat.id) ? "bg-emerald-500/20" : "bg-gray-800"
                          }`}
                        >
                          <Ionicons
                            name={isJobSelected(cat.id) ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={isJobSelected(cat.id) ? "#10b981" : "#6b7280"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-medium text-white">
                            {cat.nombre}
                          </Text>
                          {cat.descripcion ? (
                            <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                              {cat.descripcion}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>

                    {isJobSelected(cat.id) && (
                      <View className="mt-4 flex-row items-center gap-3 border-t border-gray-800 pt-4">
                        <Text className="text-sm text-gray-400">Precio por hora:</Text>
                        <View className="flex-1 flex-row items-center rounded-xl border border-gray-700 bg-gray-800 px-3">
                          <Text className="text-emerald-500">$</Text>
                          <TextInput
                            value={getJobPrice(cat.id)}
                            onChangeText={(text) => updatePrice(cat.id, text)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#6b7280"
                            className="ml-2 flex-1 py-3 text-white"
                          />
                          <Text className="text-sm text-gray-400">/hora</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Guardar */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-emerald-500 rounded-2xl py-4 items-center justify-center mt-2"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#030712" />
              ) : (
                <Text className="text-gray-950 font-bold text-base">
                  Guardar cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Image picker bottom sheet ──────────────────────────────────── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setShowPicker(false)}
        />
        <View className="bg-gray-900 rounded-t-3xl px-5 pt-4 pb-8">
          <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-5" />
          <Text className="text-white text-base font-bold mb-4">Foto de perfil</Text>

          <TouchableOpacity
            onPress={pickFromCamera}
            className="flex-row items-center gap-4 bg-gray-800 rounded-2xl px-4 py-4 mb-3"
          >
            <View className="w-10 h-10 bg-emerald-500/20 rounded-xl items-center justify-center">
              <Ionicons name="camera-outline" size={22} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Tomar foto</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Usar la cámara del dispositivo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickFromGallery}
            className="flex-row items-center gap-4 bg-gray-800 rounded-2xl px-4 py-4 mb-3"
          >
            <View className="w-10 h-10 bg-blue-500/20 rounded-xl items-center justify-center">
              <Ionicons name="images-outline" size={22} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Elegir de galería</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Seleccionar desde tus fotos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            className="items-center py-3.5 mt-1"
          >
            <Text className="text-gray-400 font-medium">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
