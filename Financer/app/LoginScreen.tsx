import { View, Text, Button } from "react-native";
import React from "react";
import { router } from "expo-router";
const handleContinue = () => {
  router.push("/(tabs)/home");
};
const LoginScreen = () => {
  return (
    <View>
      <Text>LoginScreen</Text>
      <Button title="Login" onPress={handleContinue} />
    </View>
  );
};

export default LoginScreen;
