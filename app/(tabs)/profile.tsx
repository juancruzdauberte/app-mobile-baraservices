import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView>
      <View className="">
        <Text className="text-red-400">Perfil</Text>
      </View>
    </SafeAreaView>
  );
}
