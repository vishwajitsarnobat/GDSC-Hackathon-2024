import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FAB, Portal, PaperProvider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function HomeScreenFab({ navigation }) {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View>
          <Text style={styles.welcomeText}>Welcome to Home Screen</Text>
        </View>
        <Portal>
          <FAB.Group
            open={open}
            visible
            icon={open ? "menu" : "plus"}
            actions={[
              {
                icon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="home-outline"
                    color={color}
                    size={24}
                  />
                ),
                label: "Home",
                onPress: () => navigation.navigate("home"),
              },
              {
                icon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="bullseye-arrow"
                    color={color}
                    size={24}
                  />
                ),
                label: "Budget & Goals",
                onPress: () => navigation.navigate("BudandGoal"),
              },
              {
                icon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="currency-usd"
                    color={color}
                    size={24}
                  />
                ),
                label: "Income & Expenses",
                onPress: () => navigation.navigate("extrainc"),
              },
              {
                icon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    color={color}
                    size={24}
                  />
                ),
                label: "Portfolio",
                onPress: () => navigation.navigate("portfolio"),
              },
              {
                icon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="account-outline"
                    color={color}
                    size={24}
                  />
                ),
                label: "Profile",
                onPress: () => navigation.navigate("Profile"),
              },
            ]}
            onStateChange={onStateChange}
            onPress={() => {
              if (open) {
                // Optional: Add behavior when FAB is open
              }
            }}
          />
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
