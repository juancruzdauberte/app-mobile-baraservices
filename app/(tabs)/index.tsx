import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalTabBarScroll } from "../../hooks/useGlobalTabBarScroll";
import { useAuth } from "../../providers/AuthProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCategoriesStore } from "../../store/categorys.store";
import { getCategories } from "../../lib/lib";
import { Category } from "../../types/types";

const CATEGORY_ICONS: Record<string, string> = {
  albañilería: "hammer-outline",
  cerrajería: "key-outline",
  jardinería: "leaf-outline",
  electricidad: "flash-outline",
  plomería: "water-outline",
  gasista: "flame-outline",
  pintura: "brush-outline",
  "fletes y mudanza": "cube-outline",
  climatización: "snow-outline",
};

function getCategoryIcon(nombre: string): string {
  const key = nombre.toLowerCase().trim();
  return CATEGORY_ICONS[key] ?? "construct-outline";
}
import CreateJobRequestModal from "../../components/CreateJobRequestModal";

export default function Home() {
  const scrollProps = useGlobalTabBarScroll();
  const { profile } = useAuth();
  const { categories, setCategories } = useCategoriesStore();
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    const categories = await getCategories();
    setCategories(categories);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={["top"]}>
      <ScrollView {...scrollProps} className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm font-medium">
              Bienvenido de vuelta,
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {profile?.nombre} {profile?.apellido}
            </Text>
          </View>
          <TouchableOpacity className="bg-gray-900 p-3 rounded-full border border-gray-800">
            <Ionicons name="notifications-outline" size={20} color="#f3f4f6" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-900 rounded-2xl px-4 py-3 mb-8 border border-gray-800">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="¿Qué servicio necesitás hoy?"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-white text-base font-medium"
          />
        </View>

        {/* Categories */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">Categorías</Text>
            <TouchableOpacity>
              <Text className="text-emerald-500 font-medium">Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {categories?.map((cat: Category) => (
              <TouchableOpacity
                key={cat.id}
                className="w-[31%] items-center bg-gray-900 py-4 px-2 rounded-2xl border border-gray-800 active:bg-gray-800"
              >
                <View className="bg-gray-800 p-3 rounded-full mb-2">
                  <Ionicons name={getCategoryIcon(cat.nombre) as any} size={24} color="#10b981" />
                </View>
                <Text className="text-gray-300 text-xs font-medium text-center">
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity / Banner */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">
            Oferta Especial
          </Text>
          <TouchableOpacity className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 flex-row items-center justify-between overflow-hidden active:bg-emerald-500/20">
            <View className="flex-1 pr-4">
              <Text className="text-emerald-400 font-bold text-lg mb-1">
                20% de Descuento
              </Text>
              <Text className="text-gray-300 text-sm leading-5">
                En tu primer servicio de mantenimiento de aires acondicionados.
              </Text>
            </View>
            <View className="bg-emerald-500 p-3 rounded-full">
              <Ionicons name="arrow-forward" size={20} color="#030712" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recommended Professionals Mock */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-bold">
              Profesionales Destacados
            </Text>
          </View>
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center mb-3">
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mr-4 border border-gray-700">
              <Ionicons name="person" size={24} color="#9ca3af" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Juan Pérez</Text>
              <Text className="text-gray-400 text-sm">
                Electricista • ⭐ 4.9
              </Text>
            </View>
            <TouchableOpacity className="bg-emerald-500 px-4 py-2 rounded-full">
              <Text className="text-gray-950 font-bold text-xs">Contactar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safe padding for bottom tab bar */}
        <View className="h-24" />
      </ScrollView>

      {/* FAB — Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-28 right-5 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#030712" />
      </TouchableOpacity>

      <CreateJobRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}
