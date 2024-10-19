import { router } from "expo-router";
import { Text, View, Button } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Login" onPress={() => router.push("/LoginScreen")} />
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
