import {
  Pressable,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../providers/AuthProvider";
import { supabase } from "../config/supabase.config";

export default function Login() {
  const { session, signOut, signIn, forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal de recuperación de contraseña
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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
      // Siempre mostrar mensaje genérico sin revelar si el usuario existe o no
      Toast.show({
        type: "error",
        text1: "Credenciales inválidas",
        text2: "El email o la contraseña son incorrectos",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRecoverPassword = async () => {
    if (!recoveryEmail) {
      Toast.show({
        type: "error",
        text1: "Campo vacío",
        text2: "Por favor ingresa tu email",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      Toast.show({
        type: "error",
        text1: "Email inválido",
        text2: "Por favor ingresa un formato de email válido",
      });
      return;
    }

    setRecoveryLoading(true);
    try {
      await forgotPassword(recoveryEmail);

      Toast.show({
        type: "success",
        text1: "Email enviado",
        text2: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
      setShowRecoveryModal(false);
      setRecoveryEmail("");
    } catch (e: any) {
      console.error("Recovery Error:", e.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.message || "No se pudo enviar el email de recuperación",
      });
    } finally {
      setRecoveryLoading(false);
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

            {/* Olvidaste tu contraseña */}
            <Pressable
              onPress={() => setShowRecoveryModal(true)}
              className="mb-4 w-full items-center py-2"
            >
              <Text className="text-base text-gray-400">
                ¿Olvidaste tu contraseña?
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

      {/* Modal de recuperación de contraseña */}
      <Modal
        visible={showRecoveryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRecoveryModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-gray-900 p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                Restablecer Contraseña
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRecoveryModal(false);
                  setRecoveryEmail("");
                }}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text className="mb-4 text-base text-gray-400">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </Text>

            <TextInput
              className="mb-6 w-full rounded-2xl bg-gray-800 px-6 py-4 text-white"
              placeholder="Tu email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
            />

            <Pressable
              onPress={onRecoverPassword}
              disabled={recoveryLoading}
              className="w-full rounded-2xl bg-emerald-500 px-6 py-4 active:bg-emerald-600"
              style={{ opacity: recoveryLoading ? 0.7 : 1 }}
            >
              <Text className="text-center text-base font-semibold text-white">
                {recoveryLoading ? "Enviando..." : "Enviar Enlace"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
