import {
  Pressable,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../providers/AuthProvider";
import { supabase } from "../config/supabase.config";

export default function Login() {
  const { session, signOut, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  const onLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Campos vacíos",
        text2: "Por favor ingresa email y contraseña",
      });
      return;
    }
    setLoading(true);
    try {
      const data = await signIn({ email, password });

      console.log("Tokens recibidos:", data);

      if (data && data.access_token && data.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (error) throw error;
      } else {
        throw new Error("No se recibieron tokens válidos del servidor");
      }
    } catch (e: any) {
      console.error("Login Error:", e.response?.data || e.message);
      
      // Verificar si el email no está confirmado
      const errorData = e.response?.data || {};
      const errorMessage = errorData.message || e.message || "";
      const statusCode = errorData.statusCode || e.response?.status;
      
      const isEmailNotConfirmed = 
        errorMessage.toLowerCase().includes("confirm") || 
        errorMessage.toLowerCase().includes("verif") ||
        statusCode === 401;

      if (isEmailNotConfirmed) {
        // Redirigir directamente a pantalla de confirmación sin mostrar error
        router.replace(`/confirm-email?email=${encodeURIComponent(email)}`);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Error al iniciar sesión",
        text2: errorData.message || "Credenciales inválidas",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8 py-12">
            {/* Logo / App Name */}
            <View className="mb-12 items-center">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/20">
                <Ionicons name="wallet-outline" size={48} color="#10b981" />
              </View>
              <Text className="mb-2 text-4xl font-bold text-white">
                Baraservices
              </Text>
              <Text className="text-center text-base text-gray-400">
                Administrá tus servicios de forma simple y compartida
              </Text>
            </View>

            {/* Formulario */}
            <View className="mb-6 w-full">
              <TextInput
                className="mb-4 w-full rounded-2xl bg-gray-800 px-6 py-4 text-white"
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <View className="mb-4 w-full flex-row items-center rounded-2xl bg-gray-800 pr-4">
                <TextInput
                  className="flex-1 px-6 py-4 text-white"
                  placeholder="Contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Botón de inicio de sesión */}
            <Pressable
              onPress={onLogin}
              disabled={loading}
              className="mb-4 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 active:bg-emerald-600"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </Text>
            </Pressable>

            {/* Enlace para registrarse */}
            <Pressable
              onPress={() => router.push("/register")}
              className="mb-4 mt-2 w-full flex-row items-center justify-center py-4"
            >
              <Text className="text-base text-gray-400">
                ¿No tienes cuenta?{" "}
                <Text className="font-semibold text-emerald-500">
                  Regístrate
                </Text>
              </Text>
            </Pressable>

            {session && (
              <Pressable
                onPress={() => signOut()}
                style={{ marginTop: 20 }}
                className="items-center"
              >
                <Text style={{ color: "red" }}>Cerrar sesión (debug)</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
