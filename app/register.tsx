import {
  Alert,
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
import { useState } from "react";
import Toast from "react-native-toast-message";
import { Role } from "../types/types";
import { useAuthFlowStore } from "../store/authFlow.store";
import { useAuth } from "../providers/AuthProvider";
import PhoneInput from "react-native-phone-number-input";
import { useRef } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<Role>("CLIENTE");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const phoneInput = useRef<PhoneInput>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { setPendingRole } = useAuthFlowStore();
  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (!dni || dni.length !== 8) {
      Alert.alert("Error", "El DNI debe tener exactamente 8 dígitos");
      return;
    }
    if (!telefono || telefono.length !== 10) {
      Alert.alert("Error", "El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    // Formatear teléfono con código de país
    let telefonoFormateado = telefono;
    if (telefono && phoneInput.current) {
      const callingCode = phoneInput.current.getCallingCode();
      if (callingCode) {
        // Quitar el 0 inicial del número si existe
        let numeroSinCero = telefono;
        if (telefono.startsWith("0")) {
          numeroSinCero = telefono.substring(1);
        }
        telefonoFormateado = callingCode + numeroSinCero;
      }
    }

    setLoading(true);
    try {
      // Guardar el rol en el store para que luego el auth flow sepa si hacer bootstrapCliente o Profesional
      setPendingRole(role);
      await signUp({
        email,
        password,
        nombre,
        apellido,
        rol: role,
        telefono: telefonoFormateado,
        dni,
      });

      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: "Revisa tu email para verificar tu cuenta.",
      });
      // Redirigir a la pantalla de confirmación de email
      setTimeout(
        () =>
          router.replace(`/confirm-email?email=${encodeURIComponent(email)}`),
        2000,
      );
    } catch (e: any) {
      console.error("Register Error:", e.response?.data || e.message);
      Toast.show({
        type: "error",
        text1: "Error al registrar",
        text2: e.response?.data?.message || "No se pudo registrar la cuenta",
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
            <Pressable
              onPress={() => router.back()}
              className="absolute left-8 top-0 z-10"
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </Pressable>

            <View className="mb-12 mt-8 items-center">
              <Text className="mb-2 text-4xl font-bold text-white">
                Registro
              </Text>
              <Text className="text-center text-base text-gray-400">
                Crea tu cuenta para continuar
              </Text>
            </View>

            {/* Selección de Rol */}
            <View className="mb-6 flex-row gap-4">
              <Pressable
                onPress={() => setRole("CLIENTE")}
                className={`flex-1 items-center rounded-2xl border-2 py-4 ${role === "CLIENTE" ? "border-emerald-500 bg-emerald-500/10" : "border-gray-800 bg-gray-800"}`}
              >
                <Text
                  className={`font-semibold ${role === "CLIENTE" ? "text-emerald-500" : "text-gray-400"}`}
                >
                  Cliente
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("PROFESIONAL")}
                className={`flex-1 items-center rounded-2xl border-2 py-4 ${role === "PROFESIONAL" ? "border-emerald-500 bg-emerald-500/10" : "border-gray-800 bg-gray-800"}`}
              >
                <Text
                  className={`font-semibold ${role === "PROFESIONAL" ? "text-emerald-500" : "text-gray-400"}`}
                >
                  Profesional
                </Text>
              </Pressable>
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
              <TextInput
                className="mb-4 w-full rounded-2xl bg-gray-800 px-6 py-4 text-white"
                placeholder="Nombre"
                placeholderTextColor="#9ca3af"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput
                className="mb-4 w-full rounded-2xl bg-gray-800 px-6 py-4 text-white"
                placeholder="Apellido"
                placeholderTextColor="#9ca3af"
                value={apellido}
                onChangeText={setApellido}
              />
              <TextInput
                className="mb-1 w-full rounded-2xl bg-gray-800 px-6 py-4 text-white"
                placeholder="DNI (8 dígitos)"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={8}
                value={dni}
                onChangeText={(text) => {
                  // Solo permitir números
                  const numericText = text.replace(/[^0-9]/g, "");
                  setDni(numericText);
                }}
              />
              <Text className="mb-4 text-xs text-gray-500">
                Ingresa el número sin puntos
              </Text>
              <View className="mb-1 w-full rounded-2xl bg-gray-800 px-2 py-2">
                <PhoneInput
                  ref={phoneInput}
                  defaultCode="AR"
                  layout="first"
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D/g, "");
                    if (digitsOnly.length <= 10) {
                      setTelefono(text);
                    }
                  }}
                  withShadow={false}
                  autoFocus={false}
                  textInputProps={{
                    maxLength: 10,
                    keyboardType: "phone-pad",
                  }}
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
                  codeTextStyle={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                  textInputStyle={{
                    color: "white",
                    fontSize: 16,
                    paddingLeft: 8,
                  }}
                  renderDropdownImage={
                    <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                  }
                />
              </View>
              <Text className="mb-4 text-xs text-gray-500">
                Ingresa el número sin el 15 ni el 0
              </Text>

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

              <View className="mb-4 w-full flex-row items-center rounded-2xl bg-gray-800 pr-4">
                <TextInput
                  className="flex-1 px-6 py-4 text-white"
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Botón de Registro */}
            <Pressable
              onPress={onRegister}
              disabled={loading}
              className="mb-4 w-full flex-row items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 active:bg-emerald-600"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-base font-semibold text-white">
                {loading ? "Registrando..." : "Registrarme"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
