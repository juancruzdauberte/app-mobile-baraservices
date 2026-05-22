import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCategoriesStore } from "../store/categorys.store";
import { createJobRequest } from "../lib/lib";
import { Urgencia } from "../types/types";
import GooglePlacesInput from "./GooglePlacesInput";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormState = {
  titulo: string;
  descripcion: string;
  urgencia: Urgencia;
  categoria_id: string;
  latitud: number | null;
  longitud: number | null;
  direccion_formateada: string;
  google_place_id: string;
};

type FormErrors = Partial<Record<string, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  titulo: "",
  descripcion: "",
  urgencia: "BAJA",
  categoria_id: "",
  latitud: null,
  longitud: null,
  direccion_formateada: "",
  google_place_id: "",
};

const URGENCY_CONFIG: {
  value: Urgencia;
  label: string;
  activeClasses: string;
  activeTextClasses: string;
}[] = [
  {
    value: "BAJA",
    label: "Baja",
    activeClasses: "bg-emerald-500/20 border-emerald-500",
    activeTextClasses: "text-emerald-400",
  },
  {
    value: "MEDIA",
    label: "Media",
    activeClasses: "bg-amber-500/20 border-amber-500",
    activeTextClasses: "text-amber-400",
  },
  {
    value: "ALTA",
    label: "Alta",
    activeClasses: "bg-red-500/20 border-red-500",
    activeTextClasses: "text-red-400",
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.titulo.trim()) {
    errors.titulo = "El título es obligatorio.";
  }

  if (form.descripcion.trim().length < 10) {
    errors.descripcion = "La descripción debe tener al menos 10 caracteres.";
  }

  if (!form.categoria_id) {
    errors.categoria_id = "Seleccioná una categoría.";
  }

  if (!form.google_place_id) {
    errors.address = "Seleccioná una dirección de la lista.";
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateJobRequestModal({
  visible,
  onClose,
  onSuccess,
}: Props) {
  const { categories } = useCategoriesStore();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createJobRequest({
        urgencia: form.urgencia,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria_id: form.categoria_id,
        latitud: form.latitud!,
        longitud: form.longitud!,
        direccion_formateada: form.direccion_formateada,
        google_place_id: form.google_place_id,
      });

      Toast.show({
        type: "success",
        text1: "Solicitud creada",
      });

      onSuccess?.();
      handleClose();
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error al crear la solicitud",
        text2: e?.message ?? "Intentá de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-800">
          <Text className="text-white text-xl font-bold">
            Nueva Solicitud de Trabajo
          </Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1 px-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Urgency ─────────────────────────────────────────────── */}
            <View className="mt-6 mb-5">
              <Text className="text-gray-400 text-sm font-medium mb-3">
                Urgencia
              </Text>
              <View className="flex-row gap-x-3">
                {URGENCY_CONFIG.map((item) => {
                  const isActive = form.urgencia === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => updateField("urgencia", item.value)}
                      className={`flex-1 items-center py-3 rounded-2xl border ${
                        isActive
                          ? item.activeClasses
                          : "bg-gray-900 border-gray-800"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          isActive ? item.activeTextClasses : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Category ─────────────────────────────────────────────── */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm font-medium mb-3">
                Categoría
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-row gap-x-2">
                  {(categories ?? []).map((cat) => {
                    const isActive = form.categoria_id === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => updateField("categoria_id", cat.id)}
                        className={`px-4 py-2.5 rounded-2xl border ${
                          isActive
                            ? "bg-emerald-500/20 border-emerald-500"
                            : "bg-gray-900 border-gray-800"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isActive ? "text-emerald-400" : "text-gray-400"
                          }`}
                        >
                          {cat.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              {errors.categoria_id ? (
                <Text className="text-red-500 text-xs mt-2 ml-1">
                  {errors.categoria_id}
                </Text>
              ) : null}
            </View>

            {/* ── Title ────────────────────────────────────────────────── */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm font-medium mb-3">
                Título
              </Text>
              <TextInput
                value={form.titulo}
                onChangeText={(v) => updateField("titulo", v)}
                placeholder="Ej: Reparación de cañería urgente"
                placeholderTextColor="#9ca3af"
                className={`bg-gray-900 border rounded-2xl px-4 py-4 text-white text-base ${
                  errors.titulo ? "border-red-500" : "border-gray-800"
                }`}
              />
              {errors.titulo ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.titulo}
                </Text>
              ) : null}
            </View>

            {/* ── Description ──────────────────────────────────────────── */}
            <View className="mb-5">
              <Text className="text-gray-400 text-sm font-medium mb-3">
                Descripción
              </Text>
              <TextInput
                value={form.descripcion}
                onChangeText={(v) => updateField("descripcion", v)}
                placeholder="Describí el trabajo que necesitás con el mayor detalle posible"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`bg-gray-900 border rounded-2xl px-4 py-4 text-white text-base h-28 ${
                  errors.descripcion ? "border-red-500" : "border-gray-800"
                }`}
              />
              {errors.descripcion ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.descripcion}
                </Text>
              ) : null}
            </View>

            {/* ── Address ──────────────────────────────────────────────── */}
            <View className="mb-6">
              <Text className="text-gray-400 text-sm font-medium mb-3">
                Dirección
              </Text>
              <GooglePlacesInput
                onSelect={(result) => {
                  setForm((prev) => ({
                    ...prev,
                    latitud: result.latitud,
                    longitud: result.longitud,
                    direccion_formateada: result.direccion_formateada,
                    google_place_id: result.google_place_id,
                  }));
                  if (errors.address) {
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
                error={errors.address}
              />
            </View>

            {/* ── Submit ───────────────────────────────────────────────── */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 rounded-2xl py-4 items-center justify-center mb-2"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-gray-950 font-bold text-base">
                  Publicar solicitud
                </Text>
              )}
            </TouchableOpacity>

            {/* Bottom padding */}
            <View className="h-8" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
