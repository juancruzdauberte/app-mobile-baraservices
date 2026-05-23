import { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { createProfessionalJobs, getCategories, getProfile } from "../lib/lib";
import { useAuth } from "../providers/AuthProvider";
import { useCategoriesStore } from "../store/categorys.store";

interface JobItem {
  categoria_id: string;
  precio_base_por_hora?: number;
}

export default function CompletarPerfilProfesionalScreen() {
  const { categories, setCategories } = useCategoriesStore();
  const [selectedJobs, setSelectedJobs] = useState<JobItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  console.log(user?.user_metadata);
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar perfil del profesional
      const profileData = await getProfile();
      if (!profileData) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo obtener el perfil del profesional.",
        });
        router.back();
        return;
      }

      if (profileData.estado_perfil !== "PENDIENTE_CATEGORIAS") {
        Toast.show({
          type: "error",
          text1: "Estado inválido",
          text2: "Tu perfil no está disponible para seleccionar categorías.",
        });
        router.back();
        return;
      }

      setIsLoadingCategories(true);
      const categoriesData = await getCategories();
      console.log("Categorías:", JSON.stringify(categoriesData, null, 2));

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los datos.",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const toggleJob = (categoriaId: string) => {
    const isSelected = selectedJobs.some((j) => j.categoria_id === categoriaId);

    if (isSelected) {
      setSelectedJobs(
        selectedJobs.filter((j) => j.categoria_id !== categoriaId),
      );
    } else {
      setSelectedJobs([...selectedJobs, { categoria_id: categoriaId }]);
    }
  };

  const updatePrice = (categoriaId: string, price: string) => {
    const numPrice = parseFloat(price);
    const updated = selectedJobs.map((j) =>
      j.categoria_id === categoriaId
        ? { ...j, precio_base_por_hora: isNaN(numPrice) ? undefined : numPrice }
        : j,
    );
    setSelectedJobs(updated);
  };

  const handleSubmit = async () => {
    if (selectedJobs.length === 0) {
      Toast.show({
        type: "error",
        text1: "Selecciona al menos una categoría",
        text2: "Debes seleccionar los trabajos que ofreces.",
      });
      return;
    }

    if (!user?.id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontró el ID del profesional.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        "Enviando jobs:",
        JSON.stringify(
          { profesional_id: user.id, jobs: selectedJobs },
          null,
          2,
        ),
      );
      await createProfessionalJobs(user.id, selectedJobs);

      Toast.show({
        type: "success",
        text1: "Perfil completado",
        text2: "Tus servicios han sido guardados correctamente.",
      });

      router.replace("/(profesional)" as any);
    } catch (error: any) {
      console.error("Error al guardar trabajos:", error?.response?.data);
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2:
          error?.response?.data?.message ||
          "No se pudieron guardar los servicios.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isJobSelected = (categoriaId: string) =>
    selectedJobs.some((j) => j.categoria_id === categoriaId);

  const getJobPrice = (categoriaId: string) => {
    const job = selectedJobs.find((j) => j.categoria_id === categoriaId);
    return job?.precio_base_por_hora?.toString() || "";
  };

  if (isLoadingCategories) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-4 text-gray-400">Cargando categorías...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-6">
          {/* Header */}
          <View className="mb-6 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20">
              <Ionicons name="briefcase-outline" size={32} color="#10b981" />
            </View>
            <Text className="text-center text-2xl font-bold text-white">
              Completá tu perfil
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-400">
              Seleccioná las categorías de trabajo que ofrecés y cargá tu precio
              base por hora.
            </Text>
          </View>

          {/* Info Banner */}
          <View className="mb-6 flex-row items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Ionicons name="information-circle" size={24} color="#f59e0b" />
            <Text className="ml-3 flex-1 text-sm text-amber-200">
              Los precios son orientativos. Podés negociarlos con cada cliente.
            </Text>
          </View>

          {/* Categories List */}
          <View className="gap-4">
            {categories?.length === 0 ? (
              <View className="items-center rounded-2xl bg-gray-900 p-8">
                <Ionicons
                  name="folder-open-outline"
                  size={48}
                  color="#4b5563"
                />
                <Text className="mt-4 text-center text-gray-400">
                  No hay categorías disponibles{"\n"}
                  <Text className="text-xs text-gray-500">
                    Contactá al administrador del sistema.
                  </Text>
                </Text>
              </View>
            ) : (
              categories?.map((cat) => (
                <View
                  key={cat.id}
                  className={`rounded-2xl border p-4 ${
                    isJobSelected(cat.id)
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-gray-800 bg-gray-900"
                  }`}
                >
                  {/* Category Header */}
                  <Pressable
                    onPress={() => toggleJob(cat.id)}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`h-10 w-10 items-center justify-center rounded-xl ${
                          isJobSelected(cat.id)
                            ? "bg-emerald-500/20"
                            : "bg-gray-800"
                        }`}
                      >
                        <Ionicons
                          name={
                            isJobSelected(cat.id)
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={24}
                          color={isJobSelected(cat.id) ? "#10b981" : "#6b7280"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-white">
                          {cat.nombre}
                        </Text>
                        {cat.descripcion && (
                          <Text className="mt-1 text-xs text-gray-400">
                            {cat.descripcion}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>

                  {/* Price Input (shown when selected) */}
                  {isJobSelected(cat.id) && (
                    <View className="mt-4 flex-row items-center gap-3 border-t border-gray-800 pt-4">
                      <Text className="text-sm text-gray-400">
                        Precio por hora:
                      </Text>
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
              ))
            )}
          </View>

          {/* Summary */}
          {selectedJobs.length > 0 && (
            <View className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <Text className="mb-2 text-sm font-medium text-gray-400">
                Resumen de servicios
              </Text>
              <Text className="text-2xl font-bold text-white">
                {selectedJobs.length}{" "}
                {selectedJobs.length === 1 ? "categoría" : "categorías"}{" "}
                seleccionada{selectedJobs.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View className="border-t border-gray-800 bg-gray-950 px-6 py-4">
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || selectedJobs.length === 0}
            className={`flex-row items-center justify-center rounded-2xl p-4 ${
              selectedJobs.length === 0 || isSubmitting
                ? "bg-gray-800"
                : "bg-emerald-500 active:bg-emerald-600"
            }`}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  selectedJobs.length === 0 ? "text-gray-500" : "text-white"
                }`}
              >
                {selectedJobs.length === 0
                  ? "Seleccioná al menos una categoría"
                  : "Guardar servicios"}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
