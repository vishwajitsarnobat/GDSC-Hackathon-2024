import React, { useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { FAB, Portal, PaperProvider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../Components/HomeScreen/Header";
import MonthlyStats from "../Components/HomeScreen/MonthlyStats";
import TopCategories from "../Components/HomeScreen/TopCategeory";

export default function HomeScreenFab({ navigation }) {
  const [state, setState] = useState({ open: false });
  const [refreshing, setRefreshing] = useState(false);

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate a network request or data fetching here
    // You can call your fetch functions for MonthlyStats and TopCategories here
    // await fetchData();
    setTimeout(() => {
      setRefreshing(false); // Stop refreshing after the operation is complete
    }, 2000); // Simulate a 2-second loading time
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Header />
          <MonthlyStats />
          <TopCategories />
        </ScrollView>
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
    marginTop: 35,
  },
  scrollViewContainer: {
    alignItems: "center",
    justifyContent: "flex-start", // You can change this to "center" if needed
    paddingBottom: 100, // Optional, for spacing at the bottom
  },
});
