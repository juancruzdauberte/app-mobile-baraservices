import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Expenses() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      edges={["top"]}
    >
      <Text className="text-red-400">Mis gastos</Text>
    </SafeAreaView>
  );
}
