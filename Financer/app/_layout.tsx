import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="(tabs)" options={{}} />
      <Stack.Screen name="LoginScreen" options={{ title: "Login" }} />
    </Stack>
  );
}
